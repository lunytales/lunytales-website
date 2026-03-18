# lunytales-v2

Astro static site for Luny Tales v2.

## Full technical documentation

- See `docs/PROJECT_HANDBOOK.md` for architecture, configuration, SEO/i18n rules, CI/CD, and migration notes.
- Spanish version: `docs/PROJECT_HANDBOOK.es.md`.

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

- `SITE_CONFIG.origin` (single source of truth for canonical origin)
- `IS_STAGING` from `PUBLIC_IS_STAGING` (single source of truth for `noindex` and `robots.txt`)
- `hotmartUrl`
- `paths` (home, legal pages, demo, OG images)
- `trackingGate`

SEO helpers are in `src/lib/seo.ts`.

## Environment behavior

- `IS_STAGING: false` (default) sets `meta robots` to `index,follow` and `robots.txt` to `Allow: /`.
- Set `PUBLIC_IS_STAGING=true` to enforce `meta robots` as `noindex,nofollow` and `robots.txt` as `Disallow: /`.
- `trackingGate: true` keeps tracking disabled unless URL contains `?track=1`.

Temporary note: test-preview branch used to validate Cloudflare preview deployments.
