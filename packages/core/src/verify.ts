import { importSPKI, jwtVerify } from 'jose';
import { isSymmetric } from './algorithms.js';
import type { VerifyOptions, VerifyResult } from './types.js';

/**
 * Verify a JWT signature and validate claims.
 * Returns { valid: true } or { valid: false, error: '...' }.
 */
export async function verify(token: string, options: VerifyOptions): Promise<VerifyResult> {
  const { algorithm, secret, publicKey, ignoreExpiration } = options;

  try {
    let verificationKey: CryptoKey | Uint8Array;

    if (isSymmetric(algorithm)) {
      if (!secret) return { valid: false, error: 'Secret is required for HMAC algorithms' };
      verificationKey = new TextEncoder().encode(secret);
    } else {
      if (!publicKey)
        return { valid: false, error: 'Public key is required for asymmetric algorithms' };
      verificationKey = await importSPKI(publicKey, algorithm);
    }

    const verifyOptions: { algorithms: string[]; clockTolerance?: number } = {
      algorithms: [algorithm],
    };

    if (ignoreExpiration) {
      verifyOptions.clockTolerance = Number.MAX_SAFE_INTEGER;
    }

    await jwtVerify(token, verificationKey, verifyOptions);
    return { valid: true };
  } catch (err) {
    const message = (err as Error).message;

    if (message.includes('exp') || message.includes('expired')) {
      return { valid: false, error: message, expired: true };
    }

    if (message.includes('nbf') || message.includes('not active')) {
      return { valid: false, error: message, notBefore: true };
    }

    return { valid: false, error: message };
  }
}
