/** Per-recipe prose that cannot be shared between recipes. */
export type RecipeText = {
  title: string;
  blurb: string;
  /** Method steps, in order. Length must match the English recipe. */
  steps: string[];
};

/**
 * One language's recipe content.
 *
 * The shared maps are keyed by the *English* source string, because English
 * stays the canonical data in `src/data/recipes`. Only display is translated:
 * shopping-list merging, diet filtering and the plan seed all keep working on
 * the English values, so switching language never changes which recipes you
 * get or how ingredients combine.
 *
 * Every map is partial. A missing entry falls back to the English source rather
 * than rendering blank, so a half-finished language degrades readably.
 */
export type RecipeLocaleData = {
  ingredients: Record<string, string>;
  units: Record<string, string>;
  notes: Record<string, string>;
  tags: Record<string, string>;
  recipes: Record<string, RecipeText>;
};

export const emptyRecipeLocale = (): RecipeLocaleData => ({
  ingredients: {},
  units: {},
  notes: {},
  tags: {},
  recipes: {},
});
