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

## Getting it onto your iPhone

There are three routes, and which one you want depends on whether you have a
paid Apple Developer account ($99/year). Apple does not allow installing an app
onto a device without one, except via Expo Go or a 7-day Xcode signature.

### 1. Expo Go — free, about five minutes

The app runs on your phone inside the Expo Go container. No Apple Developer
account, no Mac, no build step. This is the fastest way to actually hold it.

1. Install **Expo Go** from the App Store.
2. On your computer, with [Node](https://nodejs.org) 20+ installed:

   ```bash
   git clone -b claude/keto-recipes-ios-app-25bxwz \
     https://github.com/onegega/test.git ketoweek
   cd ketoweek
   npm install
   npm start
   ```

   The `-b` matters: the app lives on that branch, and the default branch is
   still empty.
3. Scan the QR code in the terminal with the iPhone camera.

Your phone and computer must be on the same Wi-Fi. If the office network blocks
device-to-device traffic, run `npx expo start --tunnel` instead.

What you give up: it appears as a project inside Expo Go rather than as its own
home-screen icon, it only runs while the dev server is up, and notification
behaviour differs from a real build.

### 2. EAS Build, installed over the air — needs a paid Apple Developer account

This produces a real signed app with its own icon, installed from a link. The
build runs on Expo's servers, so this works from macOS, Windows or Linux.

```bash
npm install -g eas-cli
eas login                          # free Expo account
eas build --platform ios --profile preview
```

EAS will ask for your Apple credentials and create the signing certificate and
provisioning profile for you. It also has to register your iPhone's UDID —
`eas device:create` walks you through it, and **the device must be registered
before the build runs**, since ad-hoc provisioning bakes the device list into
the binary.

When the build finishes, open the link it prints on the iPhone and install.

### 3. TestFlight — needs a paid Apple Developer account

Better if you want the app on more than one device, or to share it.

```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

Then add yourself as an internal tester in App Store Connect. TestFlight builds
last 90 days and do not need device UDIDs registered.

### Before any real build

`app.json` sets `ios.bundleIdentifier` to `com.ketoweek.app`. It only has to be
globally unique for App Store submission, but change it to something of your own
(`com.yourname.ketoweek`) if you plan to go that far — changing it later makes
Apple treat it as a different app, and the saved recipes and ticks on the old
one will not carry over.

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
