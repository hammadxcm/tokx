import { describe, expect, it } from 'vitest';
import libraries from './libraries.json';

describe('libraries.json', () => {
  it('has 40+ libraries', () => {
    expect(libraries.length).toBeGreaterThanOrEqual(40);
  });

  it('every library has required fields', () => {
    for (const lib of libraries) {
      expect(lib.name, `missing name`).toBeDefined();
      expect(lib.language, `${lib.name} missing language`).toBeDefined();
      expect(lib.author, `${lib.name} missing author`).toBeDefined();
      expect(lib.url, `${lib.name} missing url`).toBeDefined();
      expect(typeof lib.stars).toBe('number');
      expect(lib.install, `${lib.name} missing install`).toBeDefined();
      expect(Array.isArray(lib.signing)).toBe(true);
      expect(Array.isArray(lib.verifying)).toBe(true);
      expect(typeof lib.claims).toBe('object');
    }
  });

  it('has libraries from 10+ languages', () => {
    const languages = new Set(libraries.map((l) => l.language));
    expect(languages.size).toBeGreaterThanOrEqual(10);
  });

  it('no duplicate library names within same language', () => {
    const seen = new Set<string>();
    for (const lib of libraries) {
      const key = `${lib.language}:${lib.name}`;
      expect(seen.has(key), `duplicate: ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it('all URLs are valid', () => {
    for (const lib of libraries) {
      expect(lib.url.startsWith('http'), `${lib.name} invalid URL`).toBe(true);
    }
  });

  it('star counts are non-negative', () => {
    for (const lib of libraries) {
      expect(lib.stars).toBeGreaterThanOrEqual(0);
    }
  });

  it('claims object has standard JWT claims', () => {
    const standardClaims = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'];
    for (const lib of libraries) {
      for (const claim of standardClaims) {
        expect(typeof lib.claims[claim], `${lib.name} missing claim ${claim}`).toBe('boolean');
      }
    }
  });
});
