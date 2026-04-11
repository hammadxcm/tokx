import { c } from './colors.js';

type ColorFn = (s: string) => string;

export function drawBox(title: string, content: string, color: ColorFn): string {
  const lines = content.split('\n');
  const maxLen = Math.max(title.length + 4, ...lines.map((l) => l.length));
  const width = Math.min(maxLen + 4, 60);

  const top = color(`  ┌─ ${title} ${'─'.repeat(Math.max(0, width - title.length - 5))}┐`);
  const bottom = color(`  └${'─'.repeat(width - 1)}┘`);

  const body = lines.map((line) => {
    const padded = line.padEnd(width - 4);
    return `  ${color('│')} ${padded} ${color('│')}`;
  });

  return [top, ...body, bottom].join('\n');
}

export function drawBadge(text: string, color: ColorFn, icon: string): string {
  const inner = ` ${icon} ${text} `;
  const width = inner.length + 2;
  const top = color(`  ╔${'═'.repeat(width)}╗`);
  const mid = color(`  ║${inner}║`);
  const bottom = color(`  ╚${'═'.repeat(width)}╝`);
  return `${top}\n${mid}\n${bottom}`;
}

export function tokenBar(header: string, payload: string, signature: string): string {
  const total = 50;
  const hLen = Math.max(
    2,
    Math.round((header.length / (header.length + payload.length + signature.length)) * total),
  );
  const pLen = Math.max(
    2,
    Math.round((payload.length / (header.length + payload.length + signature.length)) * total),
  );
  const sLen = Math.max(2, total - hLen - pLen);

  return `  ${c.red('█'.repeat(hLen))}${c.dim('.')}${c.magenta('█'.repeat(pLen))}${c.dim('.')}${c.cyan('█'.repeat(sLen))}`;
}
