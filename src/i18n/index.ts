import { useCallback, useMemo } from 'react';

import { useApp } from '@/store/app-provider';

import { LOCALE_META } from './locales';
import { createRecipeTranslator, type RecipeTranslator } from './recipes';
import { translate, type Translator } from './translate';

/** The app's current language, and a translator bound to it. */
export function useTranslation() {
  const { preferences } = useApp();
  const locale = preferences.locale;

  const t = useCallback<Translator>((key, params) => translate(locale, key, params), [locale]);

  return useMemo(
    () => ({ t, locale, meta: LOCALE_META[locale], isRTL: LOCALE_META[locale].rtl }),
    [t, locale]
  );
}

/** Shorthand for the common case of only needing the translator. */
export function useT(): Translator {
  return useTranslation().t;
}

/** Translators for recipe titles, blurbs, steps, ingredients and tags. */
export function useRecipeText(): RecipeTranslator {
  const { preferences } = useApp();

  return useMemo(() => createRecipeTranslator(preferences.locale), [preferences.locale]);
}

export { DEFAULT_LOCALE, LOCALES, LOCALE_META, isLocale, type Locale } from './locales';
export { translate, translatorFor, type TranslateParams, type Translator } from './translate';
export { createRecipeTranslator, type RecipeTranslator } from './recipes';
export type { UIKey, UIDictionary } from './ui/en';
