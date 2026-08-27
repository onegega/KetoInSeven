/**
 * Looks a barcode up in Open Food Facts.
 *
 * This is the app's only network call. Everything else — the weekly plan, the
 * recipes, the shopping list — is bundled and works on a plane; the scanner is
 * the one feature that cannot be, because no offline database of the world's
 * packaged food would fit in an app bundle.
 *
 * Open Food Facts is free, open data and needs no key or account, which keeps
 * the app's "no sign-up" promise intact. It asks callers to identify
 * themselves in the User-Agent so it can contact the author about a misbehaving
 * client rather than silently blocking it.
 *
 * Coverage is uneven by region: European products are well covered, and Gulf
 * and Middle Eastern shelves much less so. A miss is a normal outcome here, not
 * an error, and `lookupBarcode` reports it as such.
 */

import type { Nutrition } from './keto-verdict';

const ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product';

/** Only the fields the verdict needs, so the response stays small on mobile data. */
const FIELDS = [
  'product_name',
  'brands',
  'quantity',
  'serving_size',
  'serving_quantity',
  'image_front_small_url',
  'nutriments',
  'ingredients_text',
].join(',');

const USER_AGENT = 'KetoInSeven - iOS - https://github.com/onegega/KetoInSeven';

/** How long to wait before deciding the shop's wifi is not going to answer. */
const TIMEOUT_MS = 8000;

export type Product = {
  barcode: string;
  name?: string;
  brand?: string;
  /** Pack size as printed, e.g. "330 ml". */
  quantity?: string;
  imageUrl?: string;
  ingredients?: string;
  nutrition: Nutrition;
};

export type LookupResult =
  | { status: 'found'; product: Product }
  | { status: 'not-found' }
  | { status: 'offline' }
  | { status: 'error' };

export async function lookupBarcode(barcode: string): Promise<LookupResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });

    // The v2 API answers 404 for a barcode it has never seen, which is an
    // ordinary result rather than a failure worth apologising for.
    if (response.status === 404) return { status: 'not-found' };
    if (!response.ok) return { status: 'error' };

    const body = (await response.json()) as OffResponse;
    if (body.status === 0 || !body.product) return { status: 'not-found' };

    return { status: 'found', product: normaliseProduct(barcode, body.product) };
  } catch (error) {
    // `AbortError` is our own timeout firing and a `TypeError` is fetch failing
    // to reach the host: both mean "no answer", and both deserve the same "you
    // may be offline" message. Anything else — a malformed body, say — is the
    // service misbehaving, which is a different thing to tell someone.
    const name = error instanceof Error ? error.name : '';
    return name === 'AbortError' || name === 'TypeError' ? { status: 'offline' } : { status: 'error' };
  } finally {
    clearTimeout(timer);
  }
}

export type OffProduct = NonNullable<OffResponse['product']>;

type OffResponse = {
  status?: number;
  product?: {
    product_name?: string;
    brands?: string;
    quantity?: string;
    serving_size?: string;
    serving_quantity?: number | string;
    image_front_small_url?: string;
    ingredients_text?: string;
    nutriments?: Record<string, unknown>;
  };
};

/**
 * Turns one Open Food Facts entry into the shape the verdict engine expects.
 *
 * Exported for `scripts/verify.js`, which cannot reach the network but can
 * still hold this to a set of recorded responses — and the awkward parts of
 * this file are all in here rather than in the fetch: entries are
 * community-edited, so a nutriment can be a number, a numeric string, missing,
 * or nonsense, and a serving size is as likely to be "30 g (about 12 crisps)"
 * as a clean figure.
 */
export function normaliseProduct(barcode: string, raw: OffProduct): Product {
  const n = raw.nutriments ?? {};

  return {
    barcode,
    name: text(raw.product_name),
    brand: text(raw.brands),
    quantity: text(raw.quantity),
    imageUrl: text(raw.image_front_small_url),
    ingredients: text(raw.ingredients_text),
    nutrition: {
      carbs100g: num(n.carbohydrates_100g),
      fibre100g: num(n.fiber_100g),
      sugars100g: num(n.sugars_100g),
      fat100g: num(n.fat_100g),
      protein100g: num(n.proteins_100g),
      servingGrams: servingGrams(raw.serving_quantity, raw.serving_size),
    },
  };
}

/**
 * Open Food Facts gives `serving_quantity` in grams when it managed to parse
 * the pack, and leaves it out when it did not — in which case `serving_size` is
 * free text like "30 g (about 12 crisps)" and the leading number is the best
 * available guess.
 */
function servingGrams(quantity: unknown, size: unknown): number | undefined {
  const parsed = num(quantity);
  if (parsed !== undefined && parsed > 0) return parsed;

  const label = text(size);
  if (!label) return undefined;

  const match = label.match(/([\d.]+)\s*(g|ml)\b/i);
  if (!match) return undefined;

  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/** Nutriment values arrive as numbers or numeric strings depending on the entry. */
function num(value: unknown): number | undefined {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
