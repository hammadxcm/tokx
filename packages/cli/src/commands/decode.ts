import { decode } from '@tokx/core';
import clipboard from 'clipboardy';
import { playDecodeAnimation } from '../ui/animation.js';
import { drawBox, tokenBar } from '../ui/box.js';
import { c } from '../ui/colors.js';

interface DecodeOptions {
  json?: boolean;
  copy?: boolean;
}

function relativeTime(epoch: number): string {
  const diff = epoch - Date.now() / 1000;
  const abs = Math.abs(diff);
  const past = diff < 0;
  const units: [number, string][] = [
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ];
  const parts: string[] = [];
  let remaining = abs;
  for (const [sec, label] of units) {
    if (remaining >= sec) {
      parts.push(`${Math.floor(remaining / sec)}${label}`);
      remaining %= sec;
    }
  }
  const str = parts.length > 0 ? parts.slice(0, 2).join(' ') : '<1m';
  return past ? `${str} ago` : `in ${str}`;
}

function claimIcon(present: boolean, valid?: boolean): string {
  if (!present) return c.dim('○');
  if (valid === false) return c.red('✗');
  return c.green('✓');
}

export async function decodeCommand(token: string, options: DecodeOptions): Promise<void> {
  try {
    const result = decode(token);

    if (options.json) {
      process.stdout.write(
        `${JSON.stringify({ header: result.header, payload: result.payload }, null, 2)}\n`,
      );
      return;
    }

    await playDecodeAnimation(token);

    // Token bar
    process.stdout.write(
      `${tokenBar(result.raw.header, result.raw.payload, result.raw.signature)}\n\n`,
    );

    // Header box
    const headerJson = JSON.stringify(result.header, null, 2);
    process.stdout.write(
      `${drawBox(`HEADER ${c.dim(`(${result.header.alg})`)}`, headerJson, c.red)}\n\n`,
    );

    // Payload box
    const payloadJson = JSON.stringify(result.payload, null, 2);
    process.stdout.write(`${drawBox('PAYLOAD', payloadJson, c.magenta)}\n\n`);

    // Claims summary
    const p = result.payload;
    const now = Date.now() / 1000;
    process.stdout.write(`  ${c.bold('Claims')}\n`);

    const expValid = p.exp ? (p.exp as number) > now : undefined;
    const nbfValid = p.nbf ? (p.nbf as number) <= now : undefined;

    const claims = [
      { key: 'iss', val: p.iss as string | undefined },
      { key: 'sub', val: p.sub as string | undefined },
      { key: 'aud', val: p.aud as string | undefined },
      { key: 'iat', val: p.iat ? new Date((p.iat as number) * 1000).toISOString() : undefined },
      {
        key: 'exp',
        val: p.exp
          ? `${new Date((p.exp as number) * 1000).toISOString()} ${c.dim(`(${relativeTime(p.exp as number)})`)}`
          : undefined,
        valid: expValid,
      },
      {
        key: 'nbf',
        val: p.nbf ? new Date((p.nbf as number) * 1000).toISOString() : undefined,
        valid: nbfValid,
      },
      { key: 'jti', val: p.jti as string | undefined },
    ];

    for (const claim of claims) {
      const icon = claimIcon(claim.val !== undefined, (claim as { valid?: boolean }).valid);
      const value = claim.val ? c.dim(String(claim.val)) : c.dim('—');
      process.stdout.write(`  ${icon} ${c.bold(claim.key.padEnd(4))} ${value}\n`);
    }

    process.stdout.write(`\n  ${c.dim('Algorithm:')} ${c.cyan(result.header.alg)}\n\n`);

    if (options.copy) {
      const copyText = JSON.stringify({ header: result.header, payload: result.payload }, null, 2);
      await clipboard.write(copyText);
      process.stderr.write(`  ${c.green('✓')} ${c.dim('Copied decoded token to clipboard')}\n\n`);
    }
  } catch (err) {
    process.stderr.write(
      `${c.red('error')}: ${err instanceof Error ? err.message : 'Failed to decode token'}\n`,
    );
    process.exit(1);
  }
}
