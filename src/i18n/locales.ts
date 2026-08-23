/** The languages the app ships with. English is the source of truth. */

export const LOCALES = ['en', 'ar', 'es', 'fr'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export type LocaleMeta = {
  /** Written in the language itself, which is how a language picker should read. */
  nativeName: string;
  /** Shown underneath, in the language the user is currently reading. */
  englishName: string;
  rtl: boolean;
  /** Passed to Intl / localeCompare for sorting. */
  tag: string;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { nativeName: 'English', englishName: 'English', rtl: false, tag: 'en-GB' },
  ar: { nativeName: 'العربية', englishName: 'Arabic', rtl: true, tag: 'ar' },
  es: { nativeName: 'Español', englishName: 'Spanish', rtl: false, tag: 'es' },
  fr: { nativeName: 'Français', englishName: 'French', rtl: false, tag: 'fr' },
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
