# @tokx/core

JWT decode, encode, and verify utilities wrapping [jose](https://github.com/panva/jose).

## Install

```bash
npm install @tokx/core
```

## Usage

```ts
import { decode, encode, verify } from '@tokx/core';

// Decode (no verification)
const { header, payload } = decode(token);

// Encode (sign)
const token = await encode({
  algorithm: 'HS256',
  payload: { sub: '123', name: 'John' },
  secret: 'your-secret',
  expiresIn: 3600,
});

// Verify
const result = await verify(token, {
  algorithm: 'HS256',
  secret: 'your-secret',
});
// { valid: true } or { valid: false, error: '...', expired?: true }
```

## API

### `decode(token: string): DecodedJwt`

Decode a JWT without verification. Returns header, payload, signature, and raw parts.

### `encode(options: EncodeOptions): Promise<string>`

Sign a JWT. Supports HMAC (HS256/384/512), RSA (RS256/384/512), ECDSA (ES256/384/512), RSA-PSS (PS256/384/512), and EdDSA.

### `verify(token: string, options: VerifyOptions): Promise<VerifyResult>`

Verify a JWT signature and validate claims. Returns `{ valid: true }` or `{ valid: false, error, expired?, notBefore? }`.

### Algorithm Utilities

- `ALGORITHMS` — Array of all 13 supported algorithm metadata objects
- `getAlgorithmInfo(alg)` — Get metadata for an algorithm
- `isSymmetric(alg)` / `isAsymmetric(alg)` — Check key type

## Supported Algorithms

HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384, ES512, PS256, PS384, PS512, EdDSA

## License

MIT
