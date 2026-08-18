# KetoWeek

An iOS app, built with React Native and Expo, that hands you a fresh seven-day
keto meal plan every week — with the shopping list already written.

Everything ships inside the app. No account, no API key, no network calls: the
recipe library is bundled, and the week is derived from the date rather than
fetched, so the app works on a plane and costs nothing to run.

## What it does

- **This Week** — seven days of breakfast, lunch and dinner, with net carbs per
  day against your target, and a bonus snack for the week. Arrows browse into
  past and future weeks; *Shuffle* regenerates the current one.
- **Shopping** — every ingredient for the week rolled into one list, grouped by
  supermarket aisle, with quantities added up across recipes and ticks that
  persist. Switch between this week and next week to shop ahead.
- **Saved** — tap the heart on any recipe to keep it, grouped by meal.
- **Settings** — dietary filters, a daily net-carb target, which meals to plan,
  which day the week starts on, and an optional weekly reminder.

## Running it on your iPhone

You need [Node](https://nodejs.org) 20+ and the **Expo Go** app from the App
Store. A Mac and Xcode are *not* required for this path.

```bash
npm install
npm run ios      # or: npm start
```

Scan the QR code from the terminal with your iPhone camera and it opens in Expo
Go. Edits reload on save.

The weekly reminder is a scheduled local notification. Notification behaviour
in Expo Go differs from a real build, so test reminders in a development build
rather than trusting what Expo Go does with them:

```bash
npx expo install --check      # confirm native module versions match the SDK
npx eas build --platform ios  # needs an Expo account and an Apple developer account
```

Before shipping anywhere real, change `ios.bundleIdentifier` in `app.json` from
the placeholder `com.example.ketoweek` to your own.

## How the weekly rotation works

The plan is never stored — it is *derived*, which is why reopening the app on
Thursday shows the same week it showed on Monday, on any device, with no server
involved.

A seed is built from the week's start date, your preferences and how many times
you have shuffled that week. That seed drives a small PRNG
(`src/lib/rng.ts`) which shuffles the eligible recipes for each meal slot; day
*n* takes entry *n* from the shuffled queue. Same inputs, same week, every time.
Changing a preference or shuffling changes the seed, and the week changes with
it.

Eligibility is diet flags first, carb budget second. If too few recipes match,
the carb budget is dropped before the diet flags are — running a few grams over
is a smaller betrayal than serving someone the food they excluded — and the app
says on the plan screen when either has happened.

## Project layout

```
src/
  app/                 expo-router routes (file path = URL)
    (tabs)/            the four tabs
    recipe/[id].tsx    recipe detail
  components/          presentational pieces
  constants/theme.ts   colours, spacing, radii
  data/
    types.ts           Recipe / Ingredient / Macros
    recipes/           the bundled library, one file per meal slot
  lib/                 pure logic: plan, shopping, week maths, rng, storage
  store/               app state + AsyncStorage persistence
scripts/
  generate-icons.js    regenerates the app icons as flat PNGs
  verify.js            checks the recipe data and planning logic
```

## Adding your own recipes

Append to the matching file in `src/data/recipes/` — the shape is in
`src/data/types.ts`, and every field is required except an ingredient's `note`.
Give it a unique `id` and never reuse or renumber one that has already shipped:
saved recipes and shopping ticks are keyed by it.

Then run the checks:

```bash
npm run verify     # recipe data + planning logic
npm run typecheck
npm run lint
```

`verify` will tell you if a recipe's stated calories disagree with its macros,
if it is not actually keto, or if a dietary filter no longer has enough recipes
to fill a week without repeating.

## Known limits

- **No photos.** Recipes are identified by an emoji and a colour tile. Adding
  images means either bundling licensed photography or fetching it at runtime,
  which would give up the offline guarantee.
- **Macros are estimates.** They are per serving, hand-entered, and rounded.
  Treat them as a guide, not a measurement.
- **Not medical advice.** A ketogenic diet is not appropriate for everyone.
  Talk to a doctor or dietitian before making a significant dietary change,
  particularly if you are pregnant, diabetic, or taking medication.
