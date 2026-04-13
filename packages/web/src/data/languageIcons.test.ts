import { describe, expect, it } from 'vitest';
import { getIconSrc, LANG_ICONS } from './languageIcons.js';

describe('LANG_ICONS', () => {
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
      'TypeScript',
    ];
    for (const lang of required) {
      expect(LANG_ICONS[lang]).toBeDefined();
    }
  });

  it('all animated icons have animated flag', () => {
    const animated = Object.entries(LANG_ICONS).filter(([, v]) => v.animated);
    expect(animated.length).toBeGreaterThanOrEqual(12);
    for (const [, icon] of animated) {
      expect(icon.animated).toBe(true);
      expect(icon.file).toBeDefined();
    }
  });

  it('all icons have file and color', () => {
    for (const [lang, icon] of Object.entries(LANG_ICONS)) {
      expect(icon.file, `${lang} missing file`).toBeDefined();
      expect(icon.color, `${lang} missing color`).toBeDefined();
      expect(icon.color.length).toBeGreaterThanOrEqual(6);
    }
  });

  it('has 30+ language mappings', () => {
    expect(Object.keys(LANG_ICONS).length).toBeGreaterThanOrEqual(30);
  });
});

describe('getIconSrc', () => {
  it('animated language returns local SVG', () => {
    const result = getIconSrc('JavaScript');
    expect(result.src).toBe('/icons/languages/js.svg');
    expect(result.isAnimated).toBe(true);
  });

  it('static language returns local SVG', () => {
    const result = getIconSrc('Kotlin');
    expect(result.src).toBe('/icons/languages/kotlin.svg');
    expect(result.isAnimated).toBe(false);
  });

  it('unknown language returns fallback SVG', () => {
    const result = getIconSrc('UnknownLang');
    expect(result.src).toContain('.svg');
    expect(result.isAnimated).toBe(false);
  });

  it('returns correct color for each language', () => {
    expect(getIconSrc('Python').color).toBe('3776ab');
    expect(getIconSrc('Go').color).toBe('00add8');
    expect(getIconSrc('Rust').color).toBe('dea584');
  });

  it('.NET maps to csharp file', () => {
    const result = getIconSrc('.NET');
    expect(result.src).toBe('/icons/languages/csharp.svg');
  });

  it('C++ maps to cpp file', () => {
    const result = getIconSrc('C++');
    expect(result.src).toBe('/icons/languages/cpp.svg');
  });
});
