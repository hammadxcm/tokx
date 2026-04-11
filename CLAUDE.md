# CLAUDE.md

## Project
tokx — a full clone of jwt.io (debugger + intro + libraries) with a CLI.
Architecture mirrors https://github.com/hammadxcm/clipr

## Stack
- Monorepo: pnpm workspaces
- Frontend: Astro + React islands (interactive parts only)
- JWT crypto: `jose` (panva) — shared via @tokx/core
- CLI: commander + picocolors + cli-table3
- Linting: Biome (not ESLint/Prettier)
- Testing: Vitest (workspace mode)
- Versioning: Changesets
- Commits: commitlint + conventional commits

## Commands
- `pnpm install` — install all deps
- `pnpm build` — build all packages
- `pnpm build:core` — build core
- `pnpm --filter @tokx/web dev` — start Astro dev server
- `pnpm --filter @tokx/web build` — production build
- `pnpm --filter tokx-cli build` — build CLI
- `pnpm test` — run all tests
- `pnpm lint` — run Biome lint + format check

## Rules
- ALL JWT encode/decode/verify happens CLIENT-SIDE. No backend.
- JWT color scheme: header=#fb015b, payload=#d63aff, signature=#00b9f1.
- Astro islands: JwtDebugger and LibraryFilter are the ONLY React islands. Everything else is static Astro components.
- Keep JwtDebugger as ONE React island — do NOT split decoder/encoder into separate islands (they share state).
- No CSS frameworks. Vanilla CSS + custom properties only.
- Biome for ALL formatting/linting. Never use ESLint or Prettier.
- pnpm only. Never use npm or yarn commands.
- After any file change, verify with `pnpm lint` and `pnpm build`.
- Commit after each completed phase using conventional commit format.

## Design rules
- Dark mode is the DEFAULT. All colors use CSS custom properties — never hardcode hex in components.
- ALL user-facing strings come from i18n locale files (src/i18n/translations/en.ts). NEVER hardcode text in .astro or .tsx files.
- Canvas hero animation MUST pause when tab is hidden. No heavy animation libraries.
- Respect `prefers-reduced-motion` — disable all animations.
- Use Astro View Transitions for page navigation.
- Self-host Inter + JetBrains Mono fonts in public/fonts/. No Google Fonts CDN.
- Every interactive element needs keyboard accessibility + ARIA labels.
- Navbar uses `backdrop-filter: blur(12px)` with scroll-triggered border.

## clipr Reference
- All themes, animations, canvas effects, and i18n patterns are adapted from https://github.com/hammadxcm/clipr
- When implementing frontend features, fetch the corresponding clipr file first and adapt it
- See docs/PLAN.md for the full reference URL table
