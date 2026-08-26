/**
 * Checks every foreground/background pairing the UI actually draws.
 *
 * A palette is easy to admire in isolation and easy to get wrong in place: the
 * moment cards became darker than the page, every muted colour lost some of the
 * headroom it had against white. This file encodes where each colour is really
 * used so that a future tweak to one token fails loudly instead of quietly
 * making a label unreadable.
 *
 * Ratios follow WCAG 2.1 contrast: 4.5:1 for body text, 3:1 for large text
 * (>=18.7px bold or >=24px) and for non-text marks that carry meaning on their
 * own, such as the macro bar segments.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

const BODY = 4.5;
const LARGE = 3;

function channel(value) {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Pairings the app actually renders, as [foreground, background, minimum]. */
function pairings(c) {
  const onPage = ['background'];
  const onCard = ['surface', 'surfaceAlt'];
  const surfaces = [...onPage, ...onCard];
  const pairs = [];

  // Text tiers must hold on the page and on every card fill.
  for (const bg of surfaces) {
    pairs.push(['text', bg, BODY]);
    pairs.push(['textSecondary', bg, BODY]);
    // Muted is used only for de-emphasised labels at small sizes, which still
    // have to be legible — the same bar as body text.
    pairs.push(['textMuted', bg, BODY]);
    pairs.push(['accent', bg, BODY]);
    pairs.push(['danger', bg, BODY]);
    for (const slot of ['breakfast', 'lunch', 'dinner', 'snack']) {
      pairs.push([slot, bg, BODY]);
    }
  }

  // Filled surfaces and the text that sits on them.
  pairs.push(['accentText', 'accent', BODY]);
  pairs.push(['inverseText', 'inverseSurface', BODY]);
  pairs.push(['inverseTextMuted', 'inverseSurface', BODY]);
  pairs.push(['text', 'accentSoft', BODY]);
  pairs.push(['accent', 'accentSoft', BODY]);

  // Non-text marks: the macro bar segments and the vivid green fill only have
  // to be distinguishable from the surface behind them.
  for (const bg of surfaces) {
    for (const macro of ['fat', 'protein', 'carb']) pairs.push([macro, bg, LARGE]);
  }

  // A card has to be visible against the page without a border, and a nested
  // row against its card. This is the rule the whole palette rests on.
  pairs.push(['surface', 'background', 1.08]);
  pairs.push(['surfaceAlt', 'surface', 1.06]);

  return pairs.map(([fg, bg, min]) => ({ fg, bg, min, ratio: contrast(c[fg], c[bg]) }));
}

function readPalette() {
  const source = readFileSync(join(__dirname, '..', 'src', 'constants', 'theme.ts'), 'utf8');
  const themes = {};
  for (const scheme of ['light', 'dark']) {
    const block = source.match(new RegExp(`${scheme}: \\{([\\s\\S]*?)\\n  \\},`));
    if (!block) throw new Error(`could not find the ${scheme} palette in theme.ts`);
    const colors = {};
    for (const [, key, hex] of block[1].matchAll(/(\w+): '(#[0-9A-Fa-f]{6})'/g)) {
      colors[key] = hex;
    }
    themes[scheme] = colors;
  }
  return themes;
}

/** Every pairing for every scheme, with the ratio it achieves. */
function evaluate() {
  const themes = readPalette();
  return Object.entries(themes).map(([scheme, colors]) => ({
    scheme,
    results: pairings(colors),
  }));
}

module.exports = { evaluate, contrast, pairings, readPalette };

if (require.main === module) {
  let failed = 0;
  for (const { scheme, results } of evaluate()) {
    const bad = results.filter((r) => r.ratio < r.min);
    for (const r of bad) {
      console.log(`  FAIL  ${scheme}: ${r.fg} on ${r.bg} is ${r.ratio.toFixed(2)}:1, needs ${r.min}:1`);
    }
    failed += bad.length;
    if (bad.length === 0) {
      console.log(`  ok    ${scheme}: all ${results.length} colour pairings meet contrast`);
    }
  }
  process.exit(failed > 0 ? 1 : 0);
}
