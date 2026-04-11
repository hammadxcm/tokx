import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { encode } from './encode.js';
import { verify } from './verify.js';

const SECRET = 'my-super-secret-key-that-is-long-enough';

describe('verify', () => {
  it('returns valid: true for a correctly signed token', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123' },
      secret: SECRET,
    });

    const result = await verify(token, {
      algorithm: 'HS256',
      secret: SECRET,
    });

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns valid: false for wrong secret', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123' },
      secret: SECRET,
    });

    const result = await verify(token, {
      algorithm: 'HS256',
      secret: 'wrong-secret-that-is-long-enough-too',
    });

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns valid: false with expired: true for expired token', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123', exp: Math.floor(Date.now() / 1000) - 3600 },
      secret: SECRET,
    });

    const result = await verify(token, {
      algorithm: 'HS256',
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
    expect(result.expired).toBe(true);
  });

  it('ignoreExpiration bypasses exp check', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123', exp: Math.floor(Date.now() / 1000) - 3600 },
      secret: SECRET,
    });

    const result = await verify(token, {
      algorithm: 'HS256',
      secret: SECRET,
      ignoreExpiration: true,
    });

    expect(result.valid).toBe(true);
  });

  it('verifies HS384 token', async () => {
    const secret384 = 'my-super-secret-key-that-is-long-enough-for-384';
    const token = await encode({
      algorithm: 'HS384',
      payload: { sub: '123' },
      secret: secret384,
    });

    const result = await verify(token, {
      algorithm: 'HS384',
      secret: secret384,
    });

    expect(result.valid).toBe(true);
  });

  it('verifies HS512 token', async () => {
    const secret512 = 'my-super-secret-key-that-is-long-enough-for-512-bits-yeah';
    const token = await encode({
      algorithm: 'HS512',
      payload: { sub: '123' },
      secret: secret512,
    });

    const result = await verify(token, {
      algorithm: 'HS512',
      secret: secret512,
    });

    expect(result.valid).toBe(true);
  });

  it('returns error when secret is missing for HMAC', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123' },
      secret: SECRET,
    });

    const result = await verify(token, {
      algorithm: 'HS256',
      secret: '',
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Secret is required');
  });

  it('returns error when public key is missing for asymmetric', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123' },
      secret: SECRET,
    });

    const result = await verify(token, {
      algorithm: 'RS256',
      secret: '',
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Public key is required');
  });

  it('verifies RS256 token with public key', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
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

    const result = await verify(token, {
      algorithm: 'RS256',
      secret: '',
      publicKey: publicKey as string,
    });

    expect(result.valid).toBe(true);
  });

  it('returns valid: false with notBefore: true for future nbf', async () => {
    const futureNbf = Math.floor(Date.now() / 1000) + 3600;
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123', nbf: futureNbf },
      secret: SECRET,
    });

    const result = await verify(token, {
      algorithm: 'HS256',
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
    expect(result.notBefore).toBe(true);
  });

  it('handles completely malformed token gracefully', async () => {
    const result = await verify('a.b.c', {
      algorithm: 'HS256',
      secret: SECRET,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns valid: false for tampered token', async () => {
    const token = await encode({
      algorithm: 'HS256',
      payload: { sub: '123', role: 'user' },
      secret: SECRET,
    });

    // Tamper with the payload portion
    const parts = token.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}abc.${parts[2]}`;

    const result = await verify(tamperedToken, {
      algorithm: 'HS256',
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
  });
});
