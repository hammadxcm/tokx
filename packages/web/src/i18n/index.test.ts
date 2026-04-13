import { describe, expect, it } from 'vitest';
import { getTranslation, locales } from './index.js';

describe('locales', () => {
  it('has 12 locales', () => {
    expect(locales).toHaveLength(12);
  });

  it('includes English as default', () => {
    expect(locales).toContain('en');
  });

  it('includes RTL languages', () => {
    expect(locales).toContain('ar');
    expect(locales).toContain('ur');
  });

  it('includes all major languages', () => {
    const expected = ['en', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'hi', 'ar', 'ur', 'bn', 'ja'];
    for (const locale of expected) {
      expect(locales).toContain(locale);
    }
  });
});

describe('getTranslation', () => {
  it('returns a function', () => {
    const t = getTranslation('en');
    expect(typeof t).toBe('function');
  });

  it('translates nav keys', () => {
    const t = getTranslation('en');
    expect(t('nav.debugger')).toBe('Debugger');
    expect(t('nav.introduction')).toBe('Introduction');
    expect(t('nav.libraries')).toBe('Libraries');
  });

  it('translates hero keys', () => {
    const t = getTranslation('en');
    expect(t('hero.title')).toBe('JSON Web Tokens');
    expect(t('hero.cta')).toBe('Start debugging');
  });

  it('translates debugger keys', () => {
    const t = getTranslation('en');
    expect(t('debugger.encoded')).toBe('Encoded');
    expect(t('debugger.decoded')).toBe('Decoded');
    expect(t('debugger.valid')).toBe('Signature Verified');
    expect(t('debugger.invalid')).toBe('Invalid Signature');
  });

  it('translates footer keys', () => {
    const t = getTranslation('en');
    expect(t('footer.quicklinks')).toBe('Quick Links');
    expect(t('footer.resources')).toBe('Resources');
  });

  it('missing key returns the key itself', () => {
    const t = getTranslation('en');
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('unknown locale falls back to English', () => {
    const t = getTranslation('xx');
    expect(t('nav.debugger')).toBe('Debugger');
  });

  it('default locale is English when no arg', () => {
    const t = getTranslation();
    expect(t('nav.debugger')).toBe('Debugger');
  });

  it('undefined locale falls back to English', () => {
    const t = getTranslation(undefined);
    expect(t('hero.title')).toBe('JSON Web Tokens');
  });
});
