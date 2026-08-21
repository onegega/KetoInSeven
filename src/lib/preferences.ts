import type { DietTag, MealSlot } from '@/data/types';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales';
import type { WeekStartDay } from '@/lib/week';

export type Reminder = {
  enabled: boolean;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  hour: number;
  minute: number;
};

export type Preferences = {
  /** Interface language, and the language recipes are shown in. */
  locale: Locale;
  weekStartsOn: WeekStartDay;
  /** Diet flags every planned recipe must carry. */
  diet: DietTag[];
  /** Target net carbs per day, in grams. Drives which recipes are eligible. */
  netCarbLimit: number;
  /** Which meals to plan each day, in the order they are shown. */
  meals: MealSlot[];
  /** Adds one snack recipe alongside the week. */
  includeSnack: boolean;
  reminder: Reminder;
};

export const DEFAULT_PREFERENCES: Preferences = {
  locale: DEFAULT_LOCALE,
  weekStartsOn: 1,
  diet: [],
  netCarbLimit: 25,
  meals: ['breakfast', 'lunch', 'dinner'],
  includeSnack: true,
  reminder: { enabled: false, weekday: 0, hour: 9, minute: 0 },
};

export const DIET_ORDER: DietTag[] = [
  'dairyFree',
  'nutFree',
  'eggFree',
  'porkFree',
  'seafoodFree',
  'vegetarian',
];

export const CARB_LIMIT_OPTIONS = [15, 20, 25, 30, 40];

/**
 * Everything that changes which recipes are eligible. Used as part of the plan
 * seed, so editing a preference reshuffles the week instead of leaving stale
 * meals that no longer match the filters.
 */
export function preferencesSignature(prefs: Preferences): string {
  return [
    [...prefs.diet].sort().join(','),
    prefs.netCarbLimit,
    prefs.meals.join(','),
    prefs.includeSnack ? 'snack' : 'nosnack',
  ].join('|');
}
