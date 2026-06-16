# Event Scout

**What's happening near you this weekend — curated by AI, not an algorithm.**

Event Scout is an AI-powered local event discovery tool. Enter your location and a few interest tags, and Claude — armed with real-time web search — surfaces upcoming local events, festivals, markets, shows, and activities curated for you. No generic listings, no login walls, no ad-driven noise.

---

## Features

- Location input with optional browser geolocation (via Nominatim reverse geocoding)
- Date range selection: This Weekend, This Week, Next 2 Weeks
- Interest tags: Music, Food & Drink, Arts, Outdoors, Markets, Family, Sports, Film, Comedy, Free Only
- 4–8 curated event cards per search with venue, date/time, description, cost, and source link
- Expandable "Why this pick" reasoning for each event
- Skeleton loading state, empty state, and error state with retry
- Fully accessible (WCAG 2.1 AA), keyboard-navigable, screen-reader-friendly

## Tech Stack

- Vanilla HTML / CSS / JS — no framework
- [Claude API](https://docs.anthropic.com/en/api/getting-started) (`claude-sonnet-4-6`) with `web_search_20250305` tool
- [Nominatim](https://nominatim.org/) (OpenStreetMap) for reverse geocoding — no API key required
- [Lucide Icons](https://lucide.dev/) via CDN
- Deployed on Netlify

## Setup

1. Clone the repo and install dev dependencies:

   ```
   git clone https://github.com/tomd0627/event-scout.git
   cd event-scout
   npm install
   ```

2. Set your Anthropic API key. Create a gitignored `env.js` at the project root:

   ```js
   window.ANTHROPIC_API_KEY = 'sk-ant-...';
   ```

   Then add it as the first script tag in `index.html` (before `scout.js`):

   ```html
   <script src="/env.js"></script>
   ```

   > **Security note:** Exposing an API key in client-side code is fine for a portfolio demo, but in production you would proxy requests through a backend. Restrict your key's usage in the [Anthropic Console](https://console.anthropic.com/) if needed.

3. Open `index.html` directly in a browser — no build step or local server required.

## Linting & Formatting

```bash
npm run lint          # Run all linters (CSS, JS, HTML)
npm run lint:css      # Stylelint
npm run lint:js       # ESLint
npm run lint:html     # html-validate
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
```

Pre-commit hooks (Husky + lint-staged) run linting and formatting automatically on staged files.

## Deployment

Push to main — Netlify handles the deploy automatically. No build step needed. Set `ANTHROPIC_API_KEY` in **Netlify → Site settings → Environment variables** and inject it via a Netlify Edge Function for production use (to avoid client-side key exposure).
