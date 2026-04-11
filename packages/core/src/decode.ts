import * as base64url from './base64url.js';
import type { DecodedJwt } from './types.js';

/**
 * Decode a JWT without verification.
 * Splits on '.', base64url-decodes header and payload, returns structured data.
 * Throws if the token format is invalid.
 */
export function decode(token: string): DecodedJwt {
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('Token must be a non-empty string');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid JWT format: expected 3 parts, got ${parts.length}`);
  }

  const [rawHeader, rawPayload, rawSignature] = parts as [string, string, string];

  if (!base64url.isValid(rawHeader)) {
    throw new Error('Invalid base64url in header');
  }
  if (!base64url.isValid(rawPayload)) {
    throw new Error('Invalid base64url in payload');
  }

  let header: unknown;
  let payload: unknown;

  try {
    header = JSON.parse(base64url.decode(rawHeader));
  } catch {
    throw new Error('Invalid JSON in header');
  }

  try {
    payload = JSON.parse(base64url.decode(rawPayload));
  } catch {
    throw new Error('Invalid JSON in payload');
  }

  if (typeof header !== 'object' || header === null || !('alg' in header)) {
    throw new Error('Header must be an object with an "alg" field');
  }

  return {
    header: header as DecodedJwt['header'],
    payload: (payload ?? {}) as DecodedJwt['payload'],
    signature: rawSignature,
    raw: {
      header: rawHeader,
      payload: rawPayload,
      signature: rawSignature,
    },
  };
}
