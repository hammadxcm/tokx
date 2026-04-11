# Contributing to tokx

Thanks for your interest in contributing!

## Development Setup

1. Fork and clone the repo
2. Install dependencies: `pnpm install`
3. Build core: `pnpm build:core`
4. Start dev server: `pnpm dev:web`

## Commit Convention

We use [conventional commits](https://www.conventionalcommits.org/):

```
feat(web): add dark mode toggle
fix(core): handle empty JWT payload
docs: update README
```

Scopes: `core`, `cli`, `web`, `tooling`, `ci`, `docs`, `deps`

## Code Quality

- Run `pnpm lint` before committing
- Run `pnpm test` to verify changes
- Biome handles formatting and linting — no ESLint/Prettier

## Pull Requests

1. Create a branch from `main`
2. Make your changes
3. Add a changeset: `pnpm changeset`
4. Open a PR against `main`
