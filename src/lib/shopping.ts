import { AISLES, type Aisle, type Recipe } from '@/data/types';

export type ShoppingItem = {
  /** Stable across weeks, so ticks survive a re-render or a shuffle. */
  key: string;
  name: string;
  unit: string;
  /** Null when the ingredient has no measurable amount ("to taste"). */
  qty: number | null;
  aisle: Aisle;
  /**
   * Ids of the recipes this line is needed for. Ids rather than titles, so the
   * subtitle can be rendered in whatever language is selected.
   */
  usedIn: string[];
};

export type ShoppingSection = {
  aisle: Aisle;
  items: ShoppingItem[];
};

/**
 * Units that are counted rather than measured, and so have a plural form. The
 * recipe files write whichever reads naturally in context ("2 cloves", "1
 * clove"), which would otherwise split one ingredient across two shopping
 * lines, so both the merge key and the display go through here.
 */
const COUNTABLE_UNITS = [
  'clove',
  'head',
  'stick',
  'sprig',
  'rasher',
  'bunch',
  'fillet',
  'slice',
  'wedge',
  'sheet',
];

/** "large heads" -> "large head". Only the final word is ever inflected. */
export function singulariseUnit(unit: string): string {
  const words = unit.trim().split(' ');
  const last = words[words.length - 1].toLowerCase();

  const singular = last.endsWith('es') && last.slice(0, -2).endsWith('ch')
    ? last.slice(0, -2)
    : last.endsWith('s')
      ? last.slice(0, -1)
      : last;

  if (singular !== last && COUNTABLE_UNITS.includes(singular)) {
    words[words.length - 1] = singular;
    return words.join(' ');
  }

  return unit.trim();
}

/** "small bunch" with 3 of them -> "small bunches". */
function pluraliseUnit(unit: string, qty: number): string {
  if (qty <= 1) return unit;

  const words = unit.split(' ');
  const last = words[words.length - 1].toLowerCase();
  if (!COUNTABLE_UNITS.includes(last)) return unit;

  // Sibilant endings take -es; everything else in the list takes -s.
  words[words.length - 1] = last.endsWith('ch') ? `${last}es` : `${last}s`;
  return words.join(' ');
}

const itemKey = (name: string, unit: string) => `${name}::${singulariseUnit(unit)}`;

/**
 * Rolls a set of recipes into one list, merging ingredients that share a name
 * and unit. Different units for the same ingredient stay on separate lines
 * rather than being converted — guessing that 1 tbsp of oil is 15ml is the kind
 * of silent conversion that makes a shopping list untrustworthy.
 */
export function buildShoppingList(recipes: Recipe[]): ShoppingSection[] {
  const merged = new Map<string, ShoppingItem>();

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = itemKey(ingredient.name, ingredient.unit);
      const existing = merged.get(key);

      if (existing) {
        existing.qty =
          existing.qty === null || ingredient.qty === null
            ? existing.qty ?? ingredient.qty
            : existing.qty + ingredient.qty;
        if (!existing.usedIn.includes(recipe.id)) existing.usedIn.push(recipe.id);
        continue;
      }

      merged.set(key, {
        key,
        name: ingredient.name,
        unit: singulariseUnit(ingredient.unit),
        qty: ingredient.qty,
        aisle: ingredient.aisle,
        usedIn: [recipe.id],
      });
    }
  }

  // Sorted by the English name here only for a stable default; the screen
  // re-sorts by the translated name so the list reads alphabetically in
  // whichever language it is being shown in.
  return AISLES.map((aisle) => ({
    aisle,
    items: [...merged.values()]
      .filter((item) => item.aisle === aisle)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((section) => section.items.length > 0);
}

export function countItems(sections: ShoppingSection[]): number {
  return sections.reduce((total, section) => total + section.items.length, 0);
}

const VULGAR_FRACTIONS: Record<string, string> = {
  '0.25': '¼',
  '0.5': '½',
  '0.75': '¾',
  '0.33': '⅓',
  '0.67': '⅔',
};

/** "1.5" → "1½", "0.5" → "½", "2" → "2". */
export function formatQuantity(qty: number): string {
  const whole = Math.floor(qty);
  const remainder = Number((qty - whole).toFixed(2));
  const fraction = VULGAR_FRACTIONS[String(remainder)];

  if (fraction) return whole === 0 ? fraction : `${whole}${fraction}`;

  return String(Number(qty.toFixed(2)));
}

/**
 * The full amount line, e.g. "250 g", "4", "3 small bunches" or "to taste".
 *
 * `translateUnit` renders the unit in the selected language. Inflection runs on
 * the English source first, so the plural rules above stay meaningful, and the
 * already-inflected result is what gets looked up.
 */
export function formatAmount(
  item: Pick<ShoppingItem, 'qty' | 'unit'>,
  translateUnit: (unit: string) => string = (unit) => unit
): string {
  if (item.qty === null) return translateUnit(item.unit) || '';

  const amount = formatQuantity(item.qty);
  const unit = translateUnit(pluraliseUnit(singulariseUnit(item.unit), item.qty));

  return unit ? `${amount} ${unit}` : amount;
}
