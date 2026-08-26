/**
 * Design tokens for KetoInSeven.
 *
 * The look is "ink and confetti on warm paper": a cream page, cards that sit a
 * shade *darker* than the page rather than being fenced off with hairlines, one
 * confident green for actions, and near-black reserved for the few surfaces
 * that should stop the eye — the tab bar and the selected day.
 *
 * Two rules hold the palette together:
 *
 * 1. Separation comes from fill, not from borders. `border` still exists for
 *    rules and dividers, but a card should read as a card because it is a
 *    different colour from the paper, not because it is outlined.
 * 2. Every relationship inverts cleanly in dark mode. In light, `surface` is
 *    darker than `background`; in dark it is lighter. `inverseSurface` is
 *    near-black on light and near-white on dark. Code that reasons about
 *    "the surface stands out from the page" stays true in both.
 *
 * Macro colours (fat / protein / carb) and slot colours (breakfast / lunch /
 * dinner / snack) are fixed meanings: a colour always names the same thing
 * anywhere in the app. Both sets are contrast-checked against the surfaces they
 * are drawn on by `scripts/check-contrast.js`, which runs as part of `verify`.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** The paper. Warm, never white — white makes the cards look like holes. */
    background: '#F6F5E8',
    /** Cards. Deliberately darker than the paper; needs no border to read. */
    surface: '#E9EBD7',
    /** Nested rows inside a card, and pressed states. */
    surfaceAlt: '#DFE1C9',
    border: '#CFD2B6',
    text: '#161811',
    textSecondary: '#4E5342',
    textMuted: '#5D6451',
    /** Actions and anything carrying small white text. Contrast-safe. */
    accent: '#25703A',
    accentText: '#FFFFFF',
    accentSoft: '#DCEDD4',
    /** Near-black surfaces: the tab bar, the selected day. */
    inverseSurface: '#15170F',
    inverseText: '#F6F5E8',
    /** De-emphasised text and icons on `inverseSurface`. */
    inverseTextMuted: '#9AA18C',
    fat: '#8F5410',
    protein: '#A33A26',
    carb: '#2A5FA8',
    danger: '#A6301F',
    breakfast: '#8F5410',
    lunch: '#2A5FA8',
    dinner: '#A62A6B',
    snack: '#1C6560',
  },
  dark: {
    background: '#12140F',
    surface: '#1E211A',
    surfaceAlt: '#282C22',
    border: '#363B2E',
    text: '#F1F3E5',
    textSecondary: '#A6AD97',
    textMuted: '#8E9681',
    accent: '#6FC486',
    accentText: '#10140E',
    accentSoft: '#1E3324',
    inverseSurface: '#F1F3E5',
    inverseText: '#12140F',
    inverseTextMuted: '#5D6451',
    fat: '#E5B063',
    protein: '#E8836A',
    carb: '#7FAAE2',
    danger: '#E8836A',
    breakfast: '#E5B063',
    lunch: '#7FAAE2',
    dinner: '#E884B8',
    snack: '#63C6BC',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Theme = (typeof Colors)['light'];

/** Which token names a meal slot's colour. Keeps the mapping in one place. */
export const SLOT_COLOR = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  snack: 'snack',
} as const satisfies Record<string, ThemeColor>;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/**
 * Roomier than before. The reference language leans on generous corners; a
 * 20pt card next to a 14pt button next to a pill reads as one family, where
 * timid 8pt corners read as a form.
 */
export const Radius = {
  small: 10,
  medium: 14,
  large: 20,
  xlarge: 26,
  pill: 999,
} as const;

/** Extra bottom padding so scroll content clears the native tab bar. */
export const BottomTabInset = Platform.select({ ios: 60, android: 80 }) ?? 0;
export const MaxContentWidth = 700;
