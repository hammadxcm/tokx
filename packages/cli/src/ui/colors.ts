import pc from 'picocolors';

const noColor = process.env.NO_COLOR !== undefined;

function wrap(fn: (s: string) => string): (s: string) => string {
  return noColor ? (s: string) => s : fn;
}

export const c = {
  red: wrap(pc.red),
  green: wrap(pc.green),
  yellow: wrap(pc.yellow),
  blue: wrap(pc.blue),
  cyan: wrap(pc.cyan),
  magenta: wrap(pc.magenta),
  gray: wrap(pc.gray),
  bold: wrap(pc.bold),
  dim: wrap(pc.dim),
};

export function isTTY(): boolean {
  return !noColor && process.stdout.isTTY === true;
}
