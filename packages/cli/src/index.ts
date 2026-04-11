import { readFileSync } from 'node:fs';
import { program } from 'commander';
import { decodeCommand } from './commands/decode.js';
import { encodeCommand } from './commands/encode.js';
import { libsCommand } from './commands/libs.js';
import { verifyCommand } from './commands/verify.js';
import { printBanner } from './ui/banner.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

program
  .name('tokx')
  .description('JWT decode, encode, verify from your terminal')
  .version(pkg.version);

// Show banner when no command provided
if (process.argv.length <= 2) {
  printBanner();
}

// Helper: read token from stdin if '-' is passed
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString().trim();
}

program
  .command('decode <token>')
  .description('Decode a JWT and display header + payload (use - for stdin)')
  .option('--json', 'Output as JSON')
  .action(async (token: string, options: { json?: boolean }) => {
    const t = token === '-' ? await readStdin() : token;
    return decodeCommand(t, options);
  });

program
  .command('encode')
  .description('Encode (sign) a new JWT')
  .requiredOption('--secret <secret>', 'Signing secret (HMAC)')
  .requiredOption('--payload <json>', 'Payload as JSON string')
  .option('--algorithm <alg>', 'Algorithm', 'HS256')
  .option('--expires <seconds>', 'Expiration in seconds from now')
  .option('--json', 'Output as JSON')
  .action(encodeCommand);

program
  .command('verify <token>')
  .description('Verify a JWT signature (use - for stdin)')
  .option('--secret <secret>', 'Verification secret (HMAC)')
  .option('--public-key <path>', 'Public key PEM file path')
  .option('--algorithm <alg>', 'Algorithm (auto-detected if omitted)')
  .option('--json', 'Output as JSON')
  .action(
    async (
      token: string,
      options: { secret?: string; publicKey?: string; algorithm?: string; json?: boolean },
    ) => {
      const t = token === '-' ? await readStdin() : token;
      return verifyCommand(t, options);
    },
  );

program
  .command('libs')
  .description('List JWT libraries')
  .option('--language <lang>', 'Filter by language')
  .option('--algorithm <alg>', 'Filter by algorithm')
  .option('--json', 'Output as JSON')
  .action(libsCommand);

program.parse();
