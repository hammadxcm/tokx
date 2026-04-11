import Table from 'cli-table3';
import { c } from '../ui/colors.js';

interface LibsOptions {
  language?: string;
  algorithm?: string;
  json?: boolean;
}

interface LibEntry {
  name: string;
  language: string;
  author: string;
  url: string;
  stars: number;
  install: string;
  signing: string[];
  verifying: string[];
}

const LANG_TAGS: Record<string, string> = {
  JavaScript: 'JS',
  Python: 'PY',
  Java: 'JV',
  Go: 'GO',
  Rust: 'RS',
  Ruby: 'RB',
  PHP: 'PHP',
  '.NET': 'NET',
  Swift: 'SW',
  Kotlin: 'KT',
  Dart: 'DT',
  Erlang: 'ER',
};

const LIBRARIES: LibEntry[] = [
  {
    name: 'jose',
    language: 'JavaScript',
    author: 'panva',
    url: 'https://github.com/panva/jose',
    stars: 6200,
    install: 'npm install jose',
    signing: ['HS256', 'RS256', 'ES256', 'EdDSA'],
    verifying: ['HS256', 'RS256', 'ES256', 'EdDSA'],
  },
  {
    name: 'jsonwebtoken',
    language: 'JavaScript',
    author: 'auth0',
    url: 'https://github.com/auth0/node-jsonwebtoken',
    stars: 17500,
    install: 'npm install jsonwebtoken',
    signing: ['HS256', 'RS256', 'ES256'],
    verifying: ['HS256', 'RS256', 'ES256'],
  },
  {
    name: 'PyJWT',
    language: 'Python',
    author: 'jpadilla',
    url: 'https://github.com/jpadilla/pyjwt',
    stars: 5100,
    install: 'pip install PyJWT',
    signing: ['HS256', 'RS256', 'ES256', 'EdDSA'],
    verifying: ['HS256', 'RS256', 'ES256', 'EdDSA'],
  },
  {
    name: 'java-jwt',
    language: 'Java',
    author: 'auth0',
    url: 'https://github.com/auth0/java-jwt',
    stars: 5800,
    install: "implementation 'com.auth0:java-jwt:4.4.0'",
    signing: ['HS256', 'RS256', 'ES256'],
    verifying: ['HS256', 'RS256', 'ES256'],
  },
  {
    name: 'jjwt',
    language: 'Java',
    author: 'jwtk',
    url: 'https://github.com/jwtk/jjwt',
    stars: 10300,
    install: "implementation 'io.jsonwebtoken:jjwt-api:0.12.6'",
    signing: ['HS256', 'RS256', 'ES256', 'EdDSA'],
    verifying: ['HS256', 'RS256', 'ES256', 'EdDSA'],
  },
  {
    name: 'golang-jwt',
    language: 'Go',
    author: 'golang-jwt',
    url: 'https://github.com/golang-jwt/jwt',
    stars: 7200,
    install: 'go get github.com/golang-jwt/jwt/v5',
    signing: ['HS256', 'RS256', 'ES256', 'EdDSA'],
    verifying: ['HS256', 'RS256', 'ES256', 'EdDSA'],
  },
  {
    name: 'jsonwebtoken',
    language: 'Rust',
    author: 'Keats',
    url: 'https://github.com/Keats/jsonwebtoken',
    stars: 1700,
    install: 'cargo add jsonwebtoken',
    signing: ['HS256', 'RS256', 'ES256', 'EdDSA'],
    verifying: ['HS256', 'RS256', 'ES256', 'EdDSA'],
  },
  {
    name: 'ruby-jwt',
    language: 'Ruby',
    author: 'jwt',
    url: 'https://github.com/jwt/ruby-jwt',
    stars: 3600,
    install: 'gem install jwt',
    signing: ['HS256', 'RS256', 'ES256', 'EdDSA'],
    verifying: ['HS256', 'RS256', 'ES256', 'EdDSA'],
  },
  {
    name: 'php-jwt',
    language: 'PHP',
    author: 'firebase',
    url: 'https://github.com/firebase/php-jwt',
    stars: 9400,
    install: 'composer require firebase/php-jwt',
    signing: ['HS256', 'RS256', 'ES256'],
    verifying: ['HS256', 'RS256', 'ES256'],
  },
  {
    name: 'System.IdentityModel.Tokens.Jwt',
    language: '.NET',
    author: 'AzureAD',
    url: 'https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet',
    stars: 1100,
    install: 'dotnet add package System.IdentityModel.Tokens.Jwt',
    signing: ['HS256', 'RS256', 'ES256'],
    verifying: ['HS256', 'RS256', 'ES256'],
  },
];

function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function libsCommand(options: LibsOptions): void {
  try {
    let results = LIBRARIES;

    if (options.language) {
      const lang = options.language.toLowerCase();
      results = results.filter((l) => l.language.toLowerCase() === lang);
    }

    if (options.algorithm) {
      const alg = options.algorithm.toUpperCase();
      results = results.filter((l) => l.signing.includes(alg) || l.verifying.includes(alg));
    }

    results.sort((a, b) => b.stars - a.stars);

    if (options.json) {
      process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
      return;
    }

    if (results.length === 0) {
      process.stderr.write(`  ${c.dim('No libraries match your filters.')}\n`);
      return;
    }

    const table = new Table({
      head: [c.bold('Library'), c.bold('Lang'), c.bold('★'), c.bold('Install')],
      style: { head: [], border: [] },
      colWidths: [28, 7, 8, 48],
      wordWrap: true,
    });

    for (const lib of results) {
      const tag = LANG_TAGS[lib.language] || lib.language.slice(0, 3).toUpperCase();
      const langTag = c.blue(`[${tag}]`);
      table.push([
        c.cyan(lib.name),
        langTag,
        c.yellow(`★ ${formatStars(lib.stars)}`),
        c.dim(lib.install),
      ]);
    }

    process.stdout.write(`\n${table.toString()}\n\n`);
    process.stderr.write(`  ${c.dim(`${results.length} libraries found`)}\n\n`);
  } catch (err) {
    process.stderr.write(
      `${c.red('error')}: ${err instanceof Error ? err.message : 'Failed to list libraries'}\n`,
    );
    process.exit(3);
  }
}
