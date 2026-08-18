/** Shared types for the bundled recipe library. */

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Supermarket sections, used to group the weekly shopping list. Order here is
 * the order they appear on the list.
 */
export const AISLES = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Pantry',
  'Spices',
  'Frozen',
] as const;

export type Aisle = (typeof AISLES)[number];

/**
 * Dietary flags a recipe *satisfies*. A recipe tagged `dairyFree` contains no
 * dairy; the absence of a tag means the recipe does contain it. Preferences
 * filter the library down to recipes carrying every flag the user asked for.
 */
export type DietTag =
  | 'dairyFree'
  | 'nutFree'
  | 'eggFree'
  | 'porkFree'
  | 'seafoodFree'
  | 'vegetarian';

export type Ingredient = {
  /** Canonical name, lowercase — matching names merge on the shopping list. */
  name: string;
  /** Amount for the recipe's stated `servings`. Null for "to taste" items. */
  qty: number | null;
  /** Unit for `qty`. Empty string for countable items ("2 eggs"). */
  unit: string;
  aisle: Aisle;
  /** Optional prep note shown on the recipe, ignored by the shopping list. */
  note?: string;
};

export type Macros = {
  calories: number;
  /** Grams of fat per serving. */
  fat: number;
  /** Grams of protein per serving. */
  protein: number;
  /** Grams of net carbs (total carbs minus fiber) per serving. */
  netCarbs: number;
  /** Grams of fiber per serving. */
  fiber: number;
};

export type Recipe = {
  id: string;
  title: string;
  slot: MealSlot;
  /** One-line pitch shown on the card. */
  blurb: string;
  emoji: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  macros: Macros;
  diet: DietTag[];
  /** Free-form descriptors surfaced as chips, e.g. "one-pan", "meal-prep". */
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
};

export const totalMinutes = (recipe: Recipe) => recipe.prepMinutes + recipe.cookMinutes;
