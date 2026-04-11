import type { JwtAlgorithm } from '@tokx/core';
import { decode, verify } from '@tokx/core';
import { drawBadge } from '../ui/box.js';
import { c } from '../ui/colors.js';
import { startSpinner } from '../ui/spinner.js';

interface VerifyOptions {
  algorithm?: string;
  secret?: string;
  publicKey?: string;
  json?: boolean;
}

export async function verifyCommand(token: string, options: VerifyOptions): Promise<void> {
  try {
    if (!options.secret && !options.publicKey) {
      process.stderr.write(`${c.red('error')}: --secret or --public-key is required\n`);
      process.exit(1);
    }

    let alg = options.algorithm as JwtAlgorithm | undefined;
    if (!alg) {
      try {
        const decoded = decode(token);
        alg = decoded.header.alg as JwtAlgorithm;
      } catch {
        process.stderr.write(
          `${c.red('error')}: Could not detect algorithm. Use --algorithm to specify.\n`,
        );
        process.exit(1);
      }
    }

    const spinner = startSpinner('Verifying signature...');

    const result = await verify(token, {
      algorithm: alg as JwtAlgorithm,
      secret: options.secret || '',
      publicKey: options.publicKey,
    });

    if (options.json) {
      spinner.stop(result.valid, result.valid ? 'Valid' : 'Invalid');
      process.stdout.write(`${JSON.stringify(result)}\n`);
      if (!result.valid) process.exit(2);
      return;
    }

    if (result.valid) {
      spinner.stop(true, 'Verification complete');
      process.stdout.write(`\n${drawBadge('SIGNATURE VERIFIED', c.green, '✓')}\n\n`);
    } else {
      spinner.stop(false, 'Verification failed');
      process.stdout.write(`\n${drawBadge('INVALID SIGNATURE', c.red, '✗')}\n`);
      if (result.error) process.stderr.write(`  ${c.dim(result.error)}\n`);
      if (result.expired) process.stderr.write(`  ${c.yellow('Token has expired')}\n`);
      process.stdout.write('\n');
      process.exit(2);
    }
  } catch (err) {
    process.stderr.write(
      `${c.red('error')}: ${err instanceof Error ? err.message : 'Verification failed'}\n`,
    );
    process.exit(1);
  }
}
