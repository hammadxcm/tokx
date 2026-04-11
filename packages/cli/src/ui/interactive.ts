import type { JwtAlgorithm } from '@tokx/core';
import { ALGORITHMS } from '@tokx/core';
import { c, isTTY } from './colors.js';
import { withRawMode } from './raw-mode.js';

export async function selectAlgorithm(): Promise<JwtAlgorithm> {
  if (!isTTY()) return 'HS256';

  return new Promise((resolve) => {
    let cursor = 0;
    const items = ALGORITHMS;
    const { stdin, stdout } = process;

    function render() {
      const totalLines = items.length + 2;
      stdout.write(`\x1B[${totalLines}A`);
      stdout.write('\x1B[J');

      stdout.write(
        `  ${c.bold('Select algorithm')} ${c.dim('(↑↓/jk=navigate, enter=select, q=quit)')}\n\n`,
      );

      for (let i = 0; i < items.length; i++) {
        const alg = items[i];
        const isCursor = i === cursor;
        const pointer = isCursor ? c.cyan('>') : ' ';
        const name = isCursor ? c.bold(c.cyan(alg.id)) : alg.id;
        const desc = c.dim(alg.description);
        const keyType = alg.keyType === 'symmetric' ? c.yellow('symmetric') : c.blue('asymmetric');
        stdout.write(
          `  ${pointer} ${name.padEnd(isCursor ? 18 : 8)} ${desc} ${c.dim('(')}${keyType}${c.dim(')')}\n`,
        );
      }
    }

    // Push initial lines
    stdout.write('\n'.repeat(items.length + 2));
    render();

    withRawMode(stdin, (restoreMode) => {
      const cleanup = () => {
        stdin.removeListener('data', onKey);
        restoreMode();
      };

      const onKey = (key: string) => {
        if (key === '\u0003' || key === 'q') {
          cleanup();
          stdout.write('\n');
          process.exit(130);
        }

        if (key === '\u001B[A' || key === 'k') {
          cursor = Math.max(0, cursor - 1);
        } else if (key === '\u001B[B' || key === 'j') {
          cursor = Math.min(items.length - 1, cursor + 1);
        } else if (key === '\r' || key === '\n') {
          cleanup();
          stdout.write('\n');
          resolve(items[cursor].id);
          return;
        }

        render();
      };

      stdin.on('data', onKey);
    });
  });
}
