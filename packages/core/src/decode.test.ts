import { describe, expect, it } from 'vitest';
import * as base64url from './base64url.js';
import { decode } from './decode.js';

// Helper to create a raw JWT string from parts
function makeToken(header: object, payload: object, signature = 'test-sig'): string {
  const h = base64url.encode(JSON.stringify(header));
  const p = base64url.encode(JSON.stringify(payload));
  return `${h}.${p}.${signature}`;
}

describe('decode', () => {
  const sampleToken = makeToken(
    { alg: 'HS256', typ: 'JWT' },
    { sub: '1234567890', name: 'John Doe', iat: 1516239022 },
  );

  it('decodes a valid JWT', () => {
    const result = decode(sampleToken);
    expect(result.header.alg).toBe('HS256');
    expect(result.header.typ).toBe('JWT');
    expect(result.payload.sub).toBe('1234567890');
    expect(result.payload.name).toBe('John Doe');
    expect(result.payload.iat).toBe(1516239022);
  });

  it('returns raw parts', () => {
    const result = decode(sampleToken);
    expect(result.raw.header).toBeDefined();
    expect(result.raw.payload).toBeDefined();
    expect(result.raw.signature).toBe('test-sig');
  });

  it('decodes token with all registered claims', () => {
    const payload = {
      iss: 'https://example.com',
      sub: 'user123',
      aud: 'api.example.com',
      exp: 9999999999,
      nbf: 1000000000,
      iat: 1000000000,
      jti: 'unique-id',
    };
    const token = makeToken({ alg: 'RS256' }, payload);
    const result = decode(token);
    expect(result.payload.iss).toBe('https://example.com');
    expect(result.payload.sub).toBe('user123');
    expect(result.payload.aud).toBe('api.example.com');
    expect(result.payload.exp).toBe(9999999999);
    expect(result.payload.nbf).toBe(1000000000);
    expect(result.payload.iat).toBe(1000000000);
    expect(result.payload.jti).toBe('unique-id');
  });

  it('decodes token with array aud claim', () => {
    const token = makeToken({ alg: 'HS256' }, { aud: ['api1', 'api2'] });
    const result = decode(token);
    expect(result.payload.aud).toEqual(['api1', 'api2']);
  });

  it('throws on empty string', () => {
    expect(() => decode('')).toThrow('non-empty string');
  });

  it('throws on non-string input', () => {
    // @ts-expect-error testing invalid input
    expect(() => decode(null)).toThrow('non-empty string');
    // @ts-expect-error testing invalid input
    expect(() => decode(123)).toThrow('non-empty string');
  });

  it('throws on token with wrong number of parts', () => {
    expect(() => decode('one.two')).toThrow('expected 3 parts, got 2');
    expect(() => decode('one')).toThrow('expected 3 parts, got 1');
    expect(() => decode('a.b.c.d')).toThrow('expected 3 parts, got 4');
  });

  it('throws on invalid base64url in header', () => {
    expect(() => decode('not valid base64!.eyJ0ZXN0IjoxfQ.sig')).toThrow(
      'Invalid base64url in header',
    );
  });

  it('throws on invalid base64url in payload', () => {
    const validHeader = base64url.encode(JSON.stringify({ alg: 'HS256' }));
    expect(() => decode(`${validHeader}.not valid!.sig`)).toThrow('Invalid base64url in payload');
  });

  it('throws on invalid JSON in header', () => {
    const badHeader = base64url.encode('not json');
    expect(() => decode(`${badHeader}.eyJ0ZXN0IjoxfQ.sig`)).toThrow('Invalid JSON in header');
  });

  it('throws on invalid JSON in payload', () => {
    const header = base64url.encode(JSON.stringify({ alg: 'HS256' }));
    const badPayload = base64url.encode('not json');
    expect(() => decode(`${header}.${badPayload}.sig`)).toThrow('Invalid JSON in payload');
  });

  it('throws when header has no alg field', () => {
    const token = makeToken({ typ: 'JWT' }, { sub: '123' });
    expect(() => decode(token)).toThrow('"alg" field');
  });

  it('handles null payload (falls back to empty object)', () => {
    const h = base64url.encode(JSON.stringify({ alg: 'HS256' }));
    const p = base64url.encode('null');
    const token = `${h}.${p}.sig`;
    const result = decode(token);
    expect(result.payload).toEqual({});
  });

  it('handles empty payload object', () => {
    const token = makeToken({ alg: 'HS256' }, {});
    const result = decode(token);
    expect(result.payload).toEqual({});
  });

  it('preserves custom claims', () => {
    const token = makeToken({ alg: 'HS256' }, { custom: 'value', nested: { a: 1 } });
    const result = decode(token);
    expect(result.payload.custom).toBe('value');
    expect(result.payload.nested).toEqual({ a: 1 });
  });
});
