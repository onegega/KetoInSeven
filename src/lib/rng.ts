/**
 * Tiny seeded PRNG.
 *
 * The weekly plan has to be *stable*: reopening the app on Thursday must show
 * the same meals it showed on Monday, on any device, with no server. So rather
 * than storing a plan, we derive it from a seed string (week + preferences +
 * shuffle count) and regenerate it identically every time.
 */

/** cyrb128 — string to a well-mixed 32-bit seed. */
function hashSeed(seed: string): number {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;

  for (let i = 0; i < seed.length; i++) {
    const k = seed.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }

  return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

/** mulberry32 — fast, good enough for shuffling a recipe list. */
export function createRandom(seed: string): () => number {
  let a = hashSeed(seed);

  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates against a seeded source. Returns a new array. */
export function seededShuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = items.slice();

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
}
