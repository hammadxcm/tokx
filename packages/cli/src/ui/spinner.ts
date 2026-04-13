import ora from 'ora';
import { c, isTTY } from './colors.js';

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

  const spinner = ora({
    text: message,
    color: 'magenta',
    indent: 2,
  }).start();

  return {
    stop: (success, finalMsg) => {
      if (success) {
        spinner.succeed(finalMsg);
      } else {
        spinner.fail(finalMsg);
      }
    },
  };
}
