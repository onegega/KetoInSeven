import type { RecipeText } from '../types';

import { frBreakfast } from './fr-breakfast';
import { frLunch } from './fr-lunch';
import { frDinner } from './fr-dinner';
import { frSnack } from './fr-snack';

/**
 * Per-recipe prose in fr, keyed by recipe id, assembled from one file per meal
 * slot so each can be worked on independently.
 *
 * A recipe missing here falls back to English in full. Step arrays must have
 * exactly as many entries as the English source — verify rejects any that do
 * not, since a mismatched list would render a mixture of the two languages.
 */
export const frProse: Record<string, RecipeText> = {
  ...frBreakfast,
  ...frLunch,
  ...frDinner,
  ...frSnack,
};
