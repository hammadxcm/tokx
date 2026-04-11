import { describe, expect, it } from 'vitest';
import { getTranslation, locales } from './index.js';

describe('i18n', () => {
  it('has 12 locales defined', () => {
    expect(locales).toHaveLength(12);
    expect(locales).toContain('en');
    expect(locales).toContain('ar');
    expect(locales).toContain('ur');
  });

  it('getTranslation returns a function', () => {
    const t = getTranslation('en');
    expect(typeof t).toBe('function');
  });

  it('English translation returns correct values', () => {
    const t = getTranslation('en');
    expect(t('nav.debugger')).toBe('Debugger');
    expect(t('nav.introduction')).toBe('Introduction');
    expect(t('nav.libraries')).toBe('Libraries');
    expect(t('hero.title')).toBe('JSON Web Tokens');
  });

  it('missing key returns the key itself', () => {
    const t = getTranslation('en');
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('unknown locale falls back to English', () => {
    const t = getTranslation('xx');
    expect(t('nav.debugger')).toBe('Debugger');
  });

  it('default locale is English', () => {
    const t = getTranslation();
    expect(t('nav.debugger')).toBe('Debugger');
  });
});
