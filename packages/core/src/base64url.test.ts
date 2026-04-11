import { describe, expect, it } from 'vitest';
import * as base64url from './base64url.js';

describe('base64url', () => {
  describe('encode', () => {
    it('encodes a simple string', () => {
      expect(base64url.encode('hello')).toBe('aGVsbG8');
    });

    it('encodes an empty string', () => {
      expect(base64url.encode('')).toBe('');
    });

    it('encodes JSON', () => {
      const json = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
      const encoded = base64url.encode(json);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    it('encodes special characters', () => {
      const result = base64url.encode('subjects?_d=1&type=all');
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
    });
  });

  describe('decode', () => {
    it('decodes a simple string', () => {
      expect(base64url.decode('aGVsbG8')).toBe('hello');
    });

    it('decodes an empty string', () => {
      expect(base64url.decode('')).toBe('');
    });

    it('roundtrips with encode', () => {
      const original = '{"sub":"1234567890","name":"John Doe","iat":1516239022}';
      expect(base64url.decode(base64url.encode(original))).toBe(original);
    });

    it('roundtrips unicode characters', () => {
      const original = 'Hello, World!';
      expect(base64url.decode(base64url.encode(original))).toBe(original);
    });
  });

  describe('isValid', () => {
    it('returns true for valid base64url', () => {
      expect(base64url.isValid('aGVsbG8')).toBe(true);
      expect(base64url.isValid('abc123_-')).toBe(true);
      expect(base64url.isValid('')).toBe(true);
    });

    it('returns false for invalid base64url', () => {
      expect(base64url.isValid('hello world')).toBe(false);
      expect(base64url.isValid('abc+def')).toBe(false);
      expect(base64url.isValid('abc/def')).toBe(false);
      expect(base64url.isValid('abc=def')).toBe(false);
    });
  });
});
