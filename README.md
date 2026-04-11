# tokx

> Decode, verify, and generate JSON Web Tokens. Entirely in your browser.

A full clone of [jwt.io](https://jwt.io) — JWT debugger, introduction page, and libraries catalogue — plus a CLI tool.

## Packages

| Package | Description |
|---------|-------------|
| `@tokx/core` | Shared JWT decode/encode/verify utilities wrapping `jose` |
| `@tokx/web` | Astro site with React islands — deployed to GitHub Pages |
| `tokx-cli` | CLI for JWT operations from your terminal |

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Frontend**: Astro + React islands
- **JWT crypto**: `jose` by panva (browser + Node.js)
- **Linting**: Biome
- **Testing**: Vitest
- **Versioning**: Changesets
- **Commits**: commitlint + conventional commits

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start web dev server
pnpm dev:web

# Run tests
pnpm test

# Lint
pnpm lint
```

## License

MIT
