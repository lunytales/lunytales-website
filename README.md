# lunytales-v2

Astro static site for Luny Tales v2 (staging on GitHub Pages).

## Local development

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Build output is generated in `dist/` (never edit `dist/` manually).

## Deploy

- Deploy runs automatically on push to `main` via `.github/workflows/deploy.yml`.
- Workflow builds the site, verifies required files, smoke-tests routes, then publishes `dist/` to `gh-pages`.

## Key routes

- `/` (ES home)
- `/en/` (EN home)
- `/privacy/`
- `/terms/`

## Configuration

Central site config lives in `src/config/site.ts`:

- `baseUrls.staging` / `baseUrls.production`
- `IS_STAGING` (single source of truth for `noindex` and `robots.txt`)
- `email`
- `hotmartUrl`
- `paths` (home, legal pages, demo, OG images)
- `trackingGate`

SEO helpers are in `src/lib/seo.ts`.

## Staging behavior

- `IS_STAGING: true` sets `meta robots` to `noindex,nofollow` and `robots.txt` to `Disallow: /`.
- `trackingGate: true` keeps tracking disabled unless URL contains `?track=1`.
