import { describe, expect, it } from 'vitest';
import {
  ALGORITHM_FAMILIES,
  ALGORITHMS,
  getAlgorithmFamily,
  getAlgorithmInfo,
  isAsymmetric,
  isSymmetric,
} from './algorithms.js';

describe('algorithms', () => {
  describe('ALGORITHMS', () => {
    it('contains 13 algorithms', () => {
      expect(ALGORITHMS).toHaveLength(13);
    });

    it('every algorithm has required fields', () => {
      for (const alg of ALGORITHMS) {
        expect(alg.id).toBeDefined();
        expect(alg.family).toBeDefined();
        expect(alg.description).toBeDefined();
        expect(alg.keyType).toMatch(/^(symmetric|asymmetric)$/);
        expect(alg.hashBits).toBeGreaterThan(0);
      }
    });
  });

  describe('ALGORITHM_FAMILIES', () => {
    it('contains 5 families', () => {
      expect(Object.keys(ALGORITHM_FAMILIES)).toHaveLength(5);
    });

    it('HMAC contains HS256, HS384, HS512', () => {
      expect(ALGORITHM_FAMILIES.HMAC).toEqual(['HS256', 'HS384', 'HS512']);
    });

    it('EdDSA contains only EdDSA', () => {
      expect(ALGORITHM_FAMILIES.EdDSA).toEqual(['EdDSA']);
    });
  });

  describe('getAlgorithmInfo', () => {
    it('returns info for HS256', () => {
      const info = getAlgorithmInfo('HS256');
      expect(info).toBeDefined();
      expect(info?.family).toBe('HMAC');
      expect(info?.keyType).toBe('symmetric');
    });

    it('returns info for RS256', () => {
      const info = getAlgorithmInfo('RS256');
      expect(info).toBeDefined();
      expect(info?.family).toBe('RSA');
      expect(info?.keyType).toBe('asymmetric');
    });

    it('returns undefined for unknown algorithm', () => {
      // @ts-expect-error testing invalid input
      expect(getAlgorithmInfo('UNKNOWN')).toBeUndefined();
    });
  });

  describe('getAlgorithmFamily', () => {
    it('returns HMAC for HS256', () => {
      expect(getAlgorithmFamily('HS256')).toBe('HMAC');
    });

    it('returns RSA-PSS for PS256', () => {
      expect(getAlgorithmFamily('PS256')).toBe('RSA-PSS');
    });

    it('throws for unknown algorithm', () => {
      // @ts-expect-error testing invalid input
      expect(() => getAlgorithmFamily('UNKNOWN')).toThrow('Unknown algorithm');
    });
  });

  describe('isSymmetric / isAsymmetric', () => {
    it('HS256 is symmetric', () => {
      expect(isSymmetric('HS256')).toBe(true);
      expect(isAsymmetric('HS256')).toBe(false);
    });

    it('RS256 is asymmetric', () => {
      expect(isSymmetric('RS256')).toBe(false);
      expect(isAsymmetric('RS256')).toBe(true);
    });

    it('EdDSA is asymmetric', () => {
      expect(isSymmetric('EdDSA')).toBe(false);
      expect(isAsymmetric('EdDSA')).toBe(true);
    });

    it('all HMAC algorithms are symmetric', () => {
      for (const alg of ALGORITHM_FAMILIES.HMAC) {
        expect(isSymmetric(alg)).toBe(true);
      }
    });

    it('all non-HMAC algorithms are asymmetric', () => {
      const asymmetricFamilies = ['RSA', 'ECDSA', 'RSA-PSS', 'EdDSA'] as const;
      for (const family of asymmetricFamilies) {
        for (const alg of ALGORITHM_FAMILIES[family]) {
          expect(isAsymmetric(alg)).toBe(true);
        }
      }
    });
  });
});
