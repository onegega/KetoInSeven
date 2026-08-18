/**
 * Design tokens for KetoWeek.
 *
 * The palette is built around avocado green on warm paper in light mode, and
 * the same green lifted for contrast on near-black in dark mode. Macro colors
 * (fat / protein / carb) are shared across the macro bar, chips, and charts so
 * a color always means the same nutrient anywhere in the app.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FBFAF6',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F0E9',
    border: '#E4E2D6',
    text: '#1B1F18',
    textSecondary: '#6B7263',
    textMuted: '#9AA091',
    accent: '#3F8F5B',
    accentText: '#FFFFFF',
    accentSoft: '#E3F0E7',
    fat: '#D9922E',
    protein: '#C4553C',
    carb: '#4C7FBF',
    danger: '#B3402F',
  },
  dark: {
    background: '#0F120F',
    surface: '#191D18',
    surfaceAlt: '#232823',
    border: '#2F352E',
    text: '#F1F4EE',
    textSecondary: '#9AA396',
    textMuted: '#727A6E',
    accent: '#6CC589',
    accentText: '#0F120F',
    accentSoft: '#1D2C22',
    fat: '#EDB35B',
    protein: '#E27A62',
    carb: '#7BA9DE',
    danger: '#E27A62',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Theme = (typeof Colors)['light'];

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

export const Radius = {
  small: 8,
  medium: 14,
  large: 20,
  pill: 999,
} as const;

/** Extra bottom padding so scroll content clears the native tab bar. */
export const BottomTabInset = Platform.select({ ios: 60, android: 80 }) ?? 0;
export const MaxContentWidth = 700;
