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
const { evaluate: evaluateContrast } = require('./check-contrast');

const ROOT = path.join(__dirname, '..');
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'ketoinseven-verify-'));

function compile() {
  const config = path.join(OUT, 'tsconfig.json');
  // Classic module resolution is all this needs, but TypeScript 6 requires an
  // explicit opt-in to keep using it, and TypeScript 5 rejects that same flag.
  const typescriptMajor = Number(require('typescript/package.json').version.split('.')[0]);
  fs.writeFileSync(
    config,
    JSON.stringify({
      compilerOptions: {
        strict: true,
        module: 'commonjs',
        moduleResolution: 'node10',
        ...(typescriptMajor >= 6 ? { ignoreDeprecations: '6.0' } : {}),
        target: 'es2022',
        skipLibCheck: true,
        outDir: path.join(OUT, 'build'),
        rootDir: path.join(ROOT, 'src'),
        types: [],
        paths: { '@/*': [path.join(ROOT, 'src', '*')] },
      },
      include: [
        path.join(ROOT, 'src/lib/**/*.ts'),
        path.join(ROOT, 'src/data/**/*.ts'),
        path.join(ROOT, 'src/i18n/**/*.ts'),
      ],
      exclude: [
        // These reach for React Native APIs that do not exist under plain node.
        path.join(ROOT, 'src/lib/notifications.ts'),
        path.join(ROOT, 'src/lib/storage.ts'),
        // The React entry point; translate.ts carries the logic worth checking.
        path.join(ROOT, 'src/i18n/index.ts'),
      ],
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
    ...require(path.join(build, 'i18n/translate.js')),
    ...require(path.join(build, 'i18n/locales.js')),
    recipeLocales: {
      ar: require(path.join(build, 'i18n/recipes/ar.js')).ar,
      es: require(path.join(build, 'i18n/recipes/es.js')).es,
      fr: require(path.join(build, 'i18n/recipes/fr.js')).fr,
    },
    ...require(path.join(build, 'data/recipes/index.js')),
    ...require(path.join(build, 'lib/plan.js')),
    ...require(path.join(build, 'lib/shopping.js')),
    ...require(path.join(build, 'lib/preferences.js')),
    ...require(path.join(build, 'lib/week.js')),
    ...require(path.join(build, 'lib/keto-verdict.js')),
    ...require(path.join(build, 'lib/food-facts.js')),
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
    ketoVerdict,
    findSugars,
    normaliseProduct,
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

  heading('Translations');
  const { DICTIONARIES, LOCALES, recipeLocales } = api;
  const englishKeys = Object.keys(DICTIONARIES.en);

  for (const locale of LOCALES.filter((l) => l !== 'en')) {
    const keys = Object.keys(DICTIONARIES[locale]);
    const missing = englishKeys.filter((k) => !(k in DICTIONARIES[locale]));
    const extra = keys.filter((k) => !englishKeys.includes(k));
    check(`${locale}: same keys as English`, missing.length === 0 && extra.length === 0,
      [...missing.map((k) => `missing ${k}`), ...extra.map((k) => `extra ${k}`)].join(', '));

    // A dropped {placeholder} silently renders the wrong sentence, so compare
    // the sets rather than trusting the strings to look right.
    const placeholders = (value) => (String(value).match(/\{(\w+)\}/g) || []).sort().join(',');
    const mismatched = englishKeys.filter(
      (k) => placeholders(DICTIONARIES.en[k]) !== placeholders(DICTIONARIES[locale][k])
    );
    check(`${locale}: placeholders preserved`, mismatched.length === 0, mismatched.join(', '));

    const blank = englishKeys.filter((k) => !String(DICTIONARIES[locale][k]).trim());
    check(`${locale}: no blank strings`, blank.length === 0, blank.join(', '));
  }

  heading('Recipe translation coverage');
  const sourceIngredients = new Set();
  const sourceUnits = new Set();
  const sourceNotes = new Set();
  const sourceTags = new Set();
  for (const recipe of ALL_RECIPES) {
    for (const ing of recipe.ingredients) {
      sourceIngredients.add(ing.name);
      // The empty unit is countable items ("4 eggs") and has nothing to translate.
      if (ing.unit) sourceUnits.add(ing.unit);
      if (ing.note) sourceNotes.add(ing.note);
    }
    for (const tag of recipe.tags) sourceTags.add(tag);
  }

  const pct = (have, total) => (total === 0 ? 100 : Math.round((have / total) * 100));

  for (const [locale, data] of Object.entries(recipeLocales)) {
    const counts = {
      ingredients: [...sourceIngredients].filter((k) => data.ingredients[k]).length,
      units: [...sourceUnits].filter((k) => data.units[k]).length,
      notes: [...sourceNotes].filter((k) => data.notes[k]).length,
      tags: [...sourceTags].filter((k) => data.tags[k]).length,
      recipes: ALL_RECIPES.filter((r) => data.recipes[r.id]).length,
    };
    // Coverage is a hard check, not a report: an untranslated string falls back
    // to English silently, which is exactly the kind of gap nobody notices.
    check(
      `${locale}: every recipe string is translated`,
      counts.ingredients === sourceIngredients.size &&
        counts.units === sourceUnits.size &&
        counts.notes === sourceNotes.size &&
        counts.tags === sourceTags.size &&
        counts.recipes === ALL_RECIPES.length,
      [
        ...[...sourceIngredients].filter((k) => !data.ingredients[k]).map((k) => `ingredient "${k}"`),
        ...[...sourceUnits].filter((k) => !data.units[k]).map((k) => `unit "${k}"`),
        ...[...sourceNotes].filter((k) => !data.notes[k]).map((k) => `note "${k}"`),
        ...[...sourceTags].filter((k) => !data.tags[k]).map((k) => `tag "${k}"`),
        ...ALL_RECIPES.filter((r) => !data.recipes[r.id]).map((r) => `recipe ${r.id}`),
      ]
        .slice(0, 8)
        .join(', ')
    );
    info(
      `${locale}: ingredients ${pct(counts.ingredients, sourceIngredients.size)}% · ` +
        `units ${pct(counts.units, sourceUnits.size)}% · ` +
        `notes ${pct(counts.notes, sourceNotes.size)}% · ` +
        `tags ${pct(counts.tags, sourceTags.size)}% · ` +
        `recipes ${pct(counts.recipes, ALL_RECIPES.length)}%`
    );

    // A step list of the wrong length would render a mismatched mixture, so it
    // is rejected outright rather than partially shown.
    const wrongLength = ALL_RECIPES.filter(
      (r) => data.recipes[r.id] && data.recipes[r.id].steps.length !== r.steps.length
    ).map((r) => r.id);
    check(`${locale}: translated step counts match the source`, wrongLength.length === 0, wrongLength.join(', '));

    const emptyStrings = Object.entries(data.recipes)
      .filter(([, v]) => !v.title.trim() || !v.blurb.trim() || v.steps.some((s) => !s.trim()))
      .map(([k]) => k);
    check(`${locale}: no blank recipe text`, emptyStrings.length === 0, emptyStrings.join(', '));
  }

  heading('Keto verdicts');
  {
    // A generous but ordinary daily budget, so the portion rule has room to
    // disagree with the density rule rather than failing everything.
    const LIMIT = 25;
    const verdictOf = (nutrition, ingredients) =>
      ketoVerdict(nutrition, LIMIT, ingredients).verdict;

    check(
      'butter is keto',
      verdictOf({ carbs100g: 0.1, servingGrams: 10 }) === 'keto'
    );
    check(
      'white bread is not',
      verdictOf({ carbs100g: 49, sugars100g: 4, servingGrams: 40 }) === 'avoid'
    );
    check(
      'a dense food in a tiny serving lands on borderline, not either extreme',
      verdictOf({ carbs100g: 22, servingGrams: 15 }) === 'borderline'
    );
    check(
      'a mild food in a large serving lands on borderline too',
      verdictOf({ carbs100g: 4, servingGrams: 170 }) === 'borderline'
    );
    check(
      'no carbohydrate figure means no verdict',
      verdictOf({ fat100g: 20, servingGrams: 30 }) === 'unknown'
    );

    // Sugar in the first few ingredients overrides a flattering density: this
    // is exactly the shape of a "low fat" product sweetened to compensate.
    check(
      'sugar as a leading ingredient overrides a low density',
      verdictOf({ carbs100g: 4.5, servingGrams: 20 }, 'water, sugar, cocoa butter') === 'avoid'
    );
    check(
      'sugar further down the list only downgrades to borderline',
      verdictOf({ carbs100g: 3, servingGrams: 20 }, 'almonds, cocoa, salt, sugar') === 'borderline'
    );
    check(
      '"sugar-free" is not read as sugar',
      verdictOf({ carbs100g: 2, servingGrams: 20 }, 'sugar-free chocolate, erythritol') === 'keto'
    );
    check(
      'erythritol and allulose are not treated as sugars',
      findSugars('almonds, erythritol, allulose, cocoa').length === 0
    );
    check(
      'a syrup under another name is still sugar',
      findSugars('oats, glucose syrup, maltodextrin').length === 2
    );
    check(
      'high sugars sink an otherwise borderline density',
      verdictOf({ carbs100g: 9, sugars100g: 8, servingGrams: 20 }) === 'avoid'
    );

    // The stated figure is what the verdict uses; fibre only ever adds context.
    // See the note at the top of src/lib/keto-verdict.ts for why.
    const highFibre = ketoVerdict({ carbs100g: 20, fibre100g: 16, servingGrams: 30 }, LIMIT);
    check('fibre is reported as net carbs', highFibre.netCarbs100g === 4);
    check('but the verdict still reads the stated carbohydrate', highFibre.verdict !== 'keto');

    const perServing = ketoVerdict({ carbs100g: 10, servingGrams: 30 }, LIMIT);
    check('carbs per serving are scaled from 100 g', perServing.carbsPerServing === 3);
    check('every verdict explains itself', perServing.reasons.length > 0);
  }

  heading('Open Food Facts parsing');
  {
    // Entries are community-edited, so every field here has been seen both
    // clean and malformed in the wild. The lookup itself needs a network and
    // cannot be exercised here; the parsing can.
    const clean = normaliseProduct('737628064502', {
      product_name: 'Peanut Butter',
      brands: 'Acme',
      quantity: '340 g',
      serving_quantity: 32,
      nutriments: { carbohydrates_100g: 20, fiber_100g: 6, sugars_100g: 9, proteins_100g: 25 },
      ingredients_text: 'peanuts, salt',
    });
    check('a clean entry parses', clean.name === 'Peanut Butter' && clean.brand === 'Acme');
    check('serving quantity is read', clean.nutrition.servingGrams === 32);
    check('nutriments are read', clean.nutrition.carbs100g === 20 && clean.nutrition.fibre100g === 6);

    const stringy = normaliseProduct('1', {
      nutriments: { carbohydrates_100g: '4.5', sugars_100g: '0' },
      serving_size: '30 g (about 12 crisps)',
    });
    check('numeric strings are accepted', stringy.nutrition.carbs100g === 4.5);
    check('zero is kept, not treated as missing', stringy.nutrition.sugars100g === 0);
    check('a serving size is read out of free text', stringy.nutrition.servingGrams === 30);

    const junk = normaliseProduct('2', {
      product_name: '   ',
      nutriments: { carbohydrates_100g: 'unknown', fiber_100g: -3 },
      serving_size: 'one biscuit',
    });
    check('an unparseable nutriment is left undefined', junk.nutrition.carbs100g === undefined);
    check('a negative nutriment is rejected', junk.nutrition.fibre100g === undefined);
    check('a serving size with no number is left undefined', junk.nutrition.servingGrams === undefined);
    check('a blank name is left undefined', junk.name === undefined);

    const bare = normaliseProduct('3', {});
    check('an entry with no nutriments still parses', bare.barcode === '3');
    check('and yields no verdict rather than a wrong one', ketoVerdict(bare.nutrition, 25).verdict === 'unknown');

    check(
      'a millilitre serving is read like a gram one',
      normaliseProduct('4', { serving_size: '250 ml' }).nutrition.servingGrams === 250
    );
  }

  heading('Colour contrast');
  for (const { scheme, results } of evaluateContrast()) {
    const bad = results.filter((r) => r.ratio < r.min);
    check(
      `${scheme}: all ${results.length} colour pairings meet contrast`,
      bad.length === 0,
      bad.map((r) => `${r.fg} on ${r.bg} ${r.ratio.toFixed(2)}:1 < ${r.min}:1`).join('; ')
    );
  }

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
