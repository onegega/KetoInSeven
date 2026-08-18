import type { DietTag, MealSlot, Recipe } from '../types';
import { BREAKFAST } from './breakfast';
import { DINNER } from './dinner';
import { LUNCH } from './lunch';
import { SNACK } from './snack';

/**
 * The complete bundled library. Everything ships with the app, so the weekly
 * plan works with no network and no API key.
 *
 * To add your own recipe: append it to the matching slot file. The only hard
 * requirement is a unique `id` — saved recipes and shopping-list ticks are
 * keyed by it, so never reuse or renumber an id that has shipped.
 */
export const ALL_RECIPES: Recipe[] = [...BREAKFAST, ...LUNCH, ...DINNER, ...SNACK];

const BY_ID = new Map(ALL_RECIPES.map((recipe) => [recipe.id, recipe]));

export const getRecipe = (id: string): Recipe | undefined => BY_ID.get(id);

export const recipesForSlot = (slot: MealSlot): Recipe[] =>
  ALL_RECIPES.filter((recipe) => recipe.slot === slot);

/** Recipes carrying every one of the required diet flags. */
export const filterByDiet = (recipes: Recipe[], required: DietTag[]): Recipe[] =>
  required.length === 0
    ? recipes
    : recipes.filter((recipe) => required.every((tag) => recipe.diet.includes(tag)));

export { BREAKFAST, LUNCH, DINNER, SNACK };
