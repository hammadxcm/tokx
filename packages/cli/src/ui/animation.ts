import { c, isTTY } from './colors.js';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function playDecodeAnimation(token: string): Promise<void> {
  if (!isTTY()) return;

  const parts = token.split('.');
  if (parts.length !== 3) return;

  const frames = [
    `  ${c.dim(token.slice(0, 40))}${c.dim('...')}`,
    `  ${c.red(parts[0].slice(0, 12))}${c.dim('...')} ${c.dim('·')} ${c.magenta(parts[1].slice(0, 12))}${c.dim('...')} ${c.dim('·')} ${c.cyan(parts[2].slice(0, 12))}${c.dim('...')}`,
    `  ${c.red('■ header')}  ${c.dim('·')}  ${c.magenta('■ payload')}  ${c.dim('·')}  ${c.cyan('■ signature')}`,
  ];

  process.stdout.write('\n');
  for (const frame of frames) {
    process.stdout.write(`\r${frame}${' '.repeat(20)}`);
    await sleep(120);
  }
  process.stdout.write('\n\n');
}
