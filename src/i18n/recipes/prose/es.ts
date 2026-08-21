import type { RecipeText } from '../types';

import { esBreakfast } from './es-breakfast';
import { esLunch } from './es-lunch';
import { esDinner } from './es-dinner';

/**
 * Per-recipe prose in es, keyed by recipe id, assembled from one file per meal
 * slot so each can be worked on independently.
 *
 * A recipe missing here falls back to English in full. Step arrays must have
 * exactly as many entries as the English source — verify rejects any that do
 * not, since a mismatched list would render a mixture of the two languages.
 */
export const esProse: Record<string, RecipeText> = {
  ...esBreakfast,
  ...esLunch,
  ...esDinner,
};
