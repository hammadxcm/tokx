import type { JwtAlgorithm } from '@tokx/core';
import { encode } from '@tokx/core';
import clipboard from 'clipboardy';
import { tokenBar } from '../ui/box.js';
import { c } from '../ui/colors.js';
import { startSpinner } from '../ui/spinner.js';

interface EncodeOptions {
  algorithm: string;
  secret: string;
  payload: string;
  expires?: string;
  json?: boolean;
  copy?: boolean;
}

export async function encodeCommand(options: EncodeOptions): Promise<void> {
  try {
    if (!options.secret) {
      process.stderr.write(`${c.red('error')}: --secret is required\n`);
      process.exit(1);
    }
    if (!options.payload) {
      process.stderr.write(`${c.red('error')}: --payload is required\n`);
      process.exit(1);
    }

    let payloadObj: Record<string, unknown>;
    try {
      payloadObj = JSON.parse(options.payload);
    } catch {
      process.stderr.write(`${c.red('error')}: --payload must be valid JSON\n`);
      process.exit(1);
    }

    const spinner = startSpinner('Signing token...');

    const token = await encode({
      algorithm: options.algorithm as JwtAlgorithm,
      payload: payloadObj,
      secret: options.secret,
      expiresIn: options.expires ? Number(options.expires) : undefined,
    });

    spinner.stop(true, `Token signed ${c.dim(`(${options.algorithm})`)}`);

    if (options.json) {
      process.stdout.write(`${JSON.stringify({ token })}\n`);
    } else {
      const parts = token.split('.');
      process.stdout.write('\n');
      if (parts.length === 3) {
        process.stdout.write(`${tokenBar(parts[0], parts[1], parts[2])}\n\n`);
        process.stdout.write(
          `  ${c.red(parts[0])}\n  ${c.dim('.')}\n  ${c.magenta(parts[1])}\n  ${c.dim('.')}\n  ${c.cyan(parts[2])}\n`,
        );
      } else {
        process.stdout.write(`  ${token}\n`);
      }
      process.stdout.write('\n');
    }

    if (options.copy) {
      await clipboard.write(token);
      process.stderr.write(`  ${c.green('✓')} ${c.dim('Copied token to clipboard')}\n\n`);
    }
  } catch (err) {
    process.stderr.write(
      `${c.red('error')}: ${err instanceof Error ? err.message : 'Failed to encode token'}\n`,
    );
    process.exit(1);
  }
}
