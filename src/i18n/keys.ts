/**
 * Maps the app's domain enums onto dictionary keys, so a screen never has to
 * build a key by string concatenation — every lookup here is checked by the
 * compiler against the English dictionary.
 */

import type { Aisle, DietTag, MealSlot } from '@/data/types';

import type { UIKey } from './ui/en';

export const DIET_KEY: Record<DietTag, UIKey> = {
  dairyFree: 'diet.dairyFree',
  nutFree: 'diet.nutFree',
  eggFree: 'diet.eggFree',
  porkFree: 'diet.porkFree',
  seafoodFree: 'diet.seafoodFree',
  vegetarian: 'diet.vegetarian',
};

export const SLOT_KEY: Record<MealSlot, UIKey> = {
  breakfast: 'slot.breakfast',
  lunch: 'slot.lunch',
  dinner: 'slot.dinner',
  snack: 'slot.snack',
};

export const AISLE_KEY: Record<Aisle, UIKey> = {
  Produce: 'aisle.produce',
  'Meat & Seafood': 'aisle.meatSeafood',
  'Dairy & Eggs': 'aisle.dairyEggs',
  Pantry: 'aisle.pantry',
  Spices: 'aisle.spices',
  Frozen: 'aisle.frozen',
};

/** Indexed by JavaScript's day-of-week, 0 = Sunday. */
export const DAY_KEY: UIKey[] = [
  'day.sunday',
  'day.monday',
  'day.tuesday',
  'day.wednesday',
  'day.thursday',
  'day.friday',
  'day.saturday',
];

export const DAY_SHORT_KEY: UIKey[] = [
  'dayShort.sunday',
  'dayShort.monday',
  'dayShort.tuesday',
  'dayShort.wednesday',
  'dayShort.thursday',
  'dayShort.friday',
  'dayShort.saturday',
];

/** Indexed by JavaScript's zero-based month. */
export const MONTH_KEY: UIKey[] = [
  'month.1',
  'month.2',
  'month.3',
  'month.4',
  'month.5',
  'month.6',
  'month.7',
  'month.8',
  'month.9',
  'month.10',
  'month.11',
  'month.12',
];
