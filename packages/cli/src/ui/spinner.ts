import { c, isTTY } from './colors.js';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function startSpinner(message: string): {
  stop: (success: boolean, finalMsg: string) => void;
} {
  if (!isTTY()) {
    return {
      stop: (success, finalMsg) => {
        const icon = success ? c.green('✓') : c.red('✗');
        process.stderr.write(`${icon} ${finalMsg}\n`);
      },
    };
  }

  let i = 0;
  const interval = setInterval(() => {
    process.stderr.write(`\r  ${c.cyan(FRAMES[i % FRAMES.length])} ${message}`);
    i++;
  }, 80);

  return {
    stop: (success, finalMsg) => {
      clearInterval(interval);
      const icon = success ? c.green('✓') : c.red('✗');
      process.stderr.write(`\r  ${icon} ${finalMsg}${' '.repeat(20)}\n`);
    },
  };
}
