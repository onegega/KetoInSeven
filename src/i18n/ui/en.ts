/**
 * The English dictionary is the source of truth: its keys define `UIKey`, so
 * every other language is type-checked for completeness and a missing string
 * fails the build rather than rendering blank.
 *
 * `{name}` placeholders are substituted at call time.
 */
export const en = {
  // Tabs
  'tab.scan': 'Scan',
  'scan.title': 'Scan a label',
  'scan.subtitle': 'Point at the barcode to check a packaged food.',
  'scan.permissionTitle': 'Camera access',
  'scan.permissionBody': 'KetoInSeven needs the camera to read barcodes. Nothing is recorded or uploaded.',
  'scan.permissionButton': 'Allow camera',
  'scan.permissionDenied': 'Camera access is off. Turn it on in Settings › KetoInSeven.',
  'scan.aim': 'Line the barcode up inside the frame',
  'scan.looking': 'Looking it up…',
  'scan.scanAgain': 'Scan another',
  'scan.notFoundTitle': 'Not in the database',
  'scan.notFoundBody': 'Open Food Facts has never seen this barcode. Coverage is thinner outside Europe.',
  'scan.offlineTitle': 'Can\'t reach the database',
  'scan.offlineBody': 'The lookup needs internet. Check your connection and try again.',
  'scan.errorTitle': 'Lookup failed',
  'scan.errorBody': 'Open Food Facts answered with an error. Try again in a moment.',
  'scan.verdictKeto': 'Keto-friendly',
  'scan.verdictBorderline': 'Borderline',
  'scan.verdictAvoid': 'Not keto',
  'scan.verdictUnknown': 'Not enough information',
  'scan.per100g': 'Per 100 g',
  'scan.perServing': 'Per serving',
  'scan.servingOf': 'serving of {count} g',
  'scan.netCarbs': '{count} g net',
  'scan.whyTitle': 'Why',
  'scan.reasonNoCarbs': 'No carbohydrate figure on this entry, so there is nothing to judge.',
  'scan.reasonLowDensity': '{count} g of carbs per 100 g — low enough to eat freely.',
  'scan.reasonMidDensity': '{count} g of carbs per 100 g — fine in a measured portion.',
  'scan.reasonHighDensity': '{count} g of carbs per 100 g — too dense for a keto staple.',
  'scan.reasonSmallServing': 'One serving is {count} g of carbs, a small part of your {limit} g day.',
  'scan.reasonMidServing': 'One serving is {count} g of carbs — a noticeable part of your {limit} g day.',
  'scan.reasonBigServing': 'One serving is {count} g of carbs against a {limit} g day.',
  'scan.reasonSugars': '{count} g of that is sugars.',
  'scan.reasonSugarFirst': 'Sugar is one of the first ingredients.',
  'scan.reasonSugarListed': 'Sugar appears in the ingredients.',
  'scan.reasonFibre': 'Fibre brings it to {count} g net ({fibre} g fibre).',
  'scan.source': 'Data from Open Food Facts',
  'scan.disclaimer': 'Label data is community-contributed and can be wrong or out of date. Check the pack.',
  'tab.thisWeek': 'This Week',
  'tab.shopping': 'Shopping',
  'tab.saved': 'Saved',
  'tab.settings': 'Settings',

  // Meal slots
  'slot.breakfast': 'Breakfast',
  'slot.lunch': 'Lunch',
  'slot.dinner': 'Dinner',
  'slot.snack': 'Snack',

  // Relative and absolute days
  'day.today': 'Today',
  'day.tomorrow': 'Tomorrow',
  'day.yesterday': 'Yesterday',
  'day.sunday': 'Sunday',
  'day.monday': 'Monday',
  'day.tuesday': 'Tuesday',
  'day.wednesday': 'Wednesday',
  'day.thursday': 'Thursday',
  'day.friday': 'Friday',
  'day.saturday': 'Saturday',
  'dayShort.sunday': 'Sun',
  'dayShort.monday': 'Mon',
  'dayShort.tuesday': 'Tue',
  'dayShort.wednesday': 'Wed',
  'dayShort.thursday': 'Thu',
  'dayShort.friday': 'Fri',
  'dayShort.saturday': 'Sat',

  // Months, abbreviated — used in date ranges like "17 Aug – 23 Aug"
  'month.1': 'Jan',
  'month.2': 'Feb',
  'month.3': 'Mar',
  'month.4': 'Apr',
  'month.5': 'May',
  'month.6': 'Jun',
  'month.7': 'Jul',
  'month.8': 'Aug',
  'month.9': 'Sep',
  'month.10': 'Oct',
  'month.11': 'Nov',
  'month.12': 'Dec',

  // This Week
  'week.thisWeek': 'THIS WEEK',
  'week.nextWeek': 'NEXT WEEK',
  'week.weekOf': 'WEEK OF',
  'week.averagePerDay': 'Average per day',
  'week.netCarbs': 'Net carbs',
  'week.kcal': '{count} kcal',
  'week.netCarbsValue': '{count}g',
  'week.netCarbsTarget': ' / {count}g',
  'week.shuffle': 'Shuffle this week',
  'week.shuffleAgain': 'Shuffle again ({count})',
  'week.previousWeek': 'Previous week',
  'week.nextWeekLabel': 'Next week',
  'week.snackOfTheWeek': 'SNACK OF THE WEEK',
  'week.netCarbsChip': '{count}g net carbs',
  'week.bubbleUnder': "Nice — you're averaging {count}g net carbs a day, under your {limit}g target.",
  'week.bubbleOver': 'This week averages {count}g a day, over your {limit}g target. Try a shuffle.',
  'week.noticeDietIgnored':
    'No {slots} recipes match every filter you have on, so this week’s {slots} ignore them. Turning one filter off will fix it.',
  'week.noticeOverTargetOne':
    '1 day goes over your {limit}g net carb target — too few recipes match your filters to stay under it every day.',
  'week.noticeOverTargetMany':
    '{count} days go over your {limit}g net carb target — too few recipes match your filters to stay under it every day.',

  // Macro bar
  'macro.fat': 'Fat {count}g',
  'macro.protein': 'Protein {count}g',
  'macro.netCarbs': 'Net carbs {count}g',

  // Recipe card
  'card.minutes': '{count} min',
  'card.kcal': '{count} kcal',
  'card.netCarbs': '{count}g net',
  'card.netCarbsValue': '{count}g',
  'card.netCarbsCaption': 'net carbs',
  'card.done': 'Done',
  'card.a11yRecipe': '{title}, {count} grams net carbs',
  'card.save': 'Save recipe',
  'card.unsave': 'Remove from saved recipes',
  'card.markCooked': 'Mark as cooked',
  'card.markNotCooked': 'Mark as not cooked',

  // Shopping
  'shopping.title': 'Shopping list',
  'shopping.subtitle': '{range} · everything for {days} days',
  'shopping.thisWeek': 'This week',
  'shopping.nextWeek': 'Next week',
  'shopping.forPeople': 'Shopping for',
  'shopping.peopleOne': 'One person',
  'shopping.peopleMany': '{count} people',
  'shopping.fewerPeople': 'Fewer people',
  'shopping.morePeople': 'More people',
  'shopping.progress': '{done} of {total} picked up',
  'shopping.reset': 'Reset',
  'shopping.resetLabel': 'Clear all ticks',
  'shopping.emptyTitle': 'Nothing to buy',
  'shopping.emptyBody':
    'Turn at least one meal back on in Settings and the list will fill itself in.',

  // Aisles
  'aisle.produce': 'Produce',
  'aisle.meatSeafood': 'Meat & Seafood',
  'aisle.dairyEggs': 'Dairy & Eggs',
  'aisle.pantry': 'Pantry',
  'aisle.spices': 'Spices',
  'aisle.frozen': 'Frozen',

  // Saved
  'saved.title': 'Saved',
  'saved.emptyHint': 'Tap the heart on any recipe to keep it here.',
  'saved.countOne': '1 recipe kept',
  'saved.countMany': '{count} recipes kept',
  'saved.emptyTitle': 'No saved recipes yet',
  'saved.emptyBody':
    'Hearts you tap on the weekly plan show up here, grouped by meal, so a favourite is never more than one tab away.',

  // Settings
  'settings.title': 'Settings',
  'settings.subtitle': 'Changing anything here reshuffles the week to match.',
  'settings.language': 'LANGUAGE',
  'settings.languageFooter': 'Recipes, ingredients and method steps are translated too.',
  'settings.dietaryFilters': 'DIETARY FILTERS',
  'settings.dietaryFiltersFooter': 'Only recipes matching every filter are planned.',
  'settings.dailyNetCarbs': 'DAILY NET CARBS',
  'settings.dailyNetCarbsFooter':
    'Recipes are picked to fit this budget across the day. If too few match, the limit is loosened for that meal and the week says so.',
  'settings.mealsToPlan': 'MEALS TO PLAN',
  'settings.addSnack': 'Add a snack of the week',
  'settings.weekStartsOn': 'WEEK STARTS ON',
  'settings.monday': 'Monday',
  'settings.saturday': 'Saturday',
  'settings.sunday': 'Sunday',
  'settings.weeklyReminder': 'WEEKLY REMINDER',
  'settings.reminderToggle': 'Remind me when the new week lands',
  'settings.reminderFooter': 'A local notification — nothing leaves the device.',
  'settings.about': 'ABOUT',
  'settings.aboutBody':
    '{count} recipes bundled with the app. Everything works offline — no account, no API key, no network calls.',
  'settings.carbLimit': '{count}g',

  // Dietary filters
  'diet.dairyFree': 'Dairy-free',
  'diet.nutFree': 'Nut-free',
  'diet.eggFree': 'Egg-free',
  'diet.porkFree': 'No pork',
  'diet.seafoodFree': 'No seafood',
  'diet.vegetarian': 'Vegetarian',

  // Alerts
  'alert.notificationsOffTitle': 'Notifications are off',
  'alert.notificationsOffBody':
    'Turn on notifications for KetoInSeven in the Settings app to get the weekly reminder.',
  'alert.restartTitle': 'Reopen the app',
  'alert.restartBody':
    'Arabic reads right to left. Close KetoInSeven completely and open it again to flip the layout.',

  // Recipe detail
  'recipe.perServing': 'Per serving',
  'recipe.serves': 'Serves {count}',
  'recipe.totalMinutes': '{count} min total',
  'recipe.cookingMinutes': '{count} min cooking',
  'recipe.ingredients': 'INGREDIENTS',
  'recipe.method': 'METHOD',
  'recipe.macroFootnote':
    '{netCarbs}g net carbs · {fiber}g fibre · figures are estimates for one of {servings} servings.',
  'recipe.notFoundTitle': 'Recipe not found',
  'recipe.notFoundBody':
    'This recipe is no longer in the library. Head back to the weekly plan to pick another.',
} as const;

export type UIKey = keyof typeof en;
export type UIDictionary = Record<UIKey, string>;
