/** Supported JWT signing algorithms */
export type JwtAlgorithm =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'EdDSA';

/** Algorithm category for UI grouping */
export type AlgorithmFamily = 'HMAC' | 'RSA' | 'ECDSA' | 'RSA-PSS' | 'EdDSA';

/** Algorithm metadata for UI display */
export interface AlgorithmInfo {
  id: JwtAlgorithm;
  family: AlgorithmFamily;
  description: string;
  keyType: 'symmetric' | 'asymmetric';
  hashBits: number;
}

/** Decoded JWT parts */
export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  /** Raw parts before decoding */
  raw: { header: string; payload: string; signature: string };
}

/** Standard JWT header */
export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

/** Standard JWT payload with registered claims */
export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

/** Result of JWT verification */
export interface VerifyResult {
  valid: boolean;
  error?: string;
  /** Whether the token has expired (exp claim) */
  expired?: boolean;
  /** Whether the token is not yet valid (nbf claim) */
  notBefore?: boolean;
}

/** Encode options */
export interface EncodeOptions {
  algorithm: JwtAlgorithm;
  header?: Partial<JwtHeader>;
  payload: JwtPayload;
  secret: string;
  /** PEM private key for asymmetric algorithms */
  privateKey?: string;
  /** Expiration in seconds from now (convenience) */
  expiresIn?: number;
}

/** Verify options */
export interface VerifyOptions {
  algorithm: JwtAlgorithm;
  secret: string;
  /** PEM public key for asymmetric algorithms */
  publicKey?: string;
  /** Skip expiration check */
  ignoreExpiration?: boolean;
}
