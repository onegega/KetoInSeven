/**
 * Decides whether a packaged food belongs in a keto week.
 *
 * Pure and offline: it takes numbers off a label and returns a judgement with
 * its reasons. Nothing here knows about cameras, networks or React, which is
 * what lets `scripts/verify.js` exercise every rule below without a device.
 *
 * ## Why the verdict is computed on stated carbohydrate, not net carbs
 *
 * "Net carbs" means carbohydrate minus fibre, and whether that subtraction is
 * correct depends on which country printed the label. US labels put fibre
 * *inside* total carbohydrate, so subtracting it is right. Most of the rest of
 * the world — the EU, the UK, the Gulf, Australia — already states available
 * carbohydrate with fibre excluded, so subtracting again double-counts and
 * makes the food look better than it is.
 *
 * Open Food Facts stores whatever the label said and does not reliably record
 * which convention that was. Guessing from the country of sale is fragile, and
 * the two failure directions are not equal: understating carbs tells someone a
 * food is keto when it is not.
 *
 * So the verdict is computed on the stated carbohydrate figure, which is either
 * correct (rest of world) or conservative (US, where it includes fibre). Net
 * carbs are still calculated and shown, because they are useful — but they only
 * ever soften the presentation, never the verdict.
 */

import type { UIKey } from '@/i18n/ui/en';

export type Verdict = 'keto' | 'borderline' | 'avoid' | 'unknown';

/** Nutrition as printed, per 100 g or 100 ml. */
export type Nutrition = {
  /** Carbohydrate per 100 g, as stated on the label. */
  carbs100g?: number;
  fibre100g?: number;
  sugars100g?: number;
  fat100g?: number;
  protein100g?: number;
  /** Serving size in grams, when the pack declares one. */
  servingGrams?: number;
};

export type VerdictReason = {
  /** Whether this observation argues for or against the food. */
  tone: 'good' | 'warn' | 'bad';
  /**
   * A key into the UI dictionary, plus the numbers it interpolates. Typed
   * rather than a bare string so that renaming a reason breaks the build here
   * instead of rendering the key name to the user.
   */
  key: UIKey;
  params?: Record<string, string | number>;
};

export type VerdictResult = {
  verdict: Verdict;
  /** Carbohydrate per 100 g as stated — the figure the verdict is based on. */
  carbs100g?: number;
  /** Carbs minus fibre. Informational; see the note at the top of this file. */
  netCarbs100g?: number;
  /** Carbohydrate in one declared serving, when a serving size is known. */
  carbsPerServing?: number;
  reasons: VerdictReason[];
};

/**
 * Carbohydrate density per 100 g. These are the usual keto rules of thumb: a
 * food at or under 5 g is one you can eat freely, and past 10 g it is a treat
 * that has to be measured against the whole day.
 */
const DENSITY_GOOD = 5;
const DENSITY_LIMIT = 10;

/**
 * How much of a daily carb budget one serving may take before the food stops
 * being an easy yes. A quarter leaves room for three more things plus meals.
 */
const SERVING_SHARE_GOOD = 0.25;
const SERVING_SHARE_LIMIT = 0.5;

/**
 * Sugars that appear on ingredient lists under names that do not contain the
 * word "sugar". Matched as substrings against a lowercased ingredient string.
 *
 * Sugar alcohols are deliberately absent: erythritol and allulose are the
 * sweeteners keto products are *supposed* to use, and flagging them would
 * mark every legitimate keto product as suspect.
 */
const SUGAR_ALIASES = [
  'sugar',
  'glucose',
  'dextrose',
  'fructose',
  'sucrose',
  'maltose',
  'maltodextrin',
  'corn syrup',
  'rice syrup',
  'agave',
  'honey',
  'molasses',
  'treacle',
  'invert syrup',
  'fruit juice concentrate',
];

/** How far into an ingredient list a sugar has to appear to be a headline one. */
const LEADING_INGREDIENTS = 3;

/** Sugar names found in `ingredients`, in the order they appear. */
export function findSugars(ingredients: string | undefined): { name: string; leading: boolean }[] {
  if (!ingredients?.trim()) return [];

  const parts = ingredients
    .toLowerCase()
    .split(/[,;()[\]]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const found: { name: string; leading: boolean }[] = [];
  parts.forEach((part, index) => {
    const alias = SUGAR_ALIASES.find((candidate) => part.includes(candidate));
    // "sugar-free" and "no added sugar" contain "sugar" and mean the opposite.
    if (!alias || /free|no added|without/.test(part)) return;
    if (found.some((entry) => entry.name === alias)) return;
    found.push({ name: alias, leading: index < LEADING_INGREDIENTS });
  });

  return found;
}

/**
 * @param nutrition  what the label states, per 100 g
 * @param dailyLimit the user's daily net-carb target, in grams
 * @param ingredients the ingredient list, when the product declares one
 */
export function ketoVerdict(
  nutrition: Nutrition,
  dailyLimit: number,
  ingredients?: string
): VerdictResult {
  const { carbs100g, fibre100g, sugars100g, servingGrams } = nutrition;
  const reasons: VerdictReason[] = [];

  const netCarbs100g =
    carbs100g !== undefined && fibre100g !== undefined
      ? Math.max(0, round1(carbs100g - fibre100g))
      : undefined;

  const carbsPerServing =
    carbs100g !== undefined && servingGrams !== undefined
      ? round1((carbs100g * servingGrams) / 100)
      : undefined;

  if (carbs100g === undefined) {
    return {
      verdict: 'unknown',
      carbs100g,
      netCarbs100g,
      carbsPerServing,
      reasons: [{ tone: 'warn', key: 'scan.reasonNoCarbs' }],
    };
  }

  // Density: is this a keto food at all?
  let density: Verdict;
  if (carbs100g <= DENSITY_GOOD) {
    density = 'keto';
    reasons.push({ tone: 'good', key: 'scan.reasonLowDensity', params: { count: round1(carbs100g) } });
  } else if (carbs100g <= DENSITY_LIMIT) {
    density = 'borderline';
    reasons.push({ tone: 'warn', key: 'scan.reasonMidDensity', params: { count: round1(carbs100g) } });
  } else {
    density = 'avoid';
    reasons.push({ tone: 'bad', key: 'scan.reasonHighDensity', params: { count: round1(carbs100g) } });
  }

  // Portion: even a dense food can be fine in the amount actually eaten, and a
  // mild one can blow the budget if the serving is large.
  let portion: Verdict | undefined;
  if (carbsPerServing !== undefined && dailyLimit > 0) {
    const share = carbsPerServing / dailyLimit;
    if (share <= SERVING_SHARE_GOOD) {
      portion = 'keto';
      reasons.push({
        tone: 'good',
        key: 'scan.reasonSmallServing',
        params: { count: carbsPerServing, limit: dailyLimit },
      });
    } else if (share <= SERVING_SHARE_LIMIT) {
      portion = 'borderline';
      reasons.push({
        tone: 'warn',
        key: 'scan.reasonMidServing',
        params: { count: carbsPerServing, limit: dailyLimit },
      });
    } else {
      portion = 'avoid';
      reasons.push({
        tone: 'bad',
        key: 'scan.reasonBigServing',
        params: { count: carbsPerServing, limit: dailyLimit },
      });
    }
  }

  // A dense food in a small portion is a "measure it" case, not a free pass —
  // which is why the two signals are averaged rather than letting portion win.
  let verdict = portion === undefined ? density : combine(density, portion);

  if (sugars100g !== undefined && sugars100g > DENSITY_GOOD) {
    reasons.push({ tone: 'bad', key: 'scan.reasonSugars', params: { count: round1(sugars100g) } });
    verdict = worse(verdict, 'avoid');
  }

  const sugars = findSugars(ingredients);
  const leading = sugars.find((entry) => entry.leading);
  if (leading) {
    reasons.push({ tone: 'bad', key: 'scan.reasonSugarFirst' });
    verdict = worse(verdict, 'avoid');
  } else if (sugars.length > 0) {
    reasons.push({ tone: 'warn', key: 'scan.reasonSugarListed' });
    verdict = worse(verdict, 'borderline');
  }

  if (netCarbs100g !== undefined && netCarbs100g < carbs100g) {
    reasons.push({
      tone: 'good',
      key: 'scan.reasonFibre',
      params: { count: netCarbs100g, fibre: round1(fibre100g ?? 0) },
    });
  }

  return { verdict, carbs100g: round1(carbs100g), netCarbs100g, carbsPerServing, reasons };
}

const ORDER: Record<Exclude<Verdict, 'unknown'>, number> = { keto: 0, borderline: 1, avoid: 2 };
const RANKED: Exclude<Verdict, 'unknown'>[] = ['keto', 'borderline', 'avoid'];

/**
 * Combines the density and portion verdicts by averaging them, rounding towards
 * caution on a tie.
 *
 * The averaging is the point: a dense food in a tiny serving lands on
 * "borderline" rather than either extreme, which is the honest answer — it is
 * fine if you measure it and a problem if you do not. Letting the portion
 * verdict simply win would wave through a chocolate bar sold in 15 g pieces.
 */
function combine(a: Verdict, b: Verdict): Verdict {
  if (a === 'unknown' || b === 'unknown') return 'unknown';
  return RANKED[Math.round((ORDER[a] + ORDER[b]) / 2)];
}

function worse(a: Verdict, b: Verdict): Verdict {
  if (a === 'unknown') return b;
  if (b === 'unknown') return a;
  return ORDER[a] >= ORDER[b] ? a : b;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
