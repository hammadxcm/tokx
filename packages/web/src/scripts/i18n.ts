const RTL_LANGS = ['ar', 'ur'];
const STORAGE_KEY = 'tokx-lang';

export function applyLanguage(lang: string): void {
  document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
}

export function initI18n(): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored !== 'en') {
    applyLanguage(stored);
  }
}

initI18n();
