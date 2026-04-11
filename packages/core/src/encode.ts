import { importPKCS8, SignJWT } from 'jose';
import { isSymmetric } from './algorithms.js';
import type { EncodeOptions } from './types.js';

/**
 * Encode (sign) a JWT.
 * For HMAC: uses `secret` as the signing key.
 * For RSA/ECDSA/EdDSA: uses `privateKey` PEM.
 */
export async function encode(options: EncodeOptions): Promise<string> {
  const { algorithm, payload, secret, privateKey, header, expiresIn } = options;

  let signingKey: CryptoKey | Uint8Array;

  if (isSymmetric(algorithm)) {
    if (!secret) throw new Error('Secret is required for HMAC algorithms');
    signingKey = new TextEncoder().encode(secret);
  } else {
    if (!privateKey) throw new Error('Private key is required for asymmetric algorithms');
    signingKey = await importPKCS8(privateKey, algorithm);
  }

  let jwt = new SignJWT({ ...payload }).setProtectedHeader({
    alg: algorithm,
    typ: 'JWT',
    ...header,
  });

  if (expiresIn) {
    jwt = jwt.setExpirationTime(`${expiresIn}s`);
  }

  if (payload.iat !== undefined) {
    jwt = jwt.setIssuedAt(payload.iat);
  } else {
    jwt = jwt.setIssuedAt();
  }

  return jwt.sign(signingKey);
}
