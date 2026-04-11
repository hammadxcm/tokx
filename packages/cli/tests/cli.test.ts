import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const CLI = resolve(__dirname, '../dist/index.js');
const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const SECRET = 'my-super-secret-key-that-is-long-enough';

function run(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execFileSync('node', [CLI, ...args], {
      encoding: 'utf-8',
      timeout: 10000,
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: e.stdout || '',
      stderr: e.stderr || '',
      exitCode: e.status || 1,
    };
  }
}

describe('tokx decode', () => {
  it('decodes a valid token', () => {
    const { stdout, exitCode } = run(['decode', SAMPLE_TOKEN]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('HS256');
    expect(stdout).toContain('1234567890');
    expect(stdout).toContain('John Doe');
  });

  it('outputs JSON with --json flag', () => {
    const { stdout, exitCode } = run(['decode', SAMPLE_TOKEN, '--json']);
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.header.alg).toBe('HS256');
    expect(parsed.payload.sub).toBe('1234567890');
  });

  it('fails on invalid token', () => {
    const { exitCode } = run(['decode', 'not-a-token']);
    expect(exitCode).toBe(1);
  });
});

describe('tokx encode', () => {
  it('creates a valid token', () => {
    const { stdout, exitCode } = run(['encode', '--secret', SECRET, '--payload', '{"sub":"123"}']);
    expect(exitCode).toBe(0);
    // Output now has token bar + multiline JWT parts
    expect(stdout).toContain('eyJ');
  });

  it('outputs JSON with --json flag', () => {
    const { stdout, exitCode } = run([
      'encode',
      '--secret',
      SECRET,
      '--payload',
      '{"sub":"123"}',
      '--json',
    ]);
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.token).toBeDefined();
    expect(parsed.token.split('.')).toHaveLength(3);
  });

  it('fails without --secret', () => {
    const { exitCode } = run(['encode', '--payload', '{"sub":"123"}']);
    expect(exitCode).toBe(1);
  });
});

describe('tokx verify', () => {
  it('verifies a correctly signed token', () => {
    const { stdout: encodeOut } = run([
      'encode',
      '--secret',
      SECRET,
      '--payload',
      '{"sub":"123"}',
      '--json',
    ]);
    const token = JSON.parse(encodeOut).token;

    const { exitCode } = run(['verify', token, '--secret', SECRET]);
    expect(exitCode).toBe(0);
  });

  it('returns JSON with --json flag', () => {
    const { stdout: encodeOut } = run([
      'encode',
      '--secret',
      SECRET,
      '--payload',
      '{"sub":"123"}',
      '--json',
    ]);
    const token = JSON.parse(encodeOut).token;

    const { stdout, exitCode } = run(['verify', token, '--secret', SECRET, '--json']);
    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout).valid).toBe(true);
  });

  it('fails with wrong secret (exit code 2)', () => {
    const { stdout: encodeOut } = run([
      'encode',
      '--secret',
      SECRET,
      '--payload',
      '{"sub":"123"}',
      '--json',
    ]);
    const token = JSON.parse(encodeOut).token;

    const { exitCode } = run(['verify', token, '--secret', 'wrong-secret-long-enough-too']);
    expect(exitCode).toBe(2);
  });
});

describe('tokx libs', () => {
  it('lists libraries', () => {
    const { stdout, exitCode } = run(['libs']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Library');
    expect(stdout).toContain('Lang');
  });

  it('filters by language', () => {
    const { stdout, exitCode } = run(['libs', '--language', 'Go']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('golang-jwt');
  });

  it('outputs JSON with --json flag', () => {
    const { stdout, exitCode } = run(['libs', '--json']);
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0].name).toBeDefined();
  });
});
