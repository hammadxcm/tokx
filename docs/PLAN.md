# tokx — Full Implementation Plan

> JWT debugger + introduction + libraries pages + CLI tool
> Monorepo modeled after clipr (github.com/hammadxcm/clipr)
> Target: /Users/hammadkhan/tokx

## Reference Project: clipr

- **Repository**: https://github.com/hammadxcm/clipr
- **Branch**: `main`
- **Raw file base**: `https://raw.githubusercontent.com/hammadxcm/clipr/main/`
- **What to copy**: Monorepo structure, all themes, all animations, all canvas effects, all visual effects, i18n system, component patterns, tooling config
- **Adaptation**: Replace clipr branding/content with tokx/JWT content, map JWT colors (header=#fb015b, payload=#d63aff, signature=#00b9f1) into each theme

---

## Context

**Why**: Build "tokx" — a polished jwt.io clone with 3 pages (JWT Debugger, Introduction, Libraries) plus a CLI tool. The project must look and feel like a premium developer tool (Vercel/Linear-quality), not a generic template.

**Architecture reference**: The clipr project (github.com/hammadxcm/clipr) serves as the architectural blueprint. tokx adopts clipr's:
- pnpm monorepo structure with `packages/*` and `tooling/*`
- 10 multi-theme system (adapted from clipr's 15 themes) with CSS custom properties + `data-theme`
- 28+ CSS keyframe animations (directly ported from clipr's animations.css)
- 12 theme-reactive canvas effects (particles, snowfall, matrix rain, etc. from clipr's canvas.ts)
- i18n system with 12 locales + lazy loading (from clipr's i18n/index.ts)
- Glass morphism, glow system, gradient text, noise texture visual effects
- Scroll reveal with IntersectionObserver + stagger timing
- Glassmorphism navbar with scroll-triggered border

**Key constraints**: No CSS frameworks (vanilla CSS + custom properties only), all JWT operations client-side via `jose`, dark mode default, Astro + React islands, deploy to GitHub Pages.

---

## Design Principles & Code Standards

### Core Principles (enforced across ALL packages)

| Principle | What It Means for tokx | Violation Example |
|-----------|----------------------|-------------------|
| **DRY** (Don't Repeat Yourself) | JWT logic lives ONLY in `@tokx/core`. Web + CLI import from core. CSS tokens defined once in `global.css`, consumed everywhere via `var()`. i18n strings in one locale file per language. | Duplicating decode logic in both web and CLI. Hardcoding colors in components instead of using CSS variables. |
| **SOLID - Single Responsibility** | Each module does one thing. `decode.ts` only decodes. `verify.ts` only verifies. `ThemeSwitcher.astro` only handles theme switching. CSS files split by concern (global/themes/animations/debugger). | A "utils.ts" file that does decoding, encoding, AND formatting. |
| **SOLID - Open/Closed** | `ALGORITHMS` array is extensible — add new algorithms without modifying existing code. Theme system: add new themes by adding a `[data-theme]` block, no existing code changes. Canvas effects: add new effects to the registry without touching existing effects. | Hard-coding algorithm checks with if/else chains. |
| **SOLID - Liskov Substitution** | All `encode()`/`decode()`/`verify()` functions work identically whether called from web or CLI. Same types, same behavior, same error contracts. | Web-specific error handling in `@tokx/core`. |
| **SOLID - Interface Segregation** | Types are granular: `EncodeOptions`, `VerifyOptions`, `DecodedJwt` — not one mega-interface. CLI commands import only what they need from core. | A single `JwtOptions` interface used for everything. |
| **SOLID - Dependency Inversion** | Core depends on abstractions (jose's interface), not concretions. Web imports from `@tokx/core` (the package interface), not from internal files. | `import { decode } from '../../core/src/decode.ts'` — bypassing the package boundary. |
| **KISS** (Keep It Simple) | Vanilla CSS over frameworks. `<select>` for algorithm picker (native, accessible) over custom dropdowns. IntersectionObserver over scroll libraries. One React island (JwtDebugger) instead of many. | Adding React Context/Redux for debugger state that a single `useState` handles. |
| **YAGNI** (You Aren't Gonna Need It) | No server, no database, no auth, no analytics. No "plugin system" for algorithms. No abstraction layers for "future extensibility" that has no concrete use case. Build what's needed now. | Creating an "AlgorithmPlugin" system when the fixed list of 16 algorithms is sufficient. |

### Code Quality Standards

**TypeScript:**
- Strict mode enabled (`strict: true`, `noUncheckedIndexedAccess: true`)
- `verbatimModuleSyntax: true` — explicit `import type` for type-only imports
- No `any` (enforced by Biome as warning, aim for zero)
- No non-null assertions `!` (Biome warning)
- Named exports only, no default exports (except where framework requires)

**Error Handling:**
- Core functions throw typed errors with descriptive messages
- CLI catches errors and formats them for terminal (colored, with exit codes)
- Web catches errors and displays them in UI (inline, with i18n keys)
- Never swallow errors silently

**Naming Conventions:**
- Files: `kebab-case.ts` (matches clipr)
- Types/Interfaces: `PascalCase` (`DecodedJwt`, `VerifyResult`)
- Functions: `camelCase` (`decodeJwt`, `getAlgorithmInfo`)
- Constants: `SCREAMING_SNAKE_CASE` (`ALGORITHMS`, `ALGORITHM_FAMILIES`)
- CSS: `kebab-case` classes (`.jwt-header`, `.debugger-container`)
- CSS variables: `--color-*`, `--font-*`, `--radius-*`, `--ease-*`
- i18n keys: dot-notation (`nav.debugger`, `hero.title`)

**Module Boundaries:**
```
@tokx/core  → exports types + functions. No browser/node-specific code.
@tokx/web   → imports from @tokx/core via package name. Never reaches into core/src/.
tokx-cli    → imports from @tokx/core via package name. Never reaches into core/src/.
```

**Testing Standards:**
- Every public function in `@tokx/core` has unit tests
- Tests are co-located: `decode.ts` → `decode.test.ts` (same directory)
- Test names describe behavior: `'returns valid: false when token is expired'`
- No mocks of `jose` — test against real JWT operations
- Coverage thresholds enforced: 90% lines/functions/statements, 85% branches

**CSS Standards:**
- All colors via CSS custom properties — never hardcoded hex in components
- All user-facing text from i18n — never hardcoded strings in .astro/.tsx
- Mobile-first responsive design (`min-width` queries)
- `prefers-reduced-motion` respected everywhere
- `:focus-visible` instead of `:focus` for keyboard-only focus rings
- No `!important` — fix specificity properly

**Security Standards:**
- No `eval()`, `new Function()`, or `innerHTML` with user input
- JWT token display sanitized (textContent, not innerHTML)
- All external links: `rel="noopener noreferrer" target="_blank"`
- No third-party scripts or CDN dependencies (self-hosted fonts, zero analytics)
- CLI: secrets never logged, support stdin/file input
- CSP meta tag in HTML head

---

## Clipr Code References (MUST FETCH BEFORE IMPLEMENTING)

All designs, animations, effects, themes, canvas effects, and i18n patterns must be copied/adapted from the clipr repository. Fetch these raw files during implementation to ensure exact replication.

**Base URL**: `https://raw.githubusercontent.com/hammadxcm/clipr/main`

### Styles — Themes, Animations, Effects
| What | Clipr File | Fetch URL | tokx Target |
|------|-----------|-----------|-------------|
| **15 Theme Definitions** | `packages/web/src/styles/themes.css` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/styles/themes.css` | `packages/web/src/styles/themes.css` (adapt 10 themes with JWT colors) |
| **28+ Keyframe Animations** | `packages/web/src/styles/animations.css` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/styles/animations.css` | `packages/web/src/styles/animations.css` (port all keyframes) |
| **Global Design System** | `packages/web/src/styles/global.css` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/styles/global.css` | `packages/web/src/styles/global.css` (adapt tokens, utilities, effects) |
| **Terminal Chrome** | `packages/web/src/styles/terminal.css` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/styles/terminal.css` | `packages/web/src/styles/terminal.css` (port macOS chrome styling) |

### Scripts — Canvas, Theme Switching, Scroll Reveal
| What | Clipr File | Fetch URL | tokx Target |
|------|-----------|-----------|-------------|
| **12 Canvas Effects** | `packages/web/src/scripts/canvas.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/scripts/canvas.ts` | `packages/web/src/scripts/canvas.ts` (port all 12 effects) |
| **Theme-to-Effect Mapping** | `packages/web/src/scripts/theme-effects.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/scripts/theme-effects.ts` | `packages/web/src/scripts/theme-effects.ts` (adapt mappings) |
| **Theme Switcher Logic** | `packages/web/src/scripts/theme-switcher.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/scripts/theme-switcher.ts` | `packages/web/src/scripts/theme-switcher.ts` (change key to tokx-theme) |
| **Scroll Reveal Observer** | `packages/web/src/scripts/observer.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/scripts/observer.ts` | `packages/web/src/scripts/observer.ts` (port exactly) |
| **Nav Scroll Detection** | `packages/web/src/scripts/nav.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/scripts/nav.ts` | `packages/web/src/scripts/nav.ts` (port scroll + mobile menu) |
| **Smooth Scroll** | `packages/web/src/scripts/smooth-scroll.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/scripts/smooth-scroll.ts` | `packages/web/src/scripts/smooth-scroll.ts` (port exactly) |
| **Terminal Demo Animation** | `packages/web/src/scripts/terminal-demo.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/scripts/terminal-demo.ts` | Adapt for JWT decode demo |

### i18n — Translations, Lazy Loading, RTL
| What | Clipr File | Fetch URL | tokx Target |
|------|-----------|-----------|-------------|
| **i18n Core (lazy loading)** | `packages/web/src/i18n/index.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/i18n/index.ts` | `packages/web/src/i18n/index.ts` (adapt locale list + keys) |
| **English Translations** | `packages/web/src/i18n/translations/en.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/i18n/translations/en.ts` | Reference for key structure pattern |
| **Urdu (RTL) Translations** | `packages/web/src/i18n/translations/ur.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/i18n/translations/ur.ts` | Reference for RTL locale pattern |
| **Arabic (RTL) Translations** | `packages/web/src/i18n/translations/ar.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/i18n/translations/ar.ts` | Reference for RTL locale pattern |
| **i18n Init Script** | `packages/web/src/scripts/i18n.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/scripts/i18n.ts` | `packages/web/src/scripts/i18n.ts` (port RTL detection) |

### Components — Layout, Nav, Theme/Lang Switchers, Hero
| What | Clipr File | Fetch URL | tokx Target |
|------|-----------|-----------|-------------|
| **Layout (main wrapper)** | `packages/web/src/layouts/Layout.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/layouts/Layout.astro` | `packages/web/src/layouts/Layout.astro` (adapt structure) |
| **Navigation** | `packages/web/src/components/common/Nav.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/common/Nav.astro` | `packages/web/src/components/common/Nav.astro` (adapt links) |
| **Footer** | `packages/web/src/components/common/Footer.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/common/Footer.astro` | `packages/web/src/components/common/Footer.astro` (adapt content) |
| **Theme Switcher UI** | `packages/web/src/components/ui/ThemeSwitcher.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/ui/ThemeSwitcher.astro` | `packages/web/src/components/ui/ThemeSwitcher.astro` (adapt themes) |
| **Language Switcher UI** | `packages/web/src/components/ui/LangSwitcher.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/ui/LangSwitcher.astro` | `packages/web/src/components/ui/LangSwitcher.astro` (port exactly) |
| **Copy Button** | `packages/web/src/components/ui/CopyButton.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/ui/CopyButton.astro` | `packages/web/src/components/ui/CopyButton.astro` (port exactly) |
| **Toast Notifications** | `packages/web/src/components/ui/Toast.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/ui/Toast.astro` | `packages/web/src/components/ui/Toast.astro` (port exactly) |
| **Logo** | `packages/web/src/components/ui/Logo.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/ui/Logo.astro` | Reference for logo pattern |
| **Hero Section** | `packages/web/src/components/hero/Hero.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/hero/Hero.astro` | `packages/web/src/components/hero/Hero.astro` (adapt for JWT) |
| **Features Grid** | `packages/web/src/components/hero/Features.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/hero/Features.astro` | Reference for card grid pattern |
| **Terminal Component** | `packages/web/src/components/showcase/Terminal.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/showcase/Terminal.astro` | Reference for terminal chrome |
| **Marquee** | `packages/web/src/components/showcase/Marquee.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/showcase/Marquee.astro` | Reference for scrolling tech stack |
| **Section Header** | `packages/web/src/components/common/SectionHeader.astro` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/components/common/SectionHeader.astro` | Port for reusable section titles |

### Tooling & Config
| What | Clipr File | Fetch URL | tokx Target |
|------|-----------|-----------|-------------|
| **Base tsconfig** | `tooling/typescript/tsconfig.base.json` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/tooling/typescript/tsconfig.base.json` | `tooling/typescript/tsconfig.base.json` (port exactly) |
| **Biome Config** | `biome.json` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/biome.json` | `biome.json` (adapt for tokx) |
| **Commitlint Config** | `commitlint.config.js` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/commitlint.config.js` | `commitlint.config.js` (adapt scopes) |
| **Astro Config** | `packages/web/astro.config.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/astro.config.ts` | `packages/web/astro.config.ts` (adapt for GH Pages) |
| **Root package.json** | `package.json` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/package.json` | Reference for scripts pattern |
| **pnpm-workspace.yaml** | `pnpm-workspace.yaml` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/pnpm-workspace.yaml` | `pnpm-workspace.yaml` (port exactly) |
| **Changeset Config** | `.changeset/config.json` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/.changeset/config.json` | `.changeset/config.json` (adapt packages) |
| **Site Config Data** | `packages/web/src/data/site.ts` | `https://raw.githubusercontent.com/hammadxcm/clipr/main/packages/web/src/data/site.ts` | Reference for site data pattern |

### Implementation Instructions

When implementing each phase, **ALWAYS**:
1. Fetch the corresponding clipr file(s) from the URLs above using WebFetch
2. Read the actual clipr source code
3. Adapt it for tokx (change names, JWT colors, content) while preserving the exact patterns, structure, and design quality
4. Do NOT guess or recreate from memory — always fetch first

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Phase 1 — Monorepo Scaffold](#2-phase-1--monorepo-scaffold)
3. [Phase 2 — @tokx/core](#3-phase-2--tokxcore)
4. [Phase 3 — JWT Debugger Page](#4-phase-3--jwt-debugger-page)
5. [Phase 4 — Introduction Page](#5-phase-4--introduction-page)
6. [Phase 5 — Libraries Page + Scraper](#6-phase-5--libraries-page--scraper)
7. [Phase 6 — CLI](#7-phase-6--cli)
8. [Phase 7 — CI/CD + Polish](#8-phase-7--cicd--polish)
9. [CSS Architecture](#9-css-architecture)
10. [Animation Inventory](#10-animation-inventory)
11. [Canvas Hero Architecture](#11-canvas-hero-architecture)
12. [i18n Architecture](#12-i18n-architecture)
13. [Theme System Architecture](#13-theme-system-architecture)
14. [Testing Strategy](#14-testing-strategy)
15. [Accessibility Checklist](#15-accessibility-checklist)
16. [pnpm Scripts](#16-pnpm-scripts)
17. [Verification](#17-verification)

---

## 1. Architecture Overview

### Monorepo Structure

```
tokx/
├── .changeset/
│   └── config.json
├── .editorconfig
├── .gitattributes
├── .github/
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   ├── FUNDING.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   └── feature_request.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-pages.yml
│       └── release.yml
├── .gitignore
├── .husky/
│   └── _/
│       ├── commit-msg
│       ├── h
│       ├── husky.sh
│       └── pre-commit
├── .npmrc
├── .nvmrc
├── biome.json
├── CHANGELOG.md
├── CLAUDE.md
├── CODE_OF_CONDUCT.md
├── commitlint.config.js
├── CONTRIBUTING.md
├── LICENSE
├── package.json
├── packages/
│   ├── cli/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── decode.ts
│   │   │   │   ├── encode.ts
│   │   │   │   ├── libs.ts
│   │   │   │   └── verify.ts
│   │   │   ├── index.ts
│   │   │   ├── api.ts
│   │   │   └── utils/
│   │   │       └── output.ts
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── vitest.config.ts
│   ├── core/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── algorithms.ts
│   │   │   ├── base64url.ts
│   │   │   ├── decode.ts
│   │   │   ├── encode.ts
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── verify.ts
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── vitest.config.ts
│   └── web/
│       ├── .gitignore
│       ├── astro.config.ts
│       ├── package.json
│       ├── public/
│       │   ├── .nojekyll
│       │   ├── favicon.svg
│       │   ├── fonts/
│       │   │   ├── inter-latin.woff2
│       │   │   └── jetbrainsmono-latin.woff2
│       │   └── robots.txt
│       ├── src/
│       │   ├── components/
│       │   │   ├── common/
│       │   │   │   ├── Footer.astro
│       │   │   │   ├── Nav.astro
│       │   │   │   └── SectionHeader.astro
│       │   │   ├── debugger/
│       │   │   │   └── JwtDebugger.tsx   ← React island (client:only="react")
│       │   │   ├── hero/
│       │   │   │   └── Hero.astro
│       │   │   ├── intro/
│       │   │   │   └── IntroContent.astro
│       │   │   ├── libraries/
│       │   │   │   ├── LibraryCard.astro
│       │   │   │   └── LibraryGrid.astro
│       │   │   └── ui/
│       │   │       ├── CopyButton.astro
│       │   │       ├── LangSwitcher.astro
│       │   │       ├── Logo.astro
│       │   │       ├── ThemeSwitcher.astro
│       │   │       └── Toast.astro
│       │   ├── content/
│       │   │   └── introduction.mdx
│       │   ├── data/
│       │   │   ├── libraries.json
│       │   │   └── site.ts
│       │   ├── i18n/
│       │   │   ├── index.ts
│       │   │   └── translations/
│       │   │       ├── ar.ts
│       │   │       ├── bn.ts
│       │   │       ├── de.ts
│       │   │       ├── en.ts
│       │   │       ├── es.ts
│       │   │       ├── fr.ts
│       │   │       ├── hi.ts
│       │   │       ├── ja.ts
│       │   │       ├── pt.ts
│       │   │       ├── ru.ts
│       │   │       ├── ur.ts
│       │   │       └── zh.ts
│       │   ├── layouts/
│       │   │   └── Layout.astro
│       │   ├── pages/
│       │   │   ├── [locale]/
│       │   │   │   ├── index.astro
│       │   │   │   ├── introduction.astro
│       │   │   │   └── libraries.astro
│       │   │   ├── 404.astro
│       │   │   ├── index.astro
│       │   │   ├── introduction.astro
│       │   │   └── libraries.astro
│       │   ├── scripts/
│       │   │   ├── canvas.ts              ← 12 theme-reactive canvas effects (from clipr)
│       │   │   ├── i18n.ts                ← RTL + language persistence
│       │   │   ├── magnetic-hover.ts      ← Subtle magnetic cursor effect
│       │   │   ├── nav.ts                 ← Scroll detection + mobile menu (from clipr)
│       │   │   ├── observer.ts            ← Scroll reveal IntersectionObserver (from clipr)
│       │   │   ├── smooth-scroll.ts       ← Anchor smooth scrolling
│       │   │   ├── theme-effects.ts       ← Theme-to-canvas-effect mapping (from clipr)
│       │   │   └── theme-switcher.ts      ← Theme persistence + switching (from clipr)
│       │   └── styles/
│       │       ├── animations.css         ← 28+ keyframes (ported from clipr)
│       │       ├── debugger.css           ← JWT debugger layout + JWT color coding
│       │       ├── global.css             ← Reset, tokens, utilities, glass, glow, noise
│       │       ├── terminal.css           ← macOS terminal chrome (from clipr)
│       │       └── themes.css             ← 10 theme definitions (adapted from clipr)
│       └── tsconfig.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── SECURITY.md
├── tooling/
│   └── typescript/
│       └── tsconfig.base.json
└── vitest.workspace.ts
```

### Package Dependencies

```
@tokx/core  ← jose (JWT operations)
tokx-cli    ← @tokx/core + commander + picocolors + cli-table3
@tokx/web   ← @tokx/core + astro + @astrojs/react + @astrojs/mdx + @astrojs/sitemap
```

### Design Tokens — JWT Color Palette

The JWT brand uses three signature colors for token parts:
- **Header**: `#fb015b` (red/pink)
- **Payload**: `#d63aff` (purple)
- **Signature**: `#00b9f1` (blue)

These colors are central to the entire design system and are reflected in every theme variant.

---

## 2. Phase 1 — Monorepo Scaffold

### File Creation Order

#### Step 1: Root config files

**`/tokx/.nvmrc`**
```
22
```

**`/tokx/.npmrc`**
```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

**`/tokx/.editorconfig`**
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

**`/tokx/.gitattributes`**
```
* text=auto eol=lf
*.png binary
*.ico binary
*.woff2 binary
```

**`/tokx/.gitignore`**
```
# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
.astro/

# Environment
.env
.env.*
!.env.example

# IDE
.vscode/
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test
coverage/

# Changeset
.changeset/*.md
!.changeset/config.json

# Claude Code
.claude/
```

**`/tokx/pnpm-workspace.yaml`**
```yaml
packages:
  - 'packages/*'
  - 'tooling/*'
```

**`/tokx/package.json`**
```json
{
  "name": "tokx-monorepo",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "packageManager": "pnpm@10.8.0",
  "scripts": {
    "build": "pnpm --filter './packages/*' run build",
    "build:core": "pnpm --filter @tokx/core run build",
    "build:cli": "pnpm --filter tokx-cli run build",
    "build:web": "pnpm --filter @tokx/web run build",
    "dev:web": "pnpm --filter @tokx/web run dev",
    "test": "pnpm --filter './packages/*' run test",
    "test:coverage": "pnpm --filter './packages/*' run test:coverage",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "typecheck": "pnpm --filter './packages/*' run typecheck",
    "clean": "pnpm --filter './packages/*' run clean",
    "changeset": "changeset",
    "release": "changeset publish",
    "prepare": "husky"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.0.0",
    "@changesets/cli": "^2.27.0",
    "@commitlint/cli": "^19.6.0",
    "@commitlint/config-conventional": "^19.6.0",
    "@vitest/coverage-v8": "^3.1.1",
    "husky": "^9.1.7",
    "lint-staged": "^16.0.0",
    "typescript": "^5.8.3"
  },
  "lint-staged": {
    "*": ["biome check --write --no-errors-on-unmatched"]
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/hammadxcm/tokx.git"
  },
  "homepage": "https://github.com/hammadxcm/tokx#readme",
  "author": "Hammad Khan",
  "license": "MIT",
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild"]
  }
}
```

**`/tokx/biome.json`**
```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.10/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "noNonNullAssertion": "warn",
        "useConst": "error",
        "useExportType": "error",
        "useImportType": "error"
      },
      "suspicious": { "noExplicitAny": "warn" },
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "error"
      }
    }
  },
  "css": {
    "parser": { "cssModules": true },
    "formatter": { "enabled": true },
    "linter": { "enabled": true }
  },
  "files": {
    "includes": [
      "**",
      "!**/dist",
      "!**/node_modules",
      "!**/coverage",
      "!**/.astro",
      "!**/*.d.ts"
    ]
  },
  "overrides": [
    {
      "includes": ["**/*.astro"],
      "linter": {
        "rules": {
          "correctness": {
            "noUnusedVariables": "off",
            "noUnusedImports": "off"
          }
        }
      }
    }
  ]
}
```

**`/tokx/commitlint.config.js`**
```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['core', 'cli', 'web', 'tooling', 'ci', 'docs', 'deps']],
  },
};
```

**`/tokx/vitest.workspace.ts`**
```ts
export default ['packages/*/vitest.config.ts'];
```

**`/tokx/.changeset/config.json`**
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": true,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@tokx/web"]
}
```

**`/tokx/tooling/typescript/tsconfig.base.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "types": ["node"],
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": false
  }
}
```

#### Step 2: Documentation files

- `/tokx/LICENSE` — MIT license
- `/tokx/README.md` — Project overview with badges
- `/tokx/CONTRIBUTING.md` — Contribution guide
- `/tokx/CODE_OF_CONDUCT.md` — Contributor Covenant
- `/tokx/SECURITY.md` — Security policy
- `/tokx/CHANGELOG.md` — Empty initial changelog
- `/tokx/CLAUDE.md` — AI assistant context file

---

## 3. Phase 2 — @tokx/core

### Dependencies

```json
{
  "dependencies": {
    "jose": "^6.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.13.0",
    "tsup": "^8.4.0",
    "vitest": "^3.1.1"
  }
}
```

### File: `packages/core/src/types.ts`

```ts
/** Supported JWT signing algorithms */
export type JwtAlgorithm =
  | 'HS256' | 'HS384' | 'HS512'
  | 'RS256' | 'RS384' | 'RS512'
  | 'ES256' | 'ES384' | 'ES512'
  | 'PS256' | 'PS384' | 'PS512'
  | 'EdDSA';

/** Algorithm category for UI grouping */
export type AlgorithmFamily = 'HMAC' | 'RSA' | 'ECDSA' | 'RSA-PSS' | 'EdDSA';

/** Algorithm metadata for UI display */
export interface AlgorithmInfo {
  id: JwtAlgorithm;
  family: AlgorithmFamily;
  description: string;
  keyType: 'symmetric' | 'asymmetric';
  hashBits: number;
}

/** Decoded JWT parts */
export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  /** Raw parts before decoding */
  raw: { header: string; payload: string; signature: string };
}

/** Standard JWT header */
export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

/** Standard JWT payload with registered claims */
export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

/** Result of JWT verification */
export interface VerifyResult {
  valid: boolean;
  error?: string;
  expired?: boolean;
  notBefore?: boolean;
}

/** Encode options */
export interface EncodeOptions {
  algorithm: JwtAlgorithm;
  header?: Partial<JwtHeader>;
  payload: JwtPayload;
  secret: string;
  privateKey?: string;
  expiresIn?: number;
}

/** Verify options */
export interface VerifyOptions {
  algorithm: JwtAlgorithm;
  secret: string;
  publicKey?: string;
  ignoreExpiration?: boolean;
}
```

### File: `packages/core/src/algorithms.ts`

```ts
import type { AlgorithmFamily, AlgorithmInfo, JwtAlgorithm } from './types.js';

export const ALGORITHM_FAMILIES: Record<AlgorithmFamily, JwtAlgorithm[]> = {
  HMAC: ['HS256', 'HS384', 'HS512'],
  RSA: ['RS256', 'RS384', 'RS512'],
  ECDSA: ['ES256', 'ES384', 'ES512'],
  'RSA-PSS': ['PS256', 'PS384', 'PS512'],
  EdDSA: ['EdDSA'],
};

export const ALGORITHMS: AlgorithmInfo[] = [
  { id: 'HS256', family: 'HMAC', description: 'HMAC using SHA-256', keyType: 'symmetric', hashBits: 256 },
  { id: 'HS384', family: 'HMAC', description: 'HMAC using SHA-384', keyType: 'symmetric', hashBits: 384 },
  { id: 'HS512', family: 'HMAC', description: 'HMAC using SHA-512', keyType: 'symmetric', hashBits: 512 },
  { id: 'RS256', family: 'RSA', description: 'RSASSA-PKCS1-v1_5 using SHA-256', keyType: 'asymmetric', hashBits: 256 },
  // ... remaining algorithms
  { id: 'EdDSA', family: 'EdDSA', description: 'EdDSA using Ed25519', keyType: 'asymmetric', hashBits: 256 },
];

export function getAlgorithmInfo(alg: JwtAlgorithm): AlgorithmInfo | undefined;
export function getAlgorithmFamily(alg: JwtAlgorithm): AlgorithmFamily;
export function isSymmetric(alg: JwtAlgorithm): boolean;
export function isAsymmetric(alg: JwtAlgorithm): boolean;
```

### File: `packages/core/src/base64url.ts`

```ts
export function encode(input: string): string;
export function decode(input: string): string;
export function isValid(input: string): boolean;
```

### File: `packages/core/src/decode.ts`

```ts
import type { DecodedJwt } from './types.js';

/**
 * Decode a JWT without verification.
 * Splits on '.', base64url-decodes header and payload.
 * Throws if format is invalid.
 */
export function decode(token: string): DecodedJwt;
```

### File: `packages/core/src/encode.ts`

```ts
import type { EncodeOptions } from './types.js';

/**
 * Sign a JWT using jose.
 * HMAC: uses secret. RSA/ECDSA/EdDSA: uses privateKey PEM.
 */
export async function encode(options: EncodeOptions): Promise<string>;
```

### File: `packages/core/src/verify.ts`

```ts
import type { VerifyOptions, VerifyResult } from './types.js';

/**
 * Verify JWT signature and validate claims.
 * Returns { valid: true } or { valid: false, error: '...' }.
 */
export async function verify(token: string, options: VerifyOptions): Promise<VerifyResult>;
```

### File: `packages/core/src/index.ts`

```ts
export type { AlgorithmFamily, AlgorithmInfo, DecodedJwt, EncodeOptions, JwtAlgorithm, JwtHeader, JwtPayload, VerifyOptions, VerifyResult } from './types.js';
export { ALGORITHM_FAMILIES, ALGORITHMS, getAlgorithmFamily, getAlgorithmInfo, isAsymmetric, isSymmetric } from './algorithms.js';
export * as base64url from './base64url.js';
export { decode } from './decode.js';
export { encode } from './encode.js';
export { verify } from './verify.js';
```

### Build Configuration

**`packages/core/tsup.config.ts`**
```ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

**`packages/core/package.json`**
```json
{
  "name": "@tokx/core",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": { "import": "./dist/index.js", "require": "./dist/index.cjs", "types": "./dist/index.d.ts" }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist",
    "prepublishOnly": "pnpm build"
  },
  "dependencies": { "jose": "^6.0.0" },
  "devDependencies": { "@types/node": "^22.13.0", "tsup": "^8.4.0", "vitest": "^3.1.1" },
  "engines": { "node": ">=22" },
  "license": "MIT",
  "author": "Hammad Khan",
  "publishConfig": { "access": "public" }
}
```

### Test Files

**`packages/core/src/decode.test.ts`** — Valid HS256 decode, correct header/claims, throws on invalid format/base64url/JSON, handles extra dots
**`packages/core/src/encode.test.ts`** — Creates valid HS256, roundtrip encode→decode, exp from expiresIn, custom headers, throws on missing secret
**`packages/core/src/verify.test.ts`** — Valid sig → true, invalid sig → false, expired → false+expired, ignoreExpiration, wrong algorithm error
**`packages/core/src/base64url.test.ts`** — Roundtrip encode/decode, special chars, isValid true/false

---

## 4. Phase 3 — JWT Debugger Page (Homepage)

### Dependencies

**`packages/web/package.json`**
```json
{
  "name": "@tokx/web",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "typecheck": "astro check",
    "clean": "rm -rf dist .astro"
  },
  "dependencies": {
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/react": "^4.2.0",
    "@astrojs/sitemap": "^3.3.0",
    "@tokx/core": "workspace:*",
    "astro": "^5.7.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "typescript": "^5.8.3"
  }
}
```

> No CSS frameworks. No Tailwind. Vanilla CSS + custom properties only.

### Astro Config

```ts
// packages/web/astro.config.ts
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://hammadxcm.github.io',
  base: '/tokx',
  output: 'static',
  compressHTML: true,
  integrations: [react(), mdx(), sitemap()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'hi', 'ar', 'ur', 'bn', 'ja'],
    routing: { prefixDefaultLocale: false },
  },
});
```

### Component Hierarchy

```
Layout.astro
├── <html lang={locale} dir={dir}>
├── Theme flash prevention script (inline)
├── Skip to content link
├── Scroll progress bar
├── Canvas layers (hero-canvas + theme-canvas)
├── <slot /> (page content)
└── Init scripts (canvas, theme-effects, nav, observer, etc.)

index.astro (JWT Debugger - Homepage)
├── Nav.astro
│   ├── Logo.astro
│   ├── Desktop nav links (Debugger, Introduction, Libraries)
│   ├── ThemeSwitcher.astro (dropdown with 10 themes, color dots, random)
│   ├── LangSwitcher.astro (globe icon, 12 languages, RTL badges)
│   ├── GitHub link
│   └── Mobile hamburger + menu
├── Hero.astro
│   ├── Background glow orbs (ambient-orb elements)
│   ├── Floating JWT token labels (decorative, staggered float animation)
│   ├── Hero title + rotating words (gradient text, 3D flip)
│   ├── Description + CTA buttons
│   └── Terminal demo (JWT decode preview, macOS chrome)
├── JwtDebugger.tsx (React island — client:only="react")
│   ├── EncodedPanel (left)
│   │   ├── Token textarea (color-coded: header.payload.signature)
│   │   └── Paste/clear buttons
│   ├── DecodedPanel (right)
│   │   ├── Algorithm selector
│   │   ├── Header JSON editor
│   │   ├── Payload JSON editor
│   │   ├── Verification status badge (animated scale+fade)
│   │   └── Secret/key input
│   └── SignatureVerified indicator (bottom)
└── Footer.astro (4-column grid, responsive collapse)
```

### React Island: JwtDebugger.tsx

**State Architecture:**
```ts
interface DebuggerState {
  token: string;
  header: string;
  payload: string;
  algorithm: JwtAlgorithm;
  secret: string;
  publicKey: string;
  privateKey: string;
  verifyResult: VerifyResult | null;
  editMode: 'encoded' | 'decoded';
}
```

**Behavior:**
1. Paste token → `decode()` → populate header/payload/algorithm
2. Edit header/payload/secret → `encode()` → update token
3. Secret changes → `verify()` → update verification badge
4. Color coding: split on `.`, wrap in `<span>` with `jwt-header`/`jwt-payload`/`jwt-signature`
5. Default sample HS256 JWT on load

### Debugger CSS (`styles/debugger.css`)

```css
.debugger-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  max-width: 1200px;
  margin: 2rem auto;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  min-height: 500px;
}

.debugger-encoded {
  background: var(--color-bg-surface);
  padding: 1.5rem;
  border-right: 1px solid var(--color-border-default);
}

.debugger-decoded {
  background: var(--color-bg-base);
  padding: 1.5rem;
}

.jwt-header { color: #fb015b; }
.jwt-payload { color: #d63aff; }
.jwt-signature { color: #00b9f1; }

.verify-valid {
  background: rgba(40, 200, 64, 0.1);
  color: #28c840;
  border: 1px solid rgba(40, 200, 64, 0.3);
}

.verify-invalid {
  background: rgba(255, 95, 87, 0.1);
  color: #ff5f57;
  border: 1px solid rgba(255, 95, 87, 0.3);
}

@media (max-width: 768px) {
  .debugger-container { grid-template-columns: 1fr; }
  .debugger-encoded { border-right: none; border-bottom: 1px solid var(--color-border-default); }
}
```

---

## 5. Phase 4 — Introduction Page

Static MDX page, zero interactive JS.

**`packages/web/src/content/introduction.mdx`** — Content:
1. What is JSON Web Token?
2. When should you use JWTs?
3. JWT Structure (Header, Payload with registered claims, Signature)
4. How JWTs Work (flow diagram via CSS/SVG)
5. Token-Based Authentication
6. JWT vs. Session Cookies
7. Security Considerations

Uses `.section`, `.glass`, `.terminal` CSS classes for code blocks. Pure static HTML output.

---

## 6. Phase 5 — Libraries Page + Scraper

### Libraries Scope (matching jwt.io)

jwt.io tracks **120+ libraries across 38 languages**. tokx must replicate this fully.

**38 Languages**: .NET, 1C, Ada, Bun, C, C++, CFML, Clojure, Crystal, D, Dart, Delphi, Deno, Elixir, Erlang, Go, Groovy, Harbour, Haskell, Haxe, Java, JavaScript, kdb+/Q, Kotlin, Lua, Node.js, Objective-C, OCaml, Perl, PHP, PostgreSQL, PowerShell, Python, Ruby, Rust, Scala, Swift

**16 Algorithms tracked**: HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES256K, ES384, ES512, PS256, PS384, PS512, EdDSA

**9 Capability checks**: Sign, Verify, iss, sub, aud, exp, nbf, iat, jti

### Libraries Data Schema

```json
[
  {
    "name": "jsonwebtoken",
    "language": "JavaScript",
    "platform": "Node.js",
    "author": "auth0",
    "url": "https://github.com/auth0/node-jsonwebtoken",
    "stars": 17500,
    "install": "npm install jsonwebtoken",
    "signing": ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "PS256", "PS384", "PS512"],
    "verifying": ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "PS256", "PS384", "PS512"],
    "claims": { "iss": true, "sub": true, "aud": true, "exp": true, "nbf": true, "iat": true, "jti": true },
    "minVersion": null,
    "securityNote": null
  }
]
```

### Data Source: `data/libraries.yaml`

The YAML file is the human-editable source of truth. The scraper reads it, fetches live GitHub stars, and writes `libraries.json`. All 120+ entries must be curated from jwt.io.

### Libraries Page Features

- **Language filter**: Dropdown with all 38 languages + "All" option
- **Algorithm filter**: Filter by specific algorithm support
- **Search**: Fuzzy search by library name, author, language
- **Sort**: By stars (default), name, language
- **Client-side filtering**: Astro `<script>` with progressive enhancement (no React island needed)
- **Security badges**: Highlight libraries with minimum version requirements or known vulnerabilities

### Components

- **LibraryCard.astro**: Author + name + GitHub link, language badge (colored per language), star count with icon, install command with CopyButton, algorithm support matrix (green checkmarks), claim check matrix, security note (if any)
- **LibraryGrid.astro**: CSS Grid layout (auto-fit, min 320px), filter controls bar, empty state message, result count
- **LanguageIcon.astro**: SVG icons for each of the 38 languages (stored in `public/icons/`)

### Star Scraper

**`packages/web/scripts/update-stars.ts`** — Reads libraries.yaml, fetches GitHub stars via Octokit API, writes libraries.json. Run manually or via nightly cron (`update-stars.yml` workflow).

---

## 7. Phase 6 — CLI

### CLI UI/UX Enhancement (modeled after slay project at /Users/hammadkhan/slay)

The tokx CLI must match the slay project's polished UI/UX patterns. Reference files:
- `/Users/hammadkhan/slay/src/ui/colors.ts` — TTY-aware color system
- `/Users/hammadkhan/slay/src/ui/format.ts` — Pretty + JSON output formatting
- `/Users/hammadkhan/slay/src/ui/animation.ts` — ASCII text animations
- `/Users/hammadkhan/slay/src/ui/prompt.ts` — Confirmation prompts with raw mode
- `/Users/hammadkhan/slay/src/ui/interactive.ts` — Interactive TUI with vim keybinds
- `/Users/hammadkhan/slay/src/ui/raw-mode.ts` — Terminal raw mode wrapper

#### New UI files to create in `packages/cli/src/ui/`:

```
packages/cli/src/ui/
├── colors.ts        — TTY-aware picocolors wrapper (port from slay)
├── banner.ts        — tokx branded banner with JWT-colored ASCII art
├── box.ts           — Box drawing for framed output (header/payload/signature sections)
├── animation.ts     — JWT decode animation (token flying apart into 3 colored parts)
├── prompt.ts        — Y/N confirmation prompts with raw mode (port from slay)
├── raw-mode.ts      — Terminal raw mode wrapper (port from slay exactly)
├── spinner.ts       — Simple spinner for async operations (encode/verify)
└── interactive.ts   — Interactive algorithm selector with arrow keys (for encode)
```

#### Enhancement details:

**1. TTY-aware color system** (`ui/colors.ts`)
- Port slay's pattern: wrap picocolors, export `c` object + `isTTY()` function
- Respect `NO_COLOR` env var: `process.env.NO_COLOR !== undefined`
- All commands use `c.*` instead of direct `pc.*` calls
- Non-TTY: strip all colors, skip animations, output plain text

**2. Branded banner** (`ui/banner.ts`)
- Show on `tokx --help` and `tokx` (no args):
```
  ┌─────────────────────────────┐
  │  t o k x                    │
  │  JWT decode · encode · verify│
  └─────────────────────────────┘
```
- JWT-colored: `t` in red (#fb015b), `o` in magenta, `k` in cyan, `x` in cyan
- Only shown in TTY mode

**3. Box-framed output** (`ui/box.ts`)
- Decode output wrapped in box-drawing characters:
```
  ┌─ HEADER (HS256) ──────────────┐
  │ {                              │
  │   "alg": "HS256",             │
  │   "typ": "JWT"                │
  │ }                              │
  └────────────────────────────────┘
```
- Header box in JWT red, payload box in JWT purple, signature section in JWT blue
- `drawBox(title: string, content: string, color: ColorFn): string`

**4. JWT decode animation** (`ui/animation.ts`)
- On decode, animate the token splitting into 3 parts:
```
  Frame 1: eyJhbGci...SflKxwRJ
  Frame 2: eyJhbGci... . eyJzdWIi... . SflKxwRJ...
  Frame 3: [header colored red].[payload colored purple].[signature colored cyan]
```
- 3-4 frames, 80ms per frame
- Only in TTY mode, skip if `--json`
- Respect `prefers-reduced-motion` is N/A in CLI (use `--no-animation` flag)

**5. Spinner for async ops** (`ui/spinner.ts`)
- Simple braille spinner during encode/verify (which are async):
```
  ⠋ Signing token...
  ⠙ Signing token...
  ✓ Token signed successfully
```
- Frames: `['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏']`
- Auto-stops on completion, shows checkmark (green) or cross (red)
- `startSpinner(message: string): { stop(success: boolean, finalMsg: string): void }`

**6. Interactive algorithm selector** (`ui/interactive.ts`)
- When `tokx encode` is run without `--algorithm`, show interactive picker:
```
  Select algorithm:
  > HS256  HMAC using SHA-256 (symmetric)
    HS384  HMAC using SHA-384 (symmetric)
    HS512  HMAC using SHA-512 (symmetric)
    RS256  RSASSA-PKCS1-v1_5 using SHA-256 (asymmetric)
    ...
```
- Arrow keys or j/k to navigate, Enter to select
- Group by family (HMAC, RSA, ECDSA, RSA-PSS, EdDSA)
- Port from slay's interactive.ts pattern

**7. Confirmation prompts** (`ui/prompt.ts`)
- Port slay's confirm() and textInput() with raw mode
- Use for dangerous operations or missing required args

**8. Enhanced decode output**
- Show JWT parts in colored boxes (using box.ts)
- Show a visual token bar: `████████.████████████.████` with proportional widths per part
- Show claim status icons: `✓ exp` (green, valid) / `✗ exp` (red, expired) / `○ exp` (dim, not present)
- Show time-relative expiry: "expires in 2h 15m" or "expired 3d ago"

**9. Enhanced verify output**
- Large colored badge:
```
  ╔══════════════════════════╗
  ║  ✓ SIGNATURE VERIFIED    ║
  ╚══════════════════════════╝
```
- Or for failure:
```
  ╔══════════════════════════╗
  ║  ✗ INVALID SIGNATURE     ║
  ╚══════════════════════════╝
```

**10. Enhanced libs output**
- Colored table with language icons (text-based: `[JS]`, `[PY]`, `[GO]`, etc.)
- Star count with ★ character
- Algorithm support shown as colored dots: `●` (green=supported) `○` (dim=not)

#### Files to modify:
- `packages/cli/src/index.ts` — Add banner on `--help`, wire interactive algorithm selector
- `packages/cli/src/commands/decode.ts` — Use box output, animation, relative time, claim icons
- `packages/cli/src/commands/encode.ts` — Add spinner, interactive algo picker
- `packages/cli/src/commands/verify.ts` — Large verification badge
- `packages/cli/src/commands/libs.ts` — Colored table with language tags and algo dots
- `packages/cli/src/utils/output.ts` — Refactor to use new ui/ modules, add relative time util

#### Dependencies (keep minimal like slay — only picocolors):
- No new dependencies needed. `picocolors` + `cli-table3` + `commander` are sufficient
- Spinner, box drawing, animation, prompts, interactive all custom-built (matching slay's zero-dep UI philosophy)

### Package: `packages/cli/package.json`

```json
{
  "name": "tokx-cli",
  "version": "0.0.1",
  "type": "module",
  "bin": { "tokx": "./dist/index.js" },
  "dependencies": {
    "@tokx/core": "workspace:*",
    "commander": "^13.1.0",
    "picocolors": "^1.1.1",
    "cli-table3": "^0.6.5"
  },
  "devDependencies": {
    "@types/node": "^22.13.0",
    "tsup": "^8.4.0",
    "vitest": "^3.1.1"
  }
}
```

### CLI Commands

- **`tokx decode <token>`** — Pretty-print header + payload, colored JSON, dates humanized, `--json` flag
- **`tokx encode`** — `--algorithm HS256` `--secret <s>` `--payload '{}'` `--expires <sec>`
- **`tokx verify <token>`** — `--secret <s>` or `--public-key <path>`, colored valid/invalid
- **`tokx libs`** — Table output, `--language <lang>` `--algorithm <alg>` `--json`

### CLI Security Rules

- **Never log secrets**: `--secret` and `--private-key` values must never appear in stdout/stderr/logs
- **stdin support**: `--secret -` reads from stdin (avoids shell history exposure)
- **File support**: `--secret @path/to/file` reads from file
- **No telemetry**: Zero network calls. Fully offline tool.
- **Exit codes**: 0 = success, 1 = invalid input, 2 = verification failed, 3 = internal error
- **`--json` flag**: Machine-readable JSON output on all commands for piping

### CLI Design Patterns (12-Factor CLI)

- stdout for data output, stderr for human messages/errors
- Respect `NO_COLOR` env var and `--no-color` flag
- Support piping: `echo $TOKEN | tokx decode -` reads from stdin
- `--quiet` flag suppresses non-essential output
- `--version` and `--help` on all commands

### Multi-Platform Distribution Strategy

The CLI must be publishable to multiple package ecosystems. Architecture:

```
packages/cli/
├── src/                    # TypeScript source (Node.js CLI)
├── dist/                   # tsup output (ESM, runs with Node.js)
├── bin/                    # Compiled standalone binaries (Phase 7)
│   ├── tokx-linux-x64
│   ├── tokx-linux-arm64
│   ├── tokx-darwin-x64
│   ├── tokx-darwin-arm64
│   └── tokx-win-x64.exe
└── wrappers/               # Thin wrapper packages for other ecosystems
    ├── homebrew/
    │   └── tokx.rb         # Homebrew formula (downloads binary from GH Release)
    ├── python/
    │   ├── pyproject.toml  # PyPI package
    │   └── tokx/__init__.py # Thin wrapper: downloads + delegates to binary
    └── ruby/
        ├── tokx.gemspec    # RubyGems package
        └── lib/tokx.rb     # Thin wrapper: downloads + delegates to binary
```

**Distribution targets (tiered by priority):**

#### Tier 1 — Foundation (Phase 6-7, do first)

| Target | Package Name | Install Command | Strategy |
|--------|-------------|-----------------|----------|
| **npm** | `tokx-cli` | `npm i -g tokx-cli` | Direct Node.js package (esbuild optional-deps pattern) |
| **pnpm** | `tokx-cli` | `pnpm add -g tokx-cli` | Same npm package |
| **bun** | `tokx-cli` | `bun add -g tokx-cli` | Same npm package |
| **yarn** | `tokx-cli` | `yarn global add tokx-cli` | Same npm package |
| **npx** | `tokx-cli` | `npx tokx-cli decode <token>` | Same npm package, zero-install |
| **GitHub Releases** | — | Direct download | Standalone binaries + SHA256 checksums |
| **Homebrew** | `hammadxcm/tap/tokx` | `brew install hammadxcm/tap/tokx` | Formula in separate tap repo, downloads binary from GH Release |

#### Tier 2 — Platform Leaders (Phase 8, post-launch)

| Target | Package Name | Install Command | Strategy |
|--------|-------------|-----------------|----------|
| **Docker** | `ghcr.io/hammadxcm/tokx` | `docker run ghcr.io/hammadxcm/tokx decode <token>` | Multi-arch (amd64/arm64), scratch-based minimal image |
| **PyPI (pip)** | `tokx` | `pip install tokx` | Thin wrapper: postinstall downloads binary matching platform |
| **Scoop (Windows)** | `tokx` | `scoop install hammadxcm/tokx` | JSON manifest in separate bucket repo |
| **Winget (Windows)** | `hammadxcm.tokx` | `winget install hammadxcm.tokx` | Submit manifest to winget-pkgs repo |
| **Chocolatey** | `tokx` | `choco install tokx` | NuSpec package, downloads binary |

#### Tier 3 — Ecosystem Expansion (Phase 9+, community-driven)

| Target | Package Name | Install Command | Strategy |
|--------|-------------|-----------------|----------|
| **RubyGems** | `tokx` | `gem install tokx` | Thin wrapper: downloads binary on first run |
| **cargo-binstall** | `tokx-bin` | `cargo binstall tokx-bin` | Metadata in Cargo.toml points to GH Release binaries |
| **Deno** | `tokx` | `deno install -g npm:tokx-cli` | Deno reads npm packages natively |
| **AUR (Arch)** | `tokx-bin` | `yay -S tokx-bin` | PKGBUILD in AUR, downloads binary |
| **Nix** | `tokx` | `nix run github:hammadxcm/tokx` | Flake with binary derivation |
| **Snap** | `tokx` | `snap install tokx` | snapcraft.yaml, classic confinement |
| **pkgx** | `tokx` | `pkgx tokx decode <token>` | pantry entry |
| **Go wrapper** | `github.com/hammadxcm/tokx-go` | `go install github.com/hammadxcm/tokx-go@latest` | Go module wrapping binary download |
| **Homebrew core** | `tokx` | `brew install tokx` | Submit to homebrew-core once popular (requires 75+ stars) |

#### npm Distribution Architecture (esbuild pattern)

For zero-dependency installs without Node.js at runtime:

```
packages/cli/
├── tokx-cli (main package — lightweight wrapper)
│   ├── package.json (optionalDependencies for each platform)
│   ├── bin/tokx (entry script: finds + runs correct binary)
│   └── postinstall.js (validates binary works, fallback download)
├── @tokx/cli-linux-x64 (platform package)
├── @tokx/cli-linux-arm64
├── @tokx/cli-darwin-x64
├── @tokx/cli-darwin-arm64
├── @tokx/cli-win32-x64
└── @tokx/cli-win32-arm64
```

Each platform package:
- Contains only the compiled binary for that OS/arch
- Uses `os` and `cpu` fields in package.json for auto-detection
- npm/pnpm/bun automatically installs only the matching platform package
- Main package's postinstall validates or falls back to download

**Binary compilation** (Phase 7): Use `bun build --compile` to create standalone executables:
```bash
bun build ./dist/index.js --compile --target=bun-linux-x64 --outfile=bin/tokx-linux-x64
bun build ./dist/index.js --compile --target=bun-darwin-arm64 --outfile=bin/tokx-darwin-arm64
# ... etc for all platforms
```

**Homebrew formula** (`wrappers/homebrew/tokx.rb`):
```ruby
class Tokx < Formula
  desc "JWT decode, encode, verify from your terminal"
  homepage "https://github.com/hammadxcm/tokx"
  version "0.0.1"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/hammadxcm/tokx/releases/download/v#{version}/tokx-darwin-arm64.tar.gz"
      sha256 "PLACEHOLDER"
    else
      url "https://github.com/hammadxcm/tokx/releases/download/v#{version}/tokx-darwin-x64.tar.gz"
      sha256 "PLACEHOLDER"
    end
  end

  on_linux do
    url "https://github.com/hammadxcm/tokx/releases/download/v#{version}/tokx-linux-x64.tar.gz"
    sha256 "PLACEHOLDER"
  end

  def install
    bin.install "tokx"
  end

  test do
    system "#{bin}/tokx", "--version"
  end
end
```

**GitHub Actions workflow for binary releases** (`.github/workflows/release-binaries.yml`):
- Triggered on new GitHub Release tag
- Matrix build: linux-x64, linux-arm64, darwin-x64, darwin-arm64, win-x64
- Compiles standalone binaries via `bun build --compile`
- Generates SHA256 checksums
- Uploads binaries + checksums to the GitHub Release
- Updates Homebrew formula with new SHA256s

---

## 8. Phase 7 — CI/CD + Polish

### GitHub Actions Workflows

**`.github/workflows/ci.yml`** — Lint + Test + Build on push/PR to main, matrix: ubuntu/macos/windows + Node 22

**`.github/workflows/deploy-pages.yml`** — Triggered on push to main (packages/web/** or core/**), builds core then web, uploads to GitHub Pages via `actions/upload-pages-artifact` + `actions/deploy-pages`

**`.github/workflows/release.yml`** — Changeset-based version + publish to npm, creates GitHub Release tags

**`.github/workflows/release-binaries.yml`** — Triggered on new Release, compiles standalone binaries for all platforms, uploads to Release with SHA256 checksums

### Security Checklist

- [ ] No secrets in stdout/stderr (CLI `--secret` flag)
- [ ] All JWT operations client-side only (web)
- [ ] No telemetry, no analytics, no network calls (CLI)
- [ ] `lockfile-lint` or Dependabot for supply chain security
- [ ] No `postinstall` scripts in published packages
- [ ] SHA256 checksums for all binary releases
- [ ] CSP headers in Astro output (meta tag)
- [ ] No `eval()`, no `innerHTML` with user input
- [ ] Sanitize JWT display to prevent XSS (token textarea)
- [ ] `rel="noopener noreferrer"` on all external links

---

## 9. CSS Architecture

### Design Token System

All tokens in `global.css` using native CSS custom properties (NO Tailwind, NO CSS-in-JS).

```css
/* Fonts */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

/* JWT Brand Colors (always available, theme-independent) */
--jwt-header: #fb015b;
--jwt-payload: #d63aff;
--jwt-signature: #00b9f1;

/* Theme-reactive colors */
--color-brand: <varies>;
--color-brand-light: <varies>;
--color-brand-mint: <varies>;
--color-bg-base: <varies>;
--color-bg-surface: <varies>;
--color-bg-elevated: <varies>;
--color-text-primary: <varies>;
--color-text-secondary: <varies>;
--color-text-accent: <varies>;
--color-border-default: <varies>;
--color-border-hover: <varies>;
--glass-bg: <varies>;

/* Radii */
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 20px;

/* Easing */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
```

### Responsive Breakpoints

```css
/* Mobile-first. Breakpoints: */
/* sm: 640px, md: 768px, lg: 1024px, xl: 1200px, 2xl: 1440px */
```

### CSS File Organization

| File | Purpose |
|------|---------|
| `global.css` | Reset, font-face, base tokens, utility classes (.glass, .gradient-text, .glow-border, .btn-*, .card-hover, .reveal, etc.), noise texture, scroll progress, skip-link |
| `themes.css` | All 10 theme overrides via `[data-theme="..."]`, transition declarations, theme-specific effects |
| `animations.css` | All 28+ `@keyframes` + 5 animation utility classes |
| `terminal.css` | Terminal/code display chrome (macOS dots, scanline) |
| `debugger.css` | JWT debugger layout, color coding, panels, verification badge |

### Visual Effects Inventory (from clipr)

| Effect | Implementation | Trigger |
|--------|---------------|---------|
| Glass morphism | `.glass`: `backdrop-filter: blur(16px)`, semi-transparent bg | Nav, cards, badges |
| Gradient text | `.gradient-text`: `background-clip: text` with brand gradient | Headings, accents |
| Animated gradient text | `.gradient-text-animate`: `text-shine` keyframe, 4s infinite | Hero accent text |
| Glow system | `.shadow-glow`: box-shadow with `color-mix()` brand color | Buttons, feature cards |
| Glow border | `.glow-border`: subtle shadow + hover intensification | Cards, interactive elements |
| Noise texture | `body::before`: SVG feTurbulence, opacity 0.015, fixed | Always present |
| Ambient orbs | `.ambient-orb`: absolute, border-radius 50%, blur 80px | Hero background |
| Scroll progress | `#scroll-progress`: fixed top bar, `scaleX()` via JS | Scroll listener |
| Card lift | `.card-hover`: translateY(-6px) on hover | Library/feature cards |
| Shimmer | `.glass-shimmer::after`: gradient sweep on hover | Glass cards |
| Link underline | `.link-hover::after`: scaleX animation | Footer/nav links |
| Button shimmer | `.btn::after`: diagonal gradient sweep on hover | All buttons |

---

## 10. Animation Inventory

### Complete Keyframes List (28 animations, ported from clipr)

| # | Name | Duration | Easing | Usage |
|---|------|----------|--------|-------|
| 1 | `typing` | 3.5s | `steps(40, end)` | Terminal typing effect |
| 2 | `blink-caret` | 0.75s | step-end, infinite | Terminal cursor |
| 3 | `text-shine` | 4s | linear, infinite | `.gradient-text-animate` |
| 4 | `slide-up` | 0.6s | `--ease-out-expo` | Scroll reveal (default) |
| 5 | `slide-up-fade` | 0.5s | `--ease-out-expo` | `.animate-slide-up` utility |
| 6 | `slide-in-left` | 0.6s | `--ease-out-expo` | `.reveal-left` |
| 7 | `slide-in-right` | 0.6s | `--ease-out-expo` | `.reveal-right` |
| 8 | `float` | 8s | ease-in-out, infinite | Decorative floating elements |
| 9 | `blob-float` | 20s | ease-in-out, infinite | Hero background orbs |
| 10 | `scale-in` | 0.4s | `--ease-out-expo` | Element entrance with overshoot |
| 11 | `scale-in-center` | 0.4s | `--ease-out-expo` | `.animate-scale-in` utility |
| 12 | `explode-in` | 0.5s | ease | Entrance with scale overshoot (1.3x) |
| 13 | `explode-out` | 0.3s | ease | Exit shrink |
| 14 | `fade-in` | 0.3s | ease | Simple opacity entrance |
| 15 | `glow` | 3s | ease, infinite | Ambient glow pulse |
| 16 | `shimmer` | 2s | linear | Background position slide |
| 17 | `scanline` | 4s | linear, infinite | Terminal body overlay |
| 18 | `pulse` | 2s | ease, infinite | Box-shadow brand pulse |
| 19 | `pulse-glow` | 3s | ease-in-out, infinite | Stronger glow pulse variant |
| 20 | `border-glow-pulse` | 3s | ease-in-out, infinite | Border + shadow pulse |
| 21 | `shake` | 0.5s | ease-in-out | Attention/error emphasis |
| 22 | `shake-error` | 0.5s | ease-in-out | Rapid side-to-side shake |
| 23 | `ripple` | 0.6s | ease-out | Click/tap ripple effect |
| 24 | `subtle-pulse` | 3s | ease-in-out, infinite | Gentle opacity pulse |
| 25 | `underline-in` | 0.3s | `--ease-out-expo` | Link underline expansion |
| 26 | `marquee-scroll` | 30s | linear, infinite | Horizontal auto-scroll |
| 27 | `gradient-border-flow` | 3s | linear, infinite | Animated gradient border |
| 28 | `scroll-bounce` | 2s | ease-in-out, infinite | Scroll indicator dot |

### Animation Utility Classes

```css
.animate-shake        { animation: shake-error 0.5s ease-in-out; }
.animate-scale-in     { animation: scale-in-center 0.4s var(--ease-out-expo); }
.animate-slide-up     { animation: slide-up-fade 0.5s var(--ease-out-expo); }
.animate-pulse-subtle { animation: subtle-pulse 3s ease-in-out infinite; }
.animate-border-glow  { animation: border-glow-pulse 3s ease-in-out infinite; }
```

---

## 11. Canvas Hero Architecture

### Two Canvas Layers (from clipr)

1. **`#hero-canvas`** — Particle effects with mouse interaction + connection lines
2. **`#theme-canvas`** — Theme-specific ambient effects (blood rain, matrix rain, etc.)

Both: `position: fixed; inset: 0; pointer-events: none; z-index: 0;`

### Effect Registry (12 effects from clipr)

| # | Effect | Theme(s) | Algorithm | Particle Count | Color |
|---|--------|----------|-----------|---------------|-------|
| 1 | `particles` | Default Dark, Matrix | Mouse-interactive dots + spatial-grid connection lines | `min(80, floor(w*h/12000))` | `--color-brand` |
| 2 | `snowfall` | Nord | Gentle descending circles with sine-wave drift | `min(120, floor(w*h/8000))` | `--color-brand` |
| 3 | `bubbles` | Catppuccin | Upward-floating stroke circles | `min(50, floor(w*h/20000))` | `--color-brand` |
| 4 | `embers` | Monokai (unused in tokx, reserve) | Ascending with flicker | `min(80, floor(w*h/12000))` | `--color-brand` |
| 5 | `starfield` | Midnight | Static twinkling dots with sine opacity | `min(150, floor(w*h/6000))` | `--color-brand` |
| 6 | `lightDust` | Light, Solarized | Rightward drifting dots with sine vertical | `min(60, floor(w*h/15000))` | `--color-brand` |
| 7 | `fireflies` | (reserve) | Bouncing dots with pulsing glow halos | `min(40, floor(w*h/25000))` | `--color-brand` |
| 8 | `bloodRain` | (reserve) | Diagonal falling lines with gradient trails | `min(120, floor(w*h/8000))` | `rgba(255,0,64,` |
| 9 | `purpleParticles` | Dracula | Drifting/radiating with sine/cos movement | `min(60, floor(w*h/15000))` | `--color-brand` |
| 10 | `neonSparks` | Cyberpunk | Radiating projectiles with velocity trails | `min(70, floor(w*h/14000))` | `--color-brand` |
| 11 | `cosmicDust` | (reserve) | Drifting with pulsing glow halos | `min(60, floor(w*h/16000))` | `--color-brand` |
| 12 | `retroGrid` | Synthwave | Perspective grid with scrolling horizontal lines | N/A (procedural) | Theme-specific |

### Theme-to-Effect Mapping

```ts
const THEME_EFFECT: Record<string, string> = {
  '': 'particles',
  dark: 'particles',
  light: 'lightDust',
  dracula: 'purpleParticles',
  nord: 'snowfall',
  catppuccin: 'bubbles',
  synthwave: 'retroGrid',
  matrix: 'particles',
  midnight: 'starfield',
  cyberpunk: 'neonSparks',
  solarized: 'lightDust',
};
```

### Performance Budget

| Constraint | Value |
|-----------|-------|
| Touch device particle reduction | 60% (multiply by 0.4) |
| Connection line distance | 160px |
| Mouse interaction radius | 150px |
| Spatial grid cell size | 160px |
| Max particles (any effect) | 150 |
| Frame scheduling | `requestAnimationFrame` loop |
| Hidden tab | `cancelAnimationFrame` + resume on visibility |
| Reduced motion | Skip initialization entirely |
| Theme change detection | `MutationObserver` on `data-theme` |
| Color extraction | `getComputedStyle` → `--color-brand` → rgba prefix |

### Particle Interface

```ts
interface Mote {
  x: number; y: number;
  r: number;
  vx: number; vy: number;
  opacity: number;
  drift: number;
  flicker: number;
  twinkle: number;
  speed: number;
  baseOpacity: number;
  glow: number;
  glowSpeed: number;
}
```

### Connection Lines Algorithm (spatial grid partitioning)

1. Divide canvas into cells of size 160px
2. Assign each particle to a cell
3. For each particle, check 3x3 neighborhood (9 cells)
4. Draw line if distance < 160px, opacity = `0.15 * (1 - d/160)`
5. Track seen pairs with Set to avoid duplicates

---

## 12. i18n Architecture

### File Structure (from clipr)

```
packages/web/src/i18n/
├── index.ts              ← Locale list, sync/async getTranslation()
└── translations/
    ├── en.ts             ← Default (bundled)
    ├── es.ts             ← Lazy-loaded
    ├── fr.ts             ← Lazy-loaded
    ├── de.ts             ← Lazy-loaded
    ├── pt.ts             ← Lazy-loaded
    ├── ru.ts             ← Lazy-loaded
    ├── zh.ts             ← Lazy-loaded
    ├── hi.ts             ← Lazy-loaded
    ├── ar.ts             ← Lazy-loaded (RTL)
    ├── ur.ts             ← Lazy-loaded (RTL)
    ├── bn.ts             ← Lazy-loaded
    └── ja.ts             ← Lazy-loaded
```

### Translation Schema

Each locale exports `Record<string, string>` with dot-notation keys:

```ts
export const en: Record<string, string> = {
  'nav.debugger': 'Debugger',
  'nav.introduction': 'Introduction',
  'nav.libraries': 'Libraries',
  'nav.github': 'GitHub',
  'hero.badge': 'Open source · Client-side · Zero dependencies',
  'hero.title': 'JWT.io',
  'hero.titleAccent': 'reimagined.',
  'hero.description': 'Decode, verify, and generate JSON Web Tokens. Entirely in your browser.',
  'hero.cta': 'Start debugging',
  'hero.github': 'View on GitHub',
  'debugger.encoded': 'Encoded',
  'debugger.decoded': 'Decoded',
  'debugger.header': 'HEADER',
  'debugger.payload': 'PAYLOAD',
  'debugger.verify': 'VERIFY SIGNATURE',
  'debugger.secret': 'your-256-bit-secret',
  'debugger.valid': 'Signature Verified',
  'debugger.invalid': 'Invalid Signature',
  'debugger.paste': 'Paste a token',
  'intro.title': 'Introduction to JWT',
  'intro.whatIs': 'What is JSON Web Token?',
  'intro.whenUse': 'When should you use JWTs?',
  'intro.structure': 'JWT Structure',
  'libs.title': 'JWT Libraries',
  'libs.filter': 'Filter by language',
  'libs.search': 'Search libraries...',
  'libs.noResults': 'No libraries match your filters.',
  'footer.tagline': 'Decode, verify, and generate JWTs entirely in your browser.',
  'footer.quicklinks': 'Quick Links',
  'footer.resources': 'Resources',
  'footer.rights': 'MIT License. All rights reserved.',
};
```

### Lazy Loading (matches clipr's i18n/index.ts)

```ts
import { en } from './translations/en';

export const locales = ['en', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'hi', 'ar', 'ur', 'bn', 'ja'] as const;
export type Locale = (typeof locales)[number];

const translations: Record<string, Record<string, string>> = { en };

async function loadTranslation(locale: Locale): Promise<Record<string, string>> {
  if (locale === 'en') return en;
  if (translations[locale]) return translations[locale];
  try {
    const mod = await import(`./translations/${locale}.ts`);
    translations[locale] = mod[locale] || mod.default || {};
    return translations[locale];
  } catch { return en; }
}

export function getTranslation(locale?: string): (key: string) => string {
  const lang = (locale || 'en') as Locale;
  const dict = translations[lang] || en;
  return (key: string) => dict[key] || en[key] || key;
}

export async function getTranslationAsync(locale: Locale): Promise<(key: string) => string> {
  const dict = await loadTranslation(locale);
  return (key: string) => dict[key] || en[key] || key;
}
```

### RTL Support

```ts
// packages/web/src/scripts/i18n.ts
const RTL_LANGS = ['ar', 'ur'];
const STORAGE_KEY = 'tokx-lang';

export function applyLanguage(lang: string): void {
  document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
}
```

### Routing

- `/` — English (default, no prefix)
- `/es/`, `/fr/`, `/de/`, etc. — Localized versions
- Each locale gets all 3 pages: `/[locale]/`, `/[locale]/introduction`, `/[locale]/libraries`
- `getStaticPaths()` generates all variants at build time
- Hreflang tags in `<head>` for SEO

---

## 13. Theme System Architecture

### 10 Themes (adapted from clipr, with JWT colors mapped)

Each theme maps `--color-brand` (red/header), `--color-brand-light` (purple/payload), `--color-brand-mint` (blue/signature) to that theme's palette.

#### Default Dark (JWT Dark) — in `global.css`
```css
:root {
  --color-brand: #fb015b;
  --color-brand-light: #d63aff;
  --color-brand-mint: #00b9f1;
  --color-bg-base: #0b0f14;
  --color-bg-surface: #131920;
  --color-bg-elevated: #1a2230;
  --color-text-primary: #e6edf3;
  --color-text-secondary: #8b949e;
  --color-text-accent: #00b9f1;
  --color-border-default: rgba(251, 1, 91, 0.12);
  --color-border-hover: rgba(251, 1, 91, 0.3);
  --glass-bg: rgba(22, 27, 34, 0.6);
}
```

#### Light
```css
[data-theme="light"] {
  --color-brand: #d4004a;
  --color-brand-light: #b030d0;
  --color-brand-mint: #0090c0;
  --color-bg-base: #f8f9fa;
  --color-bg-surface: #eef0f2;
  --color-bg-elevated: #e1e5e9;
  --color-text-primary: #1a1a2e;
  --color-text-secondary: #5a6270;
  --color-text-accent: #d4004a;
  --color-border-default: rgba(212, 0, 74, 0.15);
  --color-border-hover: rgba(212, 0, 74, 0.3);
  --glass-bg: rgba(238, 240, 242, 0.75);
}
```

#### Dracula
```css
[data-theme="dracula"] {
  --color-brand: #ff79c6;
  --color-brand-light: #bd93f9;
  --color-brand-mint: #8be9fd;
  --color-bg-base: #282a36;
  --color-bg-surface: #343746;
  --color-bg-elevated: #44475a;
  --color-text-primary: #f8f8f2;
  --color-text-secondary: #6272a4;
  --color-text-accent: #50fa7b;
  --color-border-default: rgba(255, 121, 198, 0.15);
  --color-border-hover: rgba(255, 121, 198, 0.3);
  --glass-bg: rgba(40, 42, 54, 0.6);
}
```

#### Nord
```css
[data-theme="nord"] {
  --color-brand: #bf616a;
  --color-brand-light: #b48ead;
  --color-brand-mint: #88c0d0;
  --color-bg-base: #2e3440;
  --color-bg-surface: #3b4252;
  --color-bg-elevated: #434c5e;
  --color-text-primary: #eceff4;
  --color-text-secondary: #7b88a1;
  --color-text-accent: #88c0d0;
  --color-border-default: rgba(191, 97, 106, 0.15);
  --color-border-hover: rgba(191, 97, 106, 0.3);
  --glass-bg: rgba(46, 52, 64, 0.6);
}
```

#### Catppuccin
```css
[data-theme="catppuccin"] {
  --color-brand: #f38ba8;
  --color-brand-light: #cba6f7;
  --color-brand-mint: #89b4fa;
  --color-bg-base: #1e1e2e;
  --color-bg-surface: #2a2a3c;
  --color-bg-elevated: #313244;
  --color-text-primary: #cdd6f4;
  --color-text-secondary: #888da5;
  --color-text-accent: #89b4fa;
  --color-border-default: rgba(243, 139, 168, 0.15);
  --color-border-hover: rgba(243, 139, 168, 0.3);
  --glass-bg: rgba(30, 30, 46, 0.6);
}
```

#### Synthwave
```css
[data-theme="synthwave"] {
  --color-brand: #ff2e97;
  --color-brand-light: #d63aff;
  --color-brand-mint: #00f0ff;
  --color-bg-base: #1a1028;
  --color-bg-surface: #231538;
  --color-bg-elevated: #2a1a40;
  --color-text-primary: #f0e6ff;
  --color-text-secondary: #9b7ec8;
  --color-text-accent: #00f0ff;
  --color-border-default: rgba(255, 46, 151, 0.15);
  --color-border-hover: rgba(255, 46, 151, 0.3);
  --glass-bg: rgba(26, 16, 40, 0.6);
}
```

#### Matrix
```css
[data-theme="matrix"] {
  --color-brand: #00ff41;
  --color-brand-light: #39ff14;
  --color-brand-mint: #7cfc00;
  --color-bg-base: #0a0a0a;
  --color-bg-surface: #0d140d;
  --color-bg-elevated: #0a140a;
  --color-text-primary: #00ff41;
  --color-text-secondary: #00c818;
  --color-text-accent: #7cfc00;
  --color-border-default: rgba(0, 255, 65, 0.15);
  --color-border-hover: rgba(0, 255, 65, 0.3);
  --glass-bg: rgba(10, 10, 10, 0.6);
}
```

#### Midnight
```css
[data-theme="midnight"] {
  --color-brand: #e8457c;
  --color-brand-light: #a78bfa;
  --color-brand-mint: #7dd3fc;
  --color-bg-base: #0f0f1a;
  --color-bg-surface: #161624;
  --color-bg-elevated: #18182a;
  --color-text-primary: #e8e6f0;
  --color-text-secondary: #9290a8;
  --color-text-accent: #c4b5fd;
  --color-border-default: rgba(232, 69, 124, 0.15);
  --color-border-hover: rgba(232, 69, 124, 0.3);
  --glass-bg: rgba(15, 15, 26, 0.6);
}
```

#### Cyberpunk
```css
[data-theme="cyberpunk"] {
  --color-brand: #ff2e97;
  --color-brand-light: #d63aff;
  --color-brand-mint: #00ffff;
  --color-bg-base: #0a0a12;
  --color-bg-surface: #101018;
  --color-bg-elevated: #12121e;
  --color-text-primary: #e8e6f0;
  --color-text-secondary: #8888aa;
  --color-text-accent: #ffd700;
  --color-border-default: rgba(255, 46, 151, 0.15);
  --color-border-hover: rgba(255, 46, 151, 0.3);
  --glass-bg: rgba(10, 10, 18, 0.6);
}
```

#### Solarized
```css
[data-theme="solarized"] {
  --color-brand: #dc322f;
  --color-brand-light: #6c71c4;
  --color-brand-mint: #268bd2;
  --color-bg-base: #002b36;
  --color-bg-surface: #04323e;
  --color-bg-elevated: #073642;
  --color-text-primary: #fdf6e3;
  --color-text-secondary: #839496;
  --color-text-accent: #268bd2;
  --color-border-default: rgba(220, 50, 47, 0.15);
  --color-border-hover: rgba(220, 50, 47, 0.3);
  --glass-bg: rgba(0, 43, 54, 0.6);
}
```

### Theme Switching Mechanism (from clipr)

1. `STORAGE_KEY = 'tokx-theme'`
2. `THEMES` array of all theme IDs
3. `getStoredTheme()` — reads localStorage, validates, defaults to `'dark'`
4. `applyTheme(theme)` — sets `data-theme` on `<html>`, saves to localStorage, dispatches `CustomEvent('themechange')`
5. `initThemeSwitcher()` — dropdown, random button, outside-click close, Escape close

**Flash prevention** — Inline `<head>` script:
```html
<script is:inline>
  (function(){var t=localStorage.getItem('tokx-theme');if(t&&t!=='dark')document.documentElement.setAttribute('data-theme',t);})();
</script>
```

### Theme Transitions

```css
body, nav, .glass, .glow-border, .section-surface {
  transition: background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}
```

---

## 14. Testing Strategy

### Unit Tests (Vitest)

**@tokx/core** — >90% coverage:
- `decode.test.ts` — Valid/invalid tokens, edge cases, all standard claims
- `encode.test.ts` — HS256/RS256/ES256, custom headers, exp calculation
- `verify.test.ts` — Valid/invalid signatures, expired tokens, clock tolerance
- `base64url.test.ts` — Encode/decode roundtrip, special characters
- `algorithms.test.ts` — Metadata lookup, family classification

**tokx-cli** — Command output tests:
- `decode.test.ts` — Output format, JSON mode, error handling
- `encode.test.ts` — Token generation
- `verify.test.ts` — Colored output, claim display
- `libs.test.ts` — Table rendering, filtering

### Config

```ts
// packages/core/vitest.config.ts
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
```

---

## 15. Accessibility Checklist

### Global
- Skip-to-content link in Layout.astro
- `lang` + `dir` attributes on `<html>`
- `:focus-visible` outline (2px solid brand) on all interactive elements
- `prefers-reduced-motion: reduce` disables all animations
- Color contrast: WCAG AA (4.5:1 body, 3:1 large text)
- No color-only information (verification badge has text + icon + color)

### Navigation
- `<nav>` landmark with `aria-label="Main navigation"`
- Hamburger: `aria-expanded`, `aria-label="Toggle menu"`
- Active link: `aria-current="page"`

### Theme Switcher
- `aria-expanded`, `aria-haspopup="true"` on toggle
- `role="listbox"` on dropdown, `role="option"` + `aria-selected` on items
- Escape/outside-click close

### Language Switcher
- Same ARIA pattern as theme switcher
- RTL badge for Arabic/Urdu

### JWT Debugger
- Textareas: `aria-label`
- Algorithm: native `<select>`
- Verification: text + icon + color (not color-only)
- Tab order: token → algorithm → header → payload → secret → verify
- Error states: `aria-live="polite"`
- Min touch target: 44x44px

### Canvas
- `aria-hidden="true"` on canvas elements
- Purely decorative, no interactive content
- Disabled when `prefers-reduced-motion: reduce`

---

## 16. pnpm Scripts

### Root

| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `pnpm --filter './packages/*' run build` | Build all |
| `build:core` | `pnpm --filter @tokx/core run build` | Build core |
| `build:cli` | `pnpm --filter tokx-cli run build` | Build CLI |
| `build:web` | `pnpm --filter @tokx/web run build` | Build web |
| `dev:web` | `pnpm --filter @tokx/web run dev` | Dev server |
| `test` | `pnpm --filter './packages/*' run test` | All tests |
| `lint` | `biome check .` | Lint all |
| `lint:fix` | `biome check --write .` | Fix lint |
| `format` | `biome format --write .` | Format all |
| `typecheck` | `pnpm --filter './packages/*' run typecheck` | TS check |
| `clean` | `pnpm --filter './packages/*' run clean` | Remove dist/ |

### Per-Package

**@tokx/core**: build (tsup), dev (tsup --watch), test, test:coverage, typecheck, clean
**tokx-cli**: build (tsup + shebang), dev, test, typecheck, clean
**@tokx/web**: dev (astro dev), build (astro build), preview, typecheck, clean

---

## 17. Verification

### After Each Phase

1. **Phase 1** — `pnpm install` succeeds, `pnpm lint` passes with no errors, all package.json files resolve correctly
2. **Phase 2** — `pnpm build:core` produces dist/, `pnpm test` passes with >90% coverage
3. **Phase 3** — `pnpm dev:web` starts Astro dev server, homepage loads with:
   - Canvas animation visible and responsive to theme changes
   - JWT debugger decodes/encodes tokens correctly
   - Theme switcher cycles through all 10 themes
   - Language switcher shows all 12 locales
   - Nav glassmorphism + scroll border works
   - All animations play (check with DevTools)
   - Mobile responsive (check at 375px, 768px, 1024px)
4. **Phase 4** — `/introduction` page loads as pure static HTML, zero JS shipped
5. **Phase 5** — `/libraries` page renders library cards, filters work, search works
6. **Phase 6** — `pnpm build:cli && node packages/cli/dist/index.js decode <token>` works
7. **Phase 7** — CI workflow passes on push, deploy workflow builds and uploads artifact

### End-to-End Verification

- `pnpm install && pnpm build` — entire monorepo builds cleanly
- `pnpm test` — all tests pass
- `pnpm lint` — zero errors
- `pnpm dev:web` — open browser, verify all 3 pages
- Test all 10 themes — each shows correct canvas effect
- Test RTL — switch to Arabic/Urdu, verify layout flips
- Test `prefers-reduced-motion` — verify all animations disabled
- Test keyboard navigation — tab through debugger, theme switcher, nav
- Lighthouse audit — score >90 on Performance, Accessibility, Best Practices, SEO

### Critical Files to Get Right

1. `packages/core/src/decode.ts` — Used by debugger, CLI, all verification
2. `packages/web/src/components/debugger/JwtDebugger.tsx` — Product centerpiece
3. `packages/web/src/styles/global.css` — Design tokens, everything visual depends on this
4. `packages/web/src/styles/themes.css` — 10 theme definitions maintaining JWT brand
5. `packages/web/src/scripts/canvas.ts` — 12 effects with performance optimizations

---

## Phase 8 — Web UI/UX Polish (from clipr)

### Context
The web UI needs polishing to match clipr's production-quality feel. The current components are functional but lack the micro-interactions, hover effects, animated logo, marquee, and language switcher that make clipr feel premium.

### Reference files (read from clipr before implementing):
- `/Users/hammadkhan/clipr/packages/web/src/components/ui/Logo.astro` — Slash animation + split effect
- `/Users/hammadkhan/clipr/packages/web/src/components/ui/LangSwitcher.astro` — Dropdown with easing
- `/Users/hammadkhan/clipr/packages/web/src/components/showcase/Marquee.astro` — Dual-direction infinite scroll
- `/Users/hammadkhan/clipr/packages/web/src/components/hero/Hero.astro` — Floating labels, rotating words
- `/Users/hammadkhan/clipr/packages/web/src/components/common/Nav.astro` — Link underline animations
- `/Users/hammadkhan/clipr/packages/web/src/components/common/Footer.astro` — Auto-slash logo, social icons

### 1. Logo Enhancement (`packages/web/src/components/ui/Logo.astro`)
Port clipr's animated logo with:
- **Slash animation**: Diagonal gradient line sweeps across on hover
- **Split effect**: Top half shifts up-left, bottom half shifts down-right on hover
- **Dual-layer clipping**: `clip-path: inset(0 0 50% 0)` top, `inset(50% 0 0 0)` bottom
- **Glow on hover**: `filter: drop-shadow` increases
- JWT-colored letters: `t`=red, `o`=magenta, `k`=cyan, `x`=cyan
- Keyframe: `tokx-slash` — clip-path from 100% to 0% with opacity fade

### 2. Language Switcher (`packages/web/src/components/ui/LangSwitcher.astro`)
Port clipr's LangSwitcher:
- **Globe icon button** (SVG) with hover glow
- **Dropdown menu** with smooth cubic-bezier animation
  - Closed: `opacity: 0; visibility: hidden; translateY(-6px)`
  - Open: `opacity: 1; visibility: visible; translateY(0)`
- **12 languages** listed with RTL badges for Arabic/Urdu
- **Active language** highlighted with brand color background
- **Click-outside close** + **Escape key close**
- **URL routing**: English at `/tokx/`, others at `/tokx/[locale]/`
- **localStorage persistence** via `tokx-lang` key
- Wire into Nav.astro between ThemeSwitcher and GitHub link

### 3. Marquee Component (`packages/web/src/components/showcase/Marquee.astro`)
Port clipr's tech stack marquee:
- **Two rows** scrolling in opposite directions (25s forward, 30s reverse)
- **Technologies**: Astro, React, TypeScript, jose, Biome, Vitest, pnpm, Node.js
- **SVG icons** for each technology (inline SVG or text-based)
- **Mask gradient** at edges: `mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent)`
- **Hover effect**: Individual items scale 1.05, opacity goes from 0.35 to 1, color changes to brand
- **4x repeat** for seamless loop
- **Respects prefers-reduced-motion**: animation disabled
- Place between Hero and Debugger sections on homepage

### 4. Nav Link Underline Animation (enhance `Nav.astro`)
Port clipr's nav link hover effect:
- **`::after` pseudo-element** with gradient background (brand → brand-light)
- **Width animation**: `scaleX(0)` → `scaleX(1)` on hover
- **Transform origin**: `right` → `left` (slide in from left)
- **Active link**: Permanent underline + brand color text + subtle text-shadow glow
- **GitHub button hover**: Scale 1.05, glow effect

### 5. Hero Floating Labels (enhance `Hero.astro`)
Port clipr's floating decorative elements:
- **3 floating labels**: `/decode`, `/verify`, `/sign` positioned absolutely
- **Staggered float animation** using CSS custom properties `--float-delay`
- **Glass morphism style**: Semi-transparent background + border + blur
- **Positioned** at different corners, drifting slowly with `float` keyframe (8s cycle)

### 6. Hero Rotating Words (enhance `Hero.astro`)
Port clipr's word rotation in the title:
- Title reads: "JSON Web Tokens" + rotating word: `decoded.` / `verified.` / `signed.` / `secured.`
- **Word transition**: Fade out old word (opacity + translateY), fade in new word
- **4-second cycle** per word
- **Theme-aware**: Different accent words for different themes
- Implementation: Small `<script>` that cycles through words array

### 7. Footer Polish (enhance `Footer.astro`)
Port clipr's footer enhancements:
- **Logo auto-slash**: After 10 seconds on page, trigger the logo slash animation
- **Social/link icons**: Scale 1.1 on hover with smooth transition
- **Accent border top**: Gradient line at top of footer (brand → brand-light → transparent)
- **Link hover**: Underline animation matching nav pattern

### 8. Hover Effects System (global)
Add missing hover effects throughout:
- **Library cards**: Border glow intensifies on hover, translateY(-4px) lift
- **Copy buttons**: Green flash on success (already exists, verify working)
- **Buttons**: Shimmer sweep on hover (already in global.css `.btn::after`)
- **Introduction page**: Code block hover to reveal copy button
- **All external links**: `target="_blank" rel="noopener noreferrer"` (verify)

### Files to create:
- `packages/web/src/components/ui/LangSwitcher.astro` — NEW
- `packages/web/src/components/showcase/Marquee.astro` — NEW

### Files to modify:
- `packages/web/src/components/ui/Logo.astro` — Add slash animation + split effect
- `packages/web/src/components/common/Nav.astro` — Add LangSwitcher, link underline animations
- `packages/web/src/components/common/Footer.astro` — Add accent border, auto-slash, social hover
- `packages/web/src/components/hero/Hero.astro` — Add floating labels, rotating words
- `packages/web/src/pages/index.astro` — Add Marquee between Hero and Debugger
- `packages/web/src/styles/global.css` — Add any missing hover utility classes

### Verification:
- `pnpm build:web` — all 4 pages build
- `pnpm lint` — zero errors
- `pnpm dev:web` — visual check:
  - Logo animates on hover (slash + split)
  - Nav links have underline animation
  - Language switcher opens/closes, shows 12 languages
  - Marquee scrolls in 2 rows with hover effects
  - Hero has floating labels + rotating words
  - Footer logo auto-slashes after 10s
  - All hover effects work on cards, buttons, links

---

## Phase 10 — Marquee Redesign + Animated Language Icons

### Context
Replace the current emoji-based marquee with slay's polished icon-based marquee using Simple Icons CDN. Add animated SVG language icons (from fyniti) to library cards and the marquee.

### 10.1 Redesign Marquee (from slay `/Users/hammadkhan/slay/website/src/components/Marquee.astro`)
Port slay's marquee design:
- **Icons from Simple Icons CDN**: `https://cdn.simpleicons.org/{slug}/{color}`
- **Grayscale by default**, full color on hover (`filter: grayscale(1) brightness(0.6)`)
- **Larger gap** (56px) and bigger icons (28px)
- **40s animation** (slower, more premium feel)
- **Wider fade mask**: 10% edges (vs current 8%)
- **Single row** (slay uses one row, not two — cleaner)
- Technologies: JavaScript, Python, Java, Go, Rust, Ruby, PHP, TypeScript, Swift, Kotlin, Elixir, Haskell, Scala, C++, Perl

### 10.2 Copy Animated SVG Icons from fyniti
Source: `/Users/hammadkhan/fyniti/public/icons/animated/`
Target: `/Users/hammadkhan/tokx/packages/web/public/icons/languages/`

**Copy these animated icons** (SMIL/CSS animations inside SVG):
- `go.svg`, `java.svg`, `js.svg`, `nodejs.svg`, `php.svg`, `python.svg`, `ruby.svg`, `rust.svg`, `swift.svg`, `ts.svg`, `cpp.svg`, `csharp.svg`

**Copy static fallbacks** from `/Users/hammadkhan/fyniti/public/icons/skills/` for languages without animated versions.

For languages not in fyniti (Kotlin, Dart, Perl, Lua, Haskell, Scala, Clojure, Erlang, etc.), use Simple Icons CDN as `<img>` fallback.

### 10.3 Add Language Icons to Library Cards
In `LibraryCard.astro`:
- Replace text-only language badge with icon + text
- Icon strategy per library:
  1. If animated SVG exists in `/icons/languages/{slug}.svg` → use `<img src>` (SMIL animates on load)
  2. Else → use Simple Icons CDN: `<img src="https://cdn.simpleicons.org/{slug}/{color}">`
- Icon size: 16x16 in cards, 28x28 in marquee
- Language-to-slug mapping in a shared `languageIcons.ts` data file

### 10.4 Language Icon Mapping (`packages/web/src/data/languageIcons.ts`)
```ts
export const LANG_ICONS: Record<string, { slug: string; color: string; animated?: boolean }> = {
  'JavaScript': { slug: 'js', color: 'f7df1e', animated: true },
  'Python': { slug: 'python', color: '3776ab', animated: true },
  'Java': { slug: 'java', color: 'ed8b00', animated: true },
  'Go': { slug: 'go', color: '00add8', animated: true },
  'Rust': { slug: 'rust', color: 'dea584', animated: true },
  'Ruby': { slug: 'ruby', color: 'cc342d', animated: true },
  'PHP': { slug: 'php', color: '777bb4', animated: true },
  '.NET': { slug: 'csharp', color: '512bd4', animated: true },
  'Swift': { slug: 'swift', color: 'f05138', animated: true },
  'C++': { slug: 'cpp', color: '00599c', animated: true },
  'TypeScript': { slug: 'ts', color: '3178c6', animated: true },
  // CDN fallback (no local animated SVG)
  'Kotlin': { slug: 'kotlin', color: '7f52ff' },
  'Dart': { slug: 'dart', color: '0175c2' },
  'Elixir': { slug: 'elixir', color: '4b275f' },
  'Erlang': { slug: 'erlang', color: 'a90533' },
  'Haskell': { slug: 'haskell', color: '5e5086' },
  'Scala': { slug: 'scala', color: 'dc322f' },
  'Clojure': { slug: 'clojure', color: '5881d8' },
  'Lua': { slug: 'lua', color: '2c2d72' },
  'Perl': { slug: 'perl', color: '39457e' },
  'PostgreSQL': { slug: 'postgresql', color: '4169e1' },
  'Deno': { slug: 'deno', color: '70ffaf' },
  'Bun': { slug: 'bun', color: 'f9f1e1' },
  'Crystal': { slug: 'crystal', color: '000000' },
  'OCaml': { slug: 'ocaml', color: 'ec6813' },
  'Delphi': { slug: 'delphi', color: 'ee1f35' },
  'Groovy': { slug: 'apachegroovy', color: '4298b8' },
  'Ada': { slug: 'ada', color: '02f88c' },
  'D': { slug: 'd', color: 'b03931' },
  'PowerShell': { slug: 'powershell', color: '5391fe' },
  'Objective-C': { slug: 'apple', color: '000000' },
};
```

### Files to create:
- `packages/web/public/icons/languages/` — Copy ~12 animated SVGs from fyniti
- `packages/web/src/data/languageIcons.ts` — Language-to-icon mapping

### Files to modify:
- `packages/web/src/components/showcase/Marquee.astro` — Redesign with slay pattern + real icons
- `packages/web/src/components/libraries/LibraryCard.astro` — Add language icon next to badge

### Verification:
- `pnpm build:web` — all pages build
- `pnpm dev:web` — visual check:
  - Marquee shows grayscale icons, color on hover
  - Library cards show animated SVG icons for supported languages
  - Fallback to CDN icons for unsupported languages
  - No broken images

---

## Phase 9 — Publish Readiness Fixes

### Context
Audit found 3 CRITICAL + 6 HIGH issues blocking npm/web publish. This phase fixes all of them.

### 9.1 CRITICAL: Package publish files
- Copy `/tokx/LICENSE` → `packages/core/LICENSE` and `packages/cli/LICENSE`
- Create `packages/core/README.md` (package description, install, API surface, examples)
- Create `packages/cli/README.md` (package description, install, all 4 commands with examples)
- Add `"prepublishOnly": "pnpm build"` to `packages/cli/package.json`

### 9.2 CRITICAL: Fix i18n locales
- Remove empty locales from `astro.config.ts` — keep only `en`, `ar`, `ur` (the 3 that have content)
- Delete placeholder files: es.ts, fr.ts, de.ts, pt.ts, ru.ts, zh.ts, hi.ts, bn.ts, ja.ts
- Update `i18n/index.ts` locale list to match
- Update `LangSwitcher.astro` to only show en, ar, ur
- Can re-add locales later when translations are complete

### 9.3 HIGH: npm metadata
Add to both `packages/core/package.json` and `packages/cli/package.json`:
```json
"keywords": ["jwt", "json-web-token", "decode", "encode", "verify", "jose", "cli"],
"repository": { "type": "git", "url": "git+https://github.com/hammadxcm/tokx.git", "directory": "packages/core" },
"homepage": "https://tokx.fyniti.co.uk",
"bugs": { "url": "https://github.com/hammadxcm/tokx/issues" }
```
Add `"main": "./dist/api.js"` to CLI package.json

### 9.4 HIGH: SEO meta tags
In `Layout.astro`, add:
- `og:image` → `/og-image.png` (create a 1200x630 OG image)
- `og:url` → site URL
- `og:site_name` → "tokx"
- `twitter:image` → same as og:image
- `twitter:card` → `summary_large_image`
- Dynamic canonical URL per page (pass as prop)

### 9.5 HIGH: CSP meta tag
In `Layout.astro` `<head>`, add:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self';" />
```

### 9.6 HIGH: Expand library catalogue
Add 35+ more libraries to `data/libraries.json` to reach 50+ total. Focus on:
- More JavaScript (jose, jwt-decode, fast-jwt)
- More Python (authlib, joserfc)
- More Java (nimbus-jose-jwt, spring-security)
- More Go (lestrrat-go/jwx)
- C# (more .NET options)
- Elixir (joken)
- Haskell (jose-jwt)
- Scala (jwt-scala)
- C/C++ (libjwt, jwt-cpp)
- Clojure (buddy-sign)
- Lua, Perl, Dart, Swift, Kotlin (already have some)

### 9.7 MEDIUM: Accessibility
- Add `aria-live="polite"` to verification badge container in JwtDebugger.tsx
- Remove deprecated `document.execCommand('copy')` fallback from CopyButton.astro

### Files to create:
- `packages/core/README.md`
- `packages/core/LICENSE` (copy)
- `packages/cli/README.md`
- `packages/cli/LICENSE` (copy)

### Files to modify:
- `packages/core/package.json` (keywords, repository, homepage, bugs)
- `packages/cli/package.json` (prepublishOnly, main, keywords, repository, homepage, bugs)
- `packages/web/astro.config.ts` (trim locales to en, ar, ur)
- `packages/web/src/i18n/index.ts` (trim locale list)
- `packages/web/src/components/ui/LangSwitcher.astro` (trim languages)
- `packages/web/src/layouts/Layout.astro` (og:image, CSP, dynamic canonical)
- `packages/web/src/data/libraries.json` (expand to 50+)
- `packages/web/src/components/debugger/JwtDebugger.tsx` (aria-live)
- `packages/web/src/components/ui/CopyButton.astro` (remove execCommand fallback)

### Verification:
- `pnpm lint` — zero errors
- `pnpm test` — all pass
- `pnpm build` — all 4 pages + 3 packages
- `cd packages/core && npm pack --dry-run` — verify all files present
- `cd packages/cli && npm pack --dry-run` — verify all files present

---

## Phase 11 — Full Audit Fixes

### Context
Comprehensive audit found 33 issues across code quality, features, security, testing, and infrastructure. This phase fixes them grouped by effort.

### 11.1 Dead Code Cleanup (YAGNI)

**Delete entire file** `packages/cli/src/utils/output.ts` — all 7 exports are unused (replaced by ui/ modules in Phase 6). Remove the `readFileSync` import too.

**Unexport `toErrorMessage`** in `packages/core/src/verify.ts` — change `export function toErrorMessage` to `function toErrorMessage`. Update `verify.test.ts` to test it indirectly through verify() instead of importing it directly.

**Delete unused i18n keys** from all 12 locale files:
- `nav.github`, `debugger.secretLabel`, `debugger.publicKey`, `debugger.privateKey`
- `libs.sign`, `libs.verify`, `libs.install`, `footer.madeWith`
(8 keys x 12 locales = 96 dead strings)

### 11.2 DRY Fix: Shared Library Data

**Problem**: Library data hardcoded in both `packages/web/src/data/libraries.json` AND `packages/cli/src/commands/libs.ts` (10 entries duplicated with different shapes).

**Fix**: CLI should import the JSON from a shared location at build time.
- Move `libraries.json` to `packages/core/data/libraries.json`
- Export it from `@tokx/core` as `import libraries from '@tokx/core/libraries.json'`
- OR simpler: CLI's `libs.ts` should `import data from '../../web/src/data/libraries.json'` — but cross-package import is fragile
- **Best approach**: Keep JSON in web, have CLI `tsup` bundle it inline by reading at build time via `fs.readFileSync` in `libs.ts` replaced with a static import. Since both are in same monorepo, tsup can resolve `../../web/src/data/libraries.json` at build.

Actually simplest DRY fix: add the JSON to `@tokx/core` package exports:
1. Copy `libraries.json` → `packages/core/data/libraries.json`
2. Add `"./libraries": "./data/libraries.json"` to core's package.json exports
3. CLI: `import libraries from '@tokx/core/libraries'`
4. Web: `import libraries from '@tokx/core/libraries'`
5. Delete hardcoded array from `packages/cli/src/commands/libs.ts`

### 11.3 CLI Enhancements

**Stdin piping** — Add `-` support to decode/verify commands:
```ts
// In decode command, before decoding:
if (token === '-') {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  token = Buffer.concat(chunks).toString().trim();
}
```

**Dynamic version** — Replace hardcoded `'0.0.1'` in `index.ts`:
```ts
import { readFileSync } from 'node:fs';
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
program.version(pkg.version);
```

**Shell completions** — Add `completions` command using commander's built-in:
```ts
program.command('completions').description('Generate shell completions').action(() => {
  // Output bash/zsh completion script
});
```

### 11.4 Web Feature Enhancements

**URL-based JWT sharing** — In JwtDebugger.tsx:
- On token change, update URL: `window.history.replaceState(null, '', `?token=${encodeURIComponent(token)}`)`
- On mount, read `?token=` from URL params and decode it
- Add "Copy Link" button next to Paste/Clear

**RSA/ECDSA key input** — In JwtDebugger.tsx:
- When algorithm is asymmetric, show two textareas (public key + private key) instead of single secret input
- Already have `publicKey`/`privateKey` in state, just need UI toggle

**Lazy load library icons** — In LibraryCard.astro:
- Add `loading="lazy"` to all `<img>` tags (already present on some, verify all)

### 11.5 Testing Expansion

**CLI UI unit tests** — Create `packages/cli/tests/ui.test.ts`:
- Test `drawBox()` returns correct box-drawing characters
- Test `drawBadge()` returns correct badge format
- Test `tokenBar()` returns correct proportional bar
- Test `isTTY()` + `NO_COLOR` behavior in `colors.ts`

**Web component tests** — Create `packages/web/vitest.config.ts` + test setup:
- Test i18n `getTranslation()` returns correct keys
- Test `getIconSrc()` returns correct paths for all languages
- Test library data JSON is valid and has required fields

### 11.6 Biome Config Hardening

In `biome.json`:
- Change `noExplicitAny` from `"warn"` to `"error"`
- Narrow the `.astro` override: only disable `noUnusedVariables` (keep `noUnusedImports`)
- The CSS `noImportantStyles: "off"` is correct — `!important` is needed for `prefers-reduced-motion` override

### 11.7 Infrastructure Files

**Create `.github/dependabot.yml`**:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
```

**Create `.github/CODEOWNERS`**:
```
* @hammadxcm
```

**Create `.github/ISSUE_TEMPLATE/bug_report.yml`** and **`feature_request.yml`** with proper fields.

**Create Husky hooks**:
- `.husky/pre-commit`: `pnpm lint`
- `.husky/commit-msg`: `npx commitlint --edit $1`

**Create OG image** — `packages/web/public/og-image.png` (1200x630):
- JWT-colored tokx logo on dark background
- Tagline: "Decode, verify, and generate JWTs"

### 11.8 Canvas Memory Leak Fix

In `packages/web/src/scripts/canvas.ts`:
- Store MutationObserver reference and disconnect on page unload
- Add `beforeunload` listener to clean up

### 11.9 Hardcoded Color Fixes

In `packages/web/src/styles/global.css`:
- Replace `color: #fff` with CSS variable
- Replace hardcoded rgba values with `color-mix()` using theme variables

In `packages/web/src/styles/themes.css`:
- Replace `color: #0c4a6e` in light theme override with variable

### 11.10 Accessibility Fixes

- **Theme switcher**: Add `aria-live="polite"` region that announces "Theme changed to X"
- **Mobile menu**: Add focus trap (trap Tab key within open menu)
- **404 page**: Add links to all 3 main pages

### Files to modify:
- `packages/cli/src/utils/output.ts` — DELETE
- `packages/cli/src/commands/libs.ts` — Import from shared source
- `packages/cli/src/index.ts` — Dynamic version, stdin support
- `packages/core/src/verify.ts` — Unexport toErrorMessage
- `packages/core/src/verify.test.ts` — Remove direct toErrorMessage import
- `packages/web/src/i18n/translations/*.ts` (12 files) — Remove 8 unused keys
- `packages/web/src/components/debugger/JwtDebugger.tsx` — URL sharing, RSA textarea
- `packages/web/src/scripts/canvas.ts` — MutationObserver cleanup
- `packages/web/src/styles/global.css` — Remove hardcoded colors
- `biome.json` — Harden rules

### Files to create:
- `.github/dependabot.yml`
- `.github/CODEOWNERS`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.husky/pre-commit`
- `.husky/commit-msg`
- `packages/web/public/og-image.png`
- `packages/cli/tests/ui.test.ts`
- `packages/web/vitest.config.ts`
- `packages/web/src/tests/i18n.test.ts`

### Verification:
- `pnpm lint` — zero errors with hardened rules
- `pnpm test` — all existing + new tests pass
- `pnpm build` — all 3 packages build
- `echo TOKEN | node packages/cli/dist/index.js decode -` — stdin works
- Open `/?token=eyJ...` — URL-based sharing works
- Check canvas in DevTools Memory tab — no observer leak

---

## Implementation Sequencing

| Phase | Prerequisites | Key Deliverable |
|-------|--------------|-----------------|
| 1. Scaffold | None | All config files, empty packages |
| 2. @tokx/core | Phase 1 | decode/encode/verify with tests |
| 3. JWT Debugger | Phase 2 | Full homepage with debugger, themes, canvas, i18n |
| 4. Introduction | Phase 3 | MDX page, static content |
| 5. Libraries | Phase 3 | Catalogue page + data |
| 6. CLI | Phase 2 | 4 commands with tests, enhanced UI from slay |
| 7. CI/CD | Phase 3 | 4 workflows, deployment, multi-platform wrappers |
| 8. UI/UX Polish | Phase 3 | Logo animation, marquee, lang switcher, hover effects, glitch |
| 9. Publish Fixes | All | README/LICENSE, npm metadata, i18n, SEO, CSP, library expansion |
| 10. Icons + Marquee | Phase 8 | Slay marquee, fyniti animated SVGs, local icons |
| 11. Audit Fixes | All | Dead code cleanup, DRY, tests, infra, a11y, features |
