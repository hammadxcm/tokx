import type { AlgorithmFamily, AlgorithmInfo, JwtAlgorithm } from './types.js';

export const ALGORITHM_FAMILIES: Record<AlgorithmFamily, JwtAlgorithm[]> = {
  HMAC: ['HS256', 'HS384', 'HS512'],
  RSA: ['RS256', 'RS384', 'RS512'],
  ECDSA: ['ES256', 'ES384', 'ES512'],
  'RSA-PSS': ['PS256', 'PS384', 'PS512'],
  EdDSA: ['EdDSA'],
};

export const ALGORITHMS: AlgorithmInfo[] = [
  {
    id: 'HS256',
    family: 'HMAC',
    description: 'HMAC using SHA-256',
    keyType: 'symmetric',
    hashBits: 256,
  },
  {
    id: 'HS384',
    family: 'HMAC',
    description: 'HMAC using SHA-384',
    keyType: 'symmetric',
    hashBits: 384,
  },
  {
    id: 'HS512',
    family: 'HMAC',
    description: 'HMAC using SHA-512',
    keyType: 'symmetric',
    hashBits: 512,
  },
  {
    id: 'RS256',
    family: 'RSA',
    description: 'RSASSA-PKCS1-v1_5 using SHA-256',
    keyType: 'asymmetric',
    hashBits: 256,
  },
  {
    id: 'RS384',
    family: 'RSA',
    description: 'RSASSA-PKCS1-v1_5 using SHA-384',
    keyType: 'asymmetric',
    hashBits: 384,
  },
  {
    id: 'RS512',
    family: 'RSA',
    description: 'RSASSA-PKCS1-v1_5 using SHA-512',
    keyType: 'asymmetric',
    hashBits: 512,
  },
  {
    id: 'ES256',
    family: 'ECDSA',
    description: 'ECDSA using P-256 and SHA-256',
    keyType: 'asymmetric',
    hashBits: 256,
  },
  {
    id: 'ES384',
    family: 'ECDSA',
    description: 'ECDSA using P-384 and SHA-384',
    keyType: 'asymmetric',
    hashBits: 384,
  },
  {
    id: 'ES512',
    family: 'ECDSA',
    description: 'ECDSA using P-521 and SHA-512',
    keyType: 'asymmetric',
    hashBits: 512,
  },
  {
    id: 'PS256',
    family: 'RSA-PSS',
    description: 'RSASSA-PSS using SHA-256',
    keyType: 'asymmetric',
    hashBits: 256,
  },
  {
    id: 'PS384',
    family: 'RSA-PSS',
    description: 'RSASSA-PSS using SHA-384',
    keyType: 'asymmetric',
    hashBits: 384,
  },
  {
    id: 'PS512',
    family: 'RSA-PSS',
    description: 'RSASSA-PSS using SHA-512',
    keyType: 'asymmetric',
    hashBits: 512,
  },
  {
    id: 'EdDSA',
    family: 'EdDSA',
    description: 'EdDSA using Ed25519',
    keyType: 'asymmetric',
    hashBits: 256,
  },
];

export function getAlgorithmInfo(alg: JwtAlgorithm): AlgorithmInfo | undefined {
  return ALGORITHMS.find((a) => a.id === alg);
}

export function getAlgorithmFamily(alg: JwtAlgorithm): AlgorithmFamily {
  const info = getAlgorithmInfo(alg);
  if (!info) throw new Error(`Unknown algorithm: ${alg}`);
  return info.family;
}

export function isSymmetric(alg: JwtAlgorithm): boolean {
  return getAlgorithmInfo(alg)?.keyType === 'symmetric';
}

export function isAsymmetric(alg: JwtAlgorithm): boolean {
  return getAlgorithmInfo(alg)?.keyType === 'asymmetric';
}
