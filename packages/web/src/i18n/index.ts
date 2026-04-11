import { en } from './translations/en';

export const locales = [
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'ru',
  'zh',
  'hi',
  'ar',
  'ur',
  'bn',
  'ja',
] as const;
export type Locale = (typeof locales)[number];

const translations: Record<string, Record<string, string>> = { en };

async function loadTranslation(locale: Locale): Promise<Record<string, string>> {
  if (locale === 'en') return en;
  if (translations[locale]) return translations[locale];
  try {
    const mod = await import(`./translations/${locale}.ts`);
    translations[locale] = mod[locale] || mod.default || {};
    return translations[locale];
  } catch {
    return en;
  }
}

/** Synchronous — uses cached translations only (English always available) */
export function getTranslation(locale?: string): (key: string) => string {
  const lang = (locale || 'en') as Locale;
  const dict = translations[lang] || en;
  return (key: string) => dict[key] || en[key] || key;
}

/** Async — loads translation module if needed */
export async function getTranslationAsync(locale: Locale): Promise<(key: string) => string> {
  const dict = await loadTranslation(locale);
  return (key: string) => dict[key] || en[key] || key;
}
