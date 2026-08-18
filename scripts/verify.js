/**
 * Checks the recipe library and the planning logic without a device or a
 * simulator: `npm run verify`.
 *
 * The pure modules (src/data, src/lib) are compiled to a temp directory with
 * tsc and required from there, with a small resolver hook to map the app's
 * `@/` alias. Anything touching React Native is deliberately out of scope —
 * this covers the parts where a silent mistake would ship bad food data.
 */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const Module = require('node:module');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'ketoweek-verify-'));

function compile() {
  const config = path.join(OUT, 'tsconfig.json');
  fs.writeFileSync(
    config,
    JSON.stringify({
      compilerOptions: {
        strict: true,
        module: 'commonjs',
        moduleResolution: 'node10',
        // Classic resolution is all this needs; TS 6 wants the opt-in to say so.
        ignoreDeprecations: '6.0',
        target: 'es2022',
        skipLibCheck: true,
        outDir: path.join(OUT, 'build'),
        rootDir: path.join(ROOT, 'src'),
        types: [],
        paths: { '@/*': [path.join(ROOT, 'src', '*')] },
      },
      include: [path.join(ROOT, 'src/lib/**/*.ts'), path.join(ROOT, 'src/data/**/*.ts')],
      // Both reach for React Native APIs that do not exist under plain node.
      exclude: [path.join(ROOT, 'src/lib/notifications.ts'), path.join(ROOT, 'src/lib/storage.ts')],
    })
  );

  execFileSync('npx', ['tsc', '-p', config], { cwd: ROOT, stdio: 'inherit' });
}

function loadModules() {
  const build = path.join(OUT, 'build');
  const resolve = Module._resolveFilename;
  Module._resolveFilename = function (request, ...rest) {
    return resolve.call(this, request.startsWith('@/') ? path.join(build, request.slice(2)) : request, ...rest);
  };

  return {
    ...require(path.join(build, 'data/recipes/index.js')),
    ...require(path.join(build, 'lib/plan.js')),
    ...require(path.join(build, 'lib/shopping.js')),
    ...require(path.join(build, 'lib/preferences.js')),
    ...require(path.join(build, 'lib/week.js')),
  };
}

let failures = 0;

function check(name, passed, detail = '') {
  if (passed) {
    console.log(`  ok    ${name}`);
  } else {
    failures++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const info = (message) => console.log(`  info  ${message}`);
const heading = (title) => console.log(`\n${title}`);

function run(api) {
  const {
    ALL_RECIPES,
    buildWeeklyPlan,
    dayMacros,
    allPlanRecipes,
    buildShoppingList,
    countItems,
    formatAmount,
    formatQuantity,
    singulariseUnit,
    averageDailyMacros,
    DEFAULT_PREFERENCES,
    DIET_ORDER,
    startOfWeek,
    weekIdFor,
    toDateId,
  } = api;

  const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner'];
  const monday = startOfWeek(new Date('2026-08-17T12:00:00'), 1);
  const caloriesFromMacros = (m) => m.fat * 9 + m.protein * 4 + m.netCarbs * 4;

  heading('Recipe library');
  const ids = ALL_RECIPES.map((recipe) => recipe.id);
  const failing = (predicate) => ALL_RECIPES.filter(predicate).map((recipe) => recipe.id).join(', ');

  check('ids are unique', new Set(ids).size === ids.length);
  check(
    'every recipe has ingredients and at least three steps',
    ALL_RECIPES.every((r) => r.ingredients.length > 0 && r.steps.length >= 3),
    failing((r) => r.ingredients.length === 0 || r.steps.length < 3)
  );
  check(
    'every recipe is keto (10g net carbs or fewer)',
    ALL_RECIPES.every((r) => r.macros.netCarbs <= 10),
    failing((r) => r.macros.netCarbs > 10)
  );
  check(
    'stated calories agree with the macros within 18%',
    ALL_RECIPES.every((r) => Math.abs(caloriesFromMacros(r.macros) - r.macros.calories) / r.macros.calories < 0.18),
    failing((r) => Math.abs(caloriesFromMacros(r.macros) - r.macros.calories) / r.macros.calories >= 0.18)
  );
  check(
    'fat is the dominant macro in every recipe',
    ALL_RECIPES.every((r) => r.macros.fat * 9 > r.macros.protein * 4),
    failing((r) => r.macros.fat * 9 <= r.macros.protein * 4)
  );
  info(`${ALL_RECIPES.length} recipes bundled`);

  heading('Weekly plan');
  const plan = buildWeeklyPlan(monday, DEFAULT_PREFERENCES, 0);
  const nextWeek = buildWeeklyPlan(new Date(monday.getTime() + 7 * 86_400_000), DEFAULT_PREFERENCES, 0);

  check('same inputs produce the same plan', JSON.stringify(buildWeeklyPlan(monday, DEFAULT_PREFERENCES, 0)) === JSON.stringify(plan));
  check('the week covers seven days', plan.days.length === 7);
  check('every day is fully planned', plan.days.every((day) => day.meals.length === DEFAULT_PREFERENCES.meals.length));
  check('shuffling produces a different week', JSON.stringify(buildWeeklyPlan(monday, DEFAULT_PREFERENCES, 1)) !== JSON.stringify(plan));
  check('the following week is different', JSON.stringify(nextWeek.days.map((d) => d.meals)) !== JSON.stringify(plan.days.map((d) => d.meals)));

  for (const slot of MEAL_SLOTS) {
    const picks = plan.days.map((day) => day.meals.find((meal) => meal.slot === slot).recipeId);
    check(`no ${slot} repeats within the week`, new Set(picks).size === picks.length, picks.join(', '));
  }

  // The summary card labels these "per day", so they have to actually be per
  // day rather than week-long totals.
  const daily = averageDailyMacros(plan);
  const summed = plan.days.reduce((total, day) => total + dayMacros(day).calories, 0);
  check(
    'the daily average really is the mean of the days',
    Math.abs(daily.calories - summed / plan.days.length) < 0.01,
    `${daily.calories} vs ${summed / plan.days.length}`
  );
  check(
    'daily average macros are per-day sized, not week-sized',
    daily.fat < 200 && daily.protein < 200 && daily.netCarbs < 60,
    `fat ${Math.round(daily.fat)}g protein ${Math.round(daily.protein)}g carbs ${Math.round(daily.netCarbs)}g`
  );

  const carbs = plan.days.map((day) => Math.round(dayMacros(day).netCarbs));
  info(`daily net carbs on defaults: ${carbs.join(', ')} (target ${DEFAULT_PREFERENCES.netCarbLimit}g)`);
  check('no day exceeds the default target', carbs.every((value) => value <= DEFAULT_PREFERENCES.netCarbLimit));
  check('no filters relaxed on defaults', plan.dietRelaxed.length === 0 && plan.carbBudgetRelaxed.length === 0);

  heading('Dietary filters');
  for (const tag of DIET_ORDER) {
    const filtered = buildWeeklyPlan(monday, { ...DEFAULT_PREFERENCES, diet: [tag] }, 0);
    const offenders = allPlanRecipes(filtered).filter((recipe) => !recipe.diet.includes(tag));
    check(`${tag}: every planned recipe honours it`, offenders.length === 0, offenders.map((r) => r.id).join(', '));
    check(`${tag}: no slot falls back past the diet`, filtered.dietRelaxed.length === 0, filtered.dietRelaxed.join(', '));
  }

  // Every filter at once is the strictest thing the Settings screen can ask
  // for, so the library has to survive it without falling back.
  const strictest = buildWeeklyPlan(monday, { ...DEFAULT_PREFERENCES, diet: DIET_ORDER }, 0);
  const strictestRecipes = allPlanRecipes(strictest);
  check('every filter at once still returns a full week', strictest.days.every((day) => day.meals.length === 3));
  check('every filter at once is still honoured', strictest.dietRelaxed.length === 0, strictest.dietRelaxed.join(', '));
  check(
    'every filter at once plans only matching recipes',
    strictestRecipes.every((recipe) => DIET_ORDER.every((tag) => recipe.diet.includes(tag))),
    strictestRecipes.filter((r) => !DIET_ORDER.every((t) => r.diet.includes(t))).map((r) => r.id).join(', ')
  );
  info(`${new Set(strictestRecipes.map((r) => r.id)).size} distinct recipes available with every filter on`);

  heading('Shopping list');
  const sections = buildShoppingList(allPlanRecipes(plan));
  const keys = sections.flatMap((section) => section.items.map((item) => item.key));

  check('the list is not empty', countItems(sections) > 0);
  check('no section is empty', sections.every((section) => section.items.length > 0));
  check('no duplicated lines', new Set(keys).size === keys.length);
  check('quantities render as fractions', formatQuantity(0.5) === '½' && formatQuantity(1.5) === '1½' && formatQuantity(2) === '2');
  check('unmeasured ingredients keep their wording', formatAmount({ qty: null, unit: 'to taste' }) === 'to taste');

  // A recipe writing "1 stick" and another writing "4 sticks" must not become
  // two separate lines on the list.
  const collisions = [];
  for (const section of sections) {
    const seen = new Map();
    for (const item of section.items) {
      const canonical = `${item.name}::${singulariseUnit(item.unit)}`;
      if (seen.has(canonical)) collisions.push(`${item.name} (${seen.get(canonical)} / ${item.unit})`);
      seen.set(canonical, item.unit);
    }
  }
  check('singular and plural units merge into one line', collisions.length === 0, collisions.join(', '));
  check(
    'units agree in number with their quantity',
    formatAmount({ qty: 1, unit: 'stick' }) === '1 stick' &&
      formatAmount({ qty: 5, unit: 'stick' }) === '5 sticks' &&
      formatAmount({ qty: 3, unit: 'small bunch' }) === '3 small bunches' &&
      formatAmount({ qty: 2, unit: 'cloves' }) === '2 cloves' &&
      formatAmount({ qty: 250, unit: 'g' }) === '250 g',
    [1, 5].map((q) => formatAmount({ qty: q, unit: 'stick' })).join(' / ')
  );

  const eggs = sections.flatMap((section) => section.items).find((item) => item.name === 'eggs');
  if (eggs) {
    check('repeated ingredients merge additively', eggs.qty > 6, formatAmount(eggs));
    info(`eggs merged to ${formatAmount(eggs)} across ${eggs.usedIn.length} recipes`);
  }
  info(`${countItems(sections)} lines across ${sections.length} aisles`);

  heading('Week maths');
  check(
    'the week id is stable across the whole week',
    weekIdFor(new Date('2026-08-17T23:30:00'), 1) === weekIdFor(new Date('2026-08-23T00:30:00'), 1)
  );
  check('a Monday-start week starts on Monday', startOfWeek(new Date('2026-08-20T12:00:00'), 1).getDay() === 1);
  check('a Sunday-start week starts on Sunday', startOfWeek(new Date('2026-08-20T12:00:00'), 0).getDay() === 0);
  check('date ids use local date parts', toDateId(new Date(2026, 7, 3)) === '2026-08-03');
}

try {
  compile();
  run(loadModules());
} finally {
  fs.rmSync(OUT, { recursive: true, force: true });
}

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
