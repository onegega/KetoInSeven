import type { Ingredient, Recipe } from '@/data/types';

import type { Locale } from '../locales';
import { ar } from './ar';
import { es } from './es';
import { fr } from './fr';
import { emptyRecipeLocale, type RecipeLocaleData } from './types';

const RECIPE_DATA: Record<Locale, RecipeLocaleData> = {
  en: emptyRecipeLocale(), // English is the source; nothing to look up.
  ar,
  es,
  fr,
};

/**
 * Translators for recipe content. Each falls back to the English source, so a
 * key that has not been translated yet still reads correctly.
 */
export type RecipeTranslator = {
  title: (recipe: Recipe) => string;
  blurb: (recipe: Recipe) => string;
  steps: (recipe: Recipe) => string[];
  ingredientName: (name: string) => string;
  unit: (unit: string) => string;
  note: (note: string) => string;
  tag: (tag: string) => string;
  /** Full ingredient with its name and note already translated. */
  ingredient: (ingredient: Ingredient) => { name: string; note?: string };
};

export function createRecipeTranslator(locale: Locale): RecipeTranslator {
  const data = RECIPE_DATA[locale] ?? emptyRecipeLocale();

  const lookup = (map: Record<string, string>, source: string) => map[source] ?? source;

  return {
    title: (recipe) => data.recipes[recipe.id]?.title ?? recipe.title,
    blurb: (recipe) => data.recipes[recipe.id]?.blurb ?? recipe.blurb,
    steps: (recipe) => {
      const translated = data.recipes[recipe.id]?.steps;
      // A step list of the wrong length means the translation drifted from the
      // recipe; showing English in full beats showing a mismatched mixture.
      return translated && translated.length === recipe.steps.length ? translated : recipe.steps;
    },
    ingredientName: (name) => lookup(data.ingredients, name),
    unit: (unit) => lookup(data.units, unit),
    note: (note) => lookup(data.notes, note),
    tag: (tag) => lookup(data.tags, tag),
    ingredient: (ingredient) => ({
      name: lookup(data.ingredients, ingredient.name),
      note: ingredient.note ? lookup(data.notes, ingredient.note) : undefined,
    }),
  };
}

export type { RecipeLocaleData, RecipeText } from './types';
