import { AISLES, type Aisle, type Recipe } from '@/data/types';

export type ShoppingItem = {
  /** Stable across weeks, so ticks survive a re-render or a shuffle. */
  key: string;
  name: string;
  unit: string;
  /** Null when the ingredient has no measurable amount ("to taste"). */
  qty: number | null;
  aisle: Aisle;
  /** Recipes this line is needed for, shown as a subtitle. */
  usedIn: string[];
};

export type ShoppingSection = {
  aisle: Aisle;
  items: ShoppingItem[];
};

const itemKey = (name: string, unit: string) => `${name}::${unit}`;

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
        if (!existing.usedIn.includes(recipe.title)) existing.usedIn.push(recipe.title);
        continue;
      }

      merged.set(key, {
        key,
        name: ingredient.name,
        unit: ingredient.unit,
        qty: ingredient.qty,
        aisle: ingredient.aisle,
        usedIn: [recipe.title],
      });
    }
  }

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

/** The full amount line, e.g. "250 g" or "4" or "to taste". */
export function formatAmount(item: Pick<ShoppingItem, 'qty' | 'unit'>): string {
  if (item.qty === null) return item.unit || '';
  const amount = formatQuantity(item.qty);
  return item.unit ? `${amount} ${item.unit}` : amount;
}
