import type { JwtAlgorithm, VerifyResult } from '@tokx/core';
import { ALGORITHMS, decode, encode, isSymmetric, verify } from '@tokx/core';
import { useCallback, useEffect, useState } from 'react';

const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const SAMPLE_SECRET = 'your-256-bit-secret';

export default function JwtDebugger() {
  const [token, setToken] = useState(SAMPLE_TOKEN);
  const [headerText, setHeaderText] = useState('');
  const [payloadText, setPayloadText] = useState('');
  const [algorithm, setAlgorithm] = useState<JwtAlgorithm>('HS256');
  const [secret, setSecret] = useState(SAMPLE_SECRET);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  // Decode token when it changes
  const decodeToken = useCallback((t: string) => {
    try {
      const decoded = decode(t);
      setHeaderText(JSON.stringify(decoded.header, null, 2));
      setPayloadText(JSON.stringify(decoded.payload, null, 2));
      setAlgorithm((decoded.header.alg as JwtAlgorithm) || 'HS256');
    } catch {
      // Invalid token — keep current state
    }
  }, []);

  // Verify token when token or secret changes
  useEffect(() => {
    if (!token || !secret) {
      setVerifyResult(null);
      return;
    }
    const controller = new AbortController();
    verify(token, { algorithm, secret })
      .then((result) => {
        if (!controller.signal.aborted) setVerifyResult(result);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setVerifyResult({ valid: false, error: 'Verification failed' });
      });
    return () => controller.abort();
  }, [token, secret, algorithm]);

  // Initial decode — check URL param first, then fallback to sample
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      decodeToken(urlToken);
    } else {
      decodeToken(SAMPLE_TOKEN);
    }
  }, [decodeToken]);

  // Update URL when token changes (for sharing)
  useEffect(() => {
    if (!token || token === SAMPLE_TOKEN) return;
    const url = new URL(window.location.href);
    url.searchParams.set('token', token);
    window.history.replaceState(null, '', url.toString());
  }, [token]);

  // Re-encode when decoded parts change
  const handleDecodedChange = useCallback(
    async (newHeader: string, newPayload: string) => {
      if (!isSymmetric(algorithm)) return;
      try {
        const h = JSON.parse(newHeader);
        const p = JSON.parse(newPayload);
        const newToken = await encode({ algorithm, payload: p, secret, header: h });
        setToken(newToken);
      } catch {
        // Invalid JSON — don't update token
      }
    },
    [algorithm, secret],
  );

  return (
    <section className="debugger-section" id="debugger">
      <div className="section-header reveal">
        <span className="section-label">debugger</span>
        <h2 className="section-title">Paste a JWT to decode it</h2>
        <div className="section-divider"></div>
      </div>

      <div className="debugger-container glow-border">
        {/* Encoded panel */}
        <div className="debugger-encoded">
          <div className="debugger-encoded-label">Encoded</div>
          <textarea
            className="debugger-token-input"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              decodeToken(e.target.value);
            }}
            aria-label="JWT token input"
            placeholder="Paste a JWT token..."
            rows={8}
          />
          {/* Paste/Clear buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem' }}
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setToken(text);
                  decodeToken(text);
                } catch {
                  /* clipboard access denied */
                }
              }}
            >
              Paste
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem' }}
              onClick={() => {
                setToken('');
                setHeaderText('');
                setPayloadText('');
                setVerifyResult(null);
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Decoded panel */}
        <div className="debugger-decoded">
          {/* Algorithm selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            <label
              htmlFor="algo-select"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Algorithm
            </label>
            <select
              id="algo-select"
              className="debugger-algo-select"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as JwtAlgorithm)}
            >
              {ALGORITHMS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id}
                </option>
              ))}
            </select>
          </div>

          {/* Header */}
          <div>
            <div className="debugger-section-label debugger-section-label--header">Header</div>
            <textarea
              className="debugger-json debugger-json--header"
              value={headerText}
              onChange={(e) => {
                setHeaderText(e.target.value);
                handleDecodedChange(e.target.value, payloadText);
              }}
              aria-label="JWT header JSON"
              rows={4}
            />
          </div>

          {/* Payload */}
          <div>
            <div className="debugger-section-label debugger-section-label--payload">Payload</div>
            <textarea
              className="debugger-json debugger-json--payload"
              value={payloadText}
              onChange={(e) => {
                setPayloadText(e.target.value);
                handleDecodedChange(headerText, e.target.value);
              }}
              aria-label="JWT payload JSON"
              rows={6}
            />
          </div>

          {/* Verify Signature */}
          <div>
            <div className="debugger-section-label debugger-section-label--verify">
              Verify Signature
            </div>
            <input
              type="text"
              className="debugger-secret-input"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={isSymmetric(algorithm) ? 'your-256-bit-secret' : 'Public key (PEM)'}
              aria-label="Secret or public key for verification"
            />
          </div>

          {/* Verification badge */}
          <div aria-live="polite">
            {verifyResult && (
              <div
                className={`verify-badge ${verifyResult.valid ? 'verify-valid' : 'verify-invalid'}`}
              >
                {verifyResult.valid ? (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <title>Verified</title>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Signature Verified
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <title>Invalid</title>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Invalid Signature
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
