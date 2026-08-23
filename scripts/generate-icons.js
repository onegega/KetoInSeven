/**
 * Generates the app icons as flat PNGs, with no image tooling installed.
 *
 * The mark is an avocado cross-section: skin, flesh, stone. Run with
 * `node scripts/generate-icons.js` after changing any of the colours below —
 * the generated PNGs are committed, so this only needs re-running by hand.
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'images');

const SKIN = [47, 107, 69, 255]; // #2F6B45
const FLESH = [232, 243, 216, 255]; // #E8F3D8
const STONE = [138, 90, 50, 255]; // #8A5A32
const WHITE = [255, 255, 255, 255];
const CLEAR = [0, 0, 0, 0];

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/**
 * `alpha: false` writes a truecolour PNG with no alpha channel at all.
 *
 * That is not a size optimisation. Apple rejects an app icon that carries an
 * alpha channel (ITMS-90717), even when every pixel in it is fully opaque, so
 * the iOS icon has to be encoded without one.
 */
function encodePNG(size, pixels, alpha) {
  const channels = alpha ? 4 : 3;
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = alpha ? 6 : 2; // truecolour with alpha, or truecolour
  // 10-12 stay zero: deflate, adaptive filtering, no interlace.

  // One filter byte (0 = None) in front of every scanline.
  const stride = size * channels + 1;
  const raw = Buffer.alloc(size * stride);

  for (let y = 0; y < size; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0;

    if (alpha) {
      pixels.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4);
      continue;
    }

    for (let x = 0; x < size; x++) {
      const from = (y * size + x) * 4;
      const to = rowStart + 1 + x * 3;
      raw[to] = pixels[from];
      raw[to + 1] = pixels[from + 1];
      raw[to + 2] = pixels[from + 2];
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Paints concentric circles onto a square canvas, sampling 3x3 per pixel so
 * the edges are antialiased rather than jagged.
 */
function render(size, background, circles, alpha) {
  const pixels = Buffer.alloc(size * size * 4);
  const centre = size / 2;
  const SAMPLES = 3;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const accumulator = [0, 0, 0, 0];

      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const px = x + (sx + 0.5) / SAMPLES - centre;
          const py = y + (sy + 0.5) / SAMPLES - centre;
          const distance = Math.hypot(px, py);

          let colour = background;
          for (const circle of circles) {
            if (distance <= circle.radius * size) {
              colour = circle.colour;
              break;
            }
          }

          for (let i = 0; i < 4; i++) accumulator[i] += colour[i];
        }
      }

      const offset = (y * size + x) * 4;
      const total = SAMPLES * SAMPLES;
      for (let i = 0; i < 4; i++) pixels[offset + i] = Math.round(accumulator[i] / total);
    }
  }

  return encodePNG(size, pixels, alpha);
}

// Innermost circle first — render() takes the first radius that contains the sample.
const avocado = [
  { radius: 0.115, colour: STONE },
  { radius: 0.34, colour: FLESH },
];

const targets = [
  // The iOS icon must be opaque — see encodePNG.
  { file: 'icon.png', size: 1024, background: SKIN, circles: avocado, alpha: false },
  { file: 'favicon.png', size: 64, background: SKIN, circles: avocado, alpha: false },
  { file: 'android-icon-background.png', size: 1024, background: SKIN, circles: [], alpha: false },
  // These three are composited over something else, so they need transparency.
  { file: 'splash-icon.png', size: 512, background: CLEAR, circles: avocado, alpha: true },
  { file: 'android-icon-foreground.png', size: 1024, background: CLEAR, circles: avocado, alpha: true },
  {
    file: 'android-icon-monochrome.png',
    size: 1024,
    background: CLEAR,
    alpha: true,
    circles: [
      { radius: 0.115, colour: CLEAR },
      { radius: 0.34, colour: WHITE },
    ],
  },
];

for (const target of targets) {
  const png = render(target.size, target.background, target.circles, target.alpha);
  fs.writeFileSync(path.join(OUT_DIR, target.file), png);
  console.log(
    `wrote ${target.file} (${target.size}px, ${target.alpha ? 'RGBA' : 'RGB'}, ${png.length} bytes)`
  );
}
