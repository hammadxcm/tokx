import { describe, expect, it } from 'vitest';
import { getIconSrc, LANG_ICONS } from './languageIcons.js';

describe('languageIcons', () => {
  it('has icons for all major languages', () => {
    const required = [
      'JavaScript',
      'Python',
      'Java',
      'Go',
      'Rust',
      'Ruby',
      'PHP',
      '.NET',
      'Swift',
      'C++',
    ];
    for (const lang of required) {
      expect(LANG_ICONS[lang]).toBeDefined();
    }
  });

  it('animated languages return local SVG path', () => {
    const result = getIconSrc('JavaScript');
    expect(result.src).toBe('/icons/languages/js.svg');
    expect(result.isAnimated).toBe(true);
  });

  it('static languages return local SVG path', () => {
    const result = getIconSrc('Kotlin');
    expect(result.src).toBe('/icons/languages/kotlin.svg');
    expect(result.isAnimated).toBe(false);
  });

  it('unknown language returns fallback', () => {
    const result = getIconSrc('UnknownLang');
    expect(result.src).toContain('.svg');
    expect(result.isAnimated).toBe(false);
  });

  it('all icons have a color defined', () => {
    for (const [, icon] of Object.entries(LANG_ICONS)) {
      expect(icon.color).toBeDefined();
      expect(icon.color.length).toBeGreaterThanOrEqual(6);
    }
  });
});
