# Event Scout — CLAUDE.md

## Project Overview

AI-powered local event discovery. Users enter location + interest tags → Claude searches the web → curated event cards render. No framework, no build step, no backend.

## Palette

| Token                   | Value     | Usage                                   |
| ----------------------- | --------- | --------------------------------------- |
| `--color-bg`            | `#fdfaf6` | Page background                         |
| `--color-surface`       | `#ffffff` | Card background                         |
| `--color-surface-warm`  | `#f7f0e8` | Header, featured bg                     |
| `--color-ink`           | `#1f1710` | Body text                               |
| `--color-ink-muted`     | `#6b5744` | Secondary text — ≥4.5:1 on all surfaces |
| `--color-accent`        | `#c05621` | Terracotta — primary CTA, links         |
| `--color-accent-hover`  | `#9c4415` | Hover state                             |
| `--color-accent-soft`   | `#fef3ec` | Tag chip background                     |
| `--color-tag-sage`      | `#2d6a4f` | Category tag text — ≥5.2:1 on white     |
| `--color-tag-sage-soft` | `#eaf4ee` | Category tag background                 |
| `--color-border`        | `#e8ddd3` | Card borders, dividers                  |

Typefaces: **Syne** (headings) + **Source Sans 3** (body) via Google Fonts.
Icons: **Lucide** via CDN (`window.lucide.createIcons()` must be called after DOM changes).

## File Roles

| File             | Role                                                  |
| ---------------- | ----------------------------------------------------- |
| `index.html`     | Single page — all states live here as hidden sections |
| `css/styles.css` | All styles — CSS custom properties, BEM naming        |
| `js/scout.js`    | Claude API call with `web_search_20250305` tool       |
| `js/renderer.js` | DOM building — event cards, skeleton, empty, error    |
| `js/app.js`      | Event wiring, geolocation, UI state machine           |

## Known Gotchas

**Multi-turn Claude response:** The `web_search` tool causes Claude to return `tool_use` blocks before the final text. Never read `content[0]`. Always filter for `type === 'text'` blocks, join them, then `JSON.parse()`.

**ESLint `sourceType: 'script'`:** These are classic browser scripts loaded via `<script src>` tags, not ES modules. The ESLint config uses `sourceType: 'script'` to reflect this. Modern JS syntax (arrow functions, `const`/`let`, template literals, async/await) is fine — just no `import`/`export` statements.

**`/* exported funcName */` comments:** Used in `renderer.js` and `scout.js` to tell ESLint that functions are consumed by `app.js` via global scope. Do not remove these comments.

**Nominatim User-Agent:** The Nominatim reverse-geocode fetch must include a `User-Agent` header identifying the app. Requests without it will be blocked. See `js/app.js`.

**Lucide icon re-initialization:** After `renderEvents()` inserts new DOM, call `window.lucide.createIcons()` again — Lucide only processes elements present at the time of the call.

**API key:** `window.ANTHROPIC_API_KEY` is read at request time from a gitignored `env.js`. Never commit this file.

**`anthropic-dangerous-direct-browser-access: true` header:** Required for direct browser fetch to the Anthropic API (bypasses CORS restriction). Only acceptable for demos — production should proxy through a backend.

## CSS Conventions

- All properties alphabetized within each rule (enforced by `stylelint-order`)
- Logical properties throughout (`margin-inline`, `padding-block`, etc.) — no physical `margin-left`/`padding-top`
- BEM class naming: `block__element--modifier`
- No `!important`
- Stylelint config overrides: `no-descending-specificity: null` (false positives from shared `svg`/`i` selectors across components), `custom-property-empty-line-before: null` (organizational grouping in `:root`)

## Accessibility Checklist

- Skip link → `<main id="main" tabindex="-1">`
- `role="status"` on loading, empty, error states — no `aria-live` (implicit)
- `aria-hidden="true"` on icon `<i>` elements directly, not on wrappers
- Interest tag chips: native `<input type="checkbox">` — no custom ARIA
- Segmented control: `aria-pressed` on each `<button>`
- External links: `aria-label="[event name] on [source]"`
- Geolocation button: `aria-label` explains what it does and confirms no storage
- `--color-ink-muted` (#6b5744) verified ≥4.5:1 on `#fdfaf6`, `#ffffff`, `#f7f0e8`

## Pre-Commit Hooks

Husky + lint-staged runs on commit:

- `*.css` → stylelint --fix, prettier --write
- `*.js` → eslint --fix, prettier --write
- `*.html` → html-validate, prettier --write
