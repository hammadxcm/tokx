import { c, isTTY } from './colors.js';

export function printBanner(): void {
  if (!isTTY()) return;

  const t = c.red('t');
  const o = c.magenta('o');
  const k = c.cyan('k');
  const x = c.cyan('x');

  process.stderr.write('\n');
  process.stderr.write(`  ${c.dim('┌─────────────────────────────────┐')}\n`);
  process.stderr.write(
    `  ${c.dim('│')}  ${t} ${o} ${k} ${x}                          ${c.dim('│')}\n`,
  );
  process.stderr.write(
    `  ${c.dim('│')}  ${c.dim('JWT decode · encode · verify')}    ${c.dim('│')}\n`,
  );
  process.stderr.write(`  ${c.dim('└─────────────────────────────────┘')}\n`);
  process.stderr.write('\n');
}
