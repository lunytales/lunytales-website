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
- `environment` (switch target with `PUBLIC_SITE_ENV`, defaults to `staging`)
- `email`
- `hotmartUrl`
- `paths` (home, legal pages, demo, OG images)
- `flags.noindex`
- `flags.trackingGate`

SEO helpers are in `src/lib/seo.ts`.

## Staging flags

- `flags.noindex: true` keeps meta robots as `noindex,nofollow`.
- `flags.trackingGate: true` keeps tracking disabled unless URL contains `?track=1`.

