import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { decode } from './decode.js';
import { encode } from './encode.js';

describe('encode', () => {
  it('creates a valid HS256 token', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '1234567890', name: 'John Doe' },
      secret: 'my-super-secret-key-that-is-long-enough',
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('created token can be decoded back', async () => {
    const payload = { sub: 'user123', role: 'admin' };
    const token = await encode({
      algorithm: 'HS256',
      payload,
      secret: 'my-super-secret-key-that-is-long-enough',
    });

    const decoded = decode(token);
    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.typ).toBe('JWT');
    expect(decoded.payload.sub).toBe('user123');
    expect(decoded.payload.role).toBe('admin');
  });

  it('sets iat claim automatically', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123' },
      secret: 'my-super-secret-key-that-is-long-enough',
    });

    const decoded = decode(token);
    expect(decoded.payload.iat).toBeDefined();
    expect(typeof decoded.payload.iat).toBe('number');
  });

  it('sets exp claim from expiresIn', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123' },
      secret: 'my-super-secret-key-that-is-long-enough',
      expiresIn: 3600,
    });

    const decoded = decode(token);
    expect(decoded.payload.exp).toBeDefined();
    expect(typeof decoded.payload.exp).toBe('number');
    // exp should be roughly iat + 3600
    const diff = (decoded.payload.exp as number) - (decoded.payload.iat as number);
    expect(diff).toBe(3600);
  });

  it('uses custom header fields', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123' },
      secret: 'my-super-secret-key-that-is-long-enough',
      header: { kid: 'my-key-id' },
    });

    const decoded = decode(token);
    expect(decoded.header.kid).toBe('my-key-id');
    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.header.typ).toBe('JWT');
  });

  it('creates HS384 token', async () => {
    const token = await encode({
      algorithm: 'HS384',
      payload: { sub: '123' },
      secret: 'my-super-secret-key-that-is-long-enough-for-384',
    });

    const decoded = decode(token);
    expect(decoded.header.alg).toBe('HS384');
  });

  it('creates HS512 token', async () => {
    const token = await encode({
      algorithm: 'HS512',
      payload: { sub: '123' },
      secret: 'my-super-secret-key-that-is-long-enough-for-512-bits',
    });

    const decoded = decode(token);
    expect(decoded.header.alg).toBe('HS512');
  });

  it('throws on missing secret for HMAC', async () => {
    await expect(
      encode({
        algorithm: 'HS256',
        payload: { sub: '123' },
        secret: '',
      }),
    ).rejects.toThrow('Secret is required');
  });

  it('preserves custom iat value', async () => {
    const customIat = 1700000000;
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123', iat: customIat },
      secret: 'my-super-secret-key-that-is-long-enough',
    });

    const decoded = decode(token);
    expect(decoded.payload.iat).toBe(customIat);
  });

  it('creates RS256 token with private key', async () => {
    const { privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const token = await encode({
      algorithm: 'RS256',
      payload: { sub: '123' },
      secret: '',
      privateKey: privateKey as string,
    });

    const decoded = decode(token);
    expect(decoded.header.alg).toBe('RS256');
    expect(decoded.payload.sub).toBe('123');
  });

  it('throws on missing private key for asymmetric', async () => {
    await expect(
      encode({
        algorithm: 'RS256',
        payload: { sub: '123' },
        secret: '',
      }),
    ).rejects.toThrow('Private key is required');
  });
});
