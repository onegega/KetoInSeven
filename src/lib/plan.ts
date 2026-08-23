import { ALL_RECIPES, filterByDiet, getRecipe, recipesForSlot } from '@/data/recipes';
import type { Macros, MealSlot, Recipe } from '@/data/types';
import type { Preferences } from '@/lib/preferences';
import { preferencesSignature } from '@/lib/preferences';
import { createRandom, seededShuffle } from '@/lib/rng';
import { toDateId, weekDates } from '@/lib/week';

export type PlannedMeal = {
  slot: MealSlot;
  recipeId: string;
};

export type PlannedDay = {
  date: Date;
  dateId: string;
  meals: PlannedMeal[];
};

export type WeeklyPlan = {
  weekId: string;
  weekStart: Date;
  days: PlannedDay[];
  /** One bonus snack for the week, when enabled in preferences. */
  snackId: string | null;
  /**
   * Slots where *no* recipe matched the diet flags, so the flags were ignored
   * for that slot. This is the serious case — the week contains food the user
   * asked not to see — and is always surfaced.
   */
  dietRelaxed: MealSlot[];
  /**
   * Slots where fewer than seven recipes fit the per-meal carb budget, so the
   * budget was not applied. The diet flags are still honoured; days may simply
   * run closer to the limit.
   */
  carbBudgetRelaxed: MealSlot[];
};

const DAYS_IN_WEEK = 7;

/**
 * Builds the week's meals. Pure and deterministic: the same week id,
 * preferences and shuffle count always produce the same plan, which is why
 * nothing about the plan needs to be persisted.
 */
export function buildWeeklyPlan(
  weekStart: Date,
  prefs: Preferences,
  shuffleCount: number
): WeeklyPlan {
  const weekId = toDateId(weekStart);
  const seed = `${weekId}|${preferencesSignature(prefs)}|${shuffleCount}`;
  const random = createRandom(seed);
  const perMealCarbBudget = prefs.netCarbLimit / Math.max(prefs.meals.length, 1);

  const dietRelaxed: MealSlot[] = [];
  const carbBudgetRelaxed: MealSlot[] = [];
  const queues = new Map<MealSlot, Recipe[]>();

  for (const slot of prefs.meals) {
    const eligible = eligiblePool(slot, prefs, perMealCarbBudget);
    if (eligible.dietRelaxed) dietRelaxed.push(slot);
    if (eligible.carbBudgetRelaxed) carbBudgetRelaxed.push(slot);
    queues.set(slot, seededShuffle(eligible.pool, random));
  }

  const days: PlannedDay[] = weekDates(weekStart).map((date, dayIndex) => ({
    date,
    dateId: toDateId(date),
    meals: prefs.meals.flatMap((slot) => {
      const queue = queues.get(slot);
      if (!queue || queue.length === 0) return [];
      // Cycling by index keeps the week repeat-free whenever the pool holds at
      // least seven recipes, and degrades gracefully when it does not.
      return [{ slot, recipeId: queue[dayIndex % queue.length].id }];
    }),
  }));

  let snackId: string | null = null;
  if (prefs.includeSnack) {
    const { pool } = eligiblePool('snack', prefs, Number.POSITIVE_INFINITY);
    if (pool.length > 0) {
      snackId = seededShuffle(pool, random)[0].id;
    }
  }

  return { weekId, weekStart, days, snackId, dietRelaxed, carbBudgetRelaxed };
}

type EligiblePool = {
  pool: Recipe[];
  dietRelaxed: boolean;
  carbBudgetRelaxed: boolean;
};

/**
 * Recipes for a slot that satisfy the diet flags and fit the per-meal carb
 * budget. Filters are dropped one at a time rather than returning an empty
 * week: the carb budget goes first because running a few grams over is a much
 * smaller betrayal than serving someone the food they excluded.
 */
function eligiblePool(slot: MealSlot, prefs: Preferences, perMealCarbBudget: number): EligiblePool {
  const all = recipesForSlot(slot);
  const dietMatched = filterByDiet(all, prefs.diet);
  const withinCarbs = dietMatched.filter((recipe) => recipe.macros.netCarbs <= perMealCarbBudget);

  if (withinCarbs.length >= DAYS_IN_WEEK) {
    return { pool: withinCarbs, dietRelaxed: false, carbBudgetRelaxed: false };
  }

  if (dietMatched.length > 0) {
    return {
      pool: dietMatched,
      dietRelaxed: false,
      carbBudgetRelaxed: withinCarbs.length < dietMatched.length,
    };
  }

  // Nothing at all matches the diet flags for this slot.
  return { pool: all, dietRelaxed: true, carbBudgetRelaxed: false };
}

export const EMPTY_MACROS: Macros = { calories: 0, fat: 0, protein: 0, netCarbs: 0, fiber: 0 };

export function sumMacros(recipes: Recipe[]): Macros {
  return recipes.reduce<Macros>(
    (total, recipe) => ({
      calories: total.calories + recipe.macros.calories,
      fat: total.fat + recipe.macros.fat,
      protein: total.protein + recipe.macros.protein,
      netCarbs: total.netCarbs + recipe.macros.netCarbs,
      fiber: total.fiber + recipe.macros.fiber,
    }),
    { ...EMPTY_MACROS }
  );
}

/**
 * Mean macros for one day of the plan.
 *
 * Derived by averaging the days rather than by dividing the week's distinct
 * recipes, because a week that repeats a recipe — which happens whenever the
 * filters leave a slot with fewer than seven options — would otherwise
 * undercount it.
 */
export function averageDailyMacros(plan: WeeklyPlan): Macros {
  const days = Math.max(plan.days.length, 1);
  const total = plan.days.reduce<Macros>(
    (acc, day) => {
      const macros = dayMacros(day);
      return {
        calories: acc.calories + macros.calories,
        fat: acc.fat + macros.fat,
        protein: acc.protein + macros.protein,
        netCarbs: acc.netCarbs + macros.netCarbs,
        fiber: acc.fiber + macros.fiber,
      };
    },
    { ...EMPTY_MACROS }
  );

  return {
    calories: total.calories / days,
    fat: total.fat / days,
    protein: total.protein / days,
    netCarbs: total.netCarbs / days,
    fiber: total.fiber / days,
  };
}

export function planRecipes(day: PlannedDay): Recipe[] {
  return day.meals
    .map((meal) => getRecipe(meal.recipeId))
    .filter((recipe): recipe is Recipe => recipe !== undefined);
}

export function dayMacros(day: PlannedDay): Macros {
  return sumMacros(planRecipes(day));
}

/** Every distinct recipe in the plan, including the bonus snack. */
export function allPlanRecipes(plan: WeeklyPlan): Recipe[] {
  const ids = new Set<string>();
  for (const day of plan.days) {
    for (const meal of day.meals) ids.add(meal.recipeId);
  }
  if (plan.snackId) ids.add(plan.snackId);

  return ALL_RECIPES.filter((recipe) => ids.has(recipe.id));
}
