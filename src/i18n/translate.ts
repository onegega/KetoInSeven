/**
 * The translator, with no React in it.
 *
 * Kept separate from `index.ts` so pure modules — week maths, the shopping
 * list — can format text without importing the provider, and so the offline
 * checks in `npm run verify` can compile them without JSX.
 */

import { DEFAULT_LOCALE, type Locale } from './locales';
import { ar } from './ui/ar';
import { en, type UIDictionary, type UIKey } from './ui/en';
import { es } from './ui/es';
import { fr } from './ui/fr';

export const DICTIONARIES: Record<Locale, UIDictionary> = { en, ar, es, fr };

export type TranslateParams = Record<string, string | number>;
export type Translator = (key: UIKey, params?: TranslateParams) => string;

/** Replaces every `{name}` in the string with the matching param. */
function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole
  );
}

/**
 * Falls back to English for a key the chosen language somehow lacks — the
 * dictionaries are type-checked for completeness, so this only matters for a
 * locale value that survived from an older stored preference.
 */
export function translate(locale: Locale, key: UIKey, params?: TranslateParams): string {
  const dictionary = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
  return interpolate(dictionary[key] ?? en[key], params);
}

/** A translator bound to one locale. */
export const translatorFor =
  (locale: Locale): Translator =>
  (key, params) =>
    translate(locale, key, params);
