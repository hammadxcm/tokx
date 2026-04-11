const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** Encode a string to base64url */
export function encode(input: string): string {
  const bytes = encoder.encode(input);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode a base64url string to UTF-8 */
export function decode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return decoder.decode(bytes);
}

/** Check if a string is valid base64url */
export function isValid(input: string): boolean {
  return /^[A-Za-z0-9_-]*$/.test(input);
}
