# Luny Tales v2 — Project Handbook

This document is the technical source of truth for the `lunytales-v2` repository.
It is intended for engineers maintaining, extending, or migrating the site.

## 1) Project Scope

- Product: Luny Tales marketing website (Spanish + English) built with Astro.
- Production domain: `https://lunytales.com` (root domain).
- Output mode: static site generation (`output: "static"`).
- Rule: never edit `dist/` manually.

## 2) Technology Stack

- Runtime: Node.js (CI uses Node 20).
- Framework: Astro `^5.17.1`.
- Styling:
  - Bootstrap `^5.3.8` (installed via npm, self-hosted from built assets).
  - Custom global CSS in `public/styles.css`.
- Client scripts: vanilla JavaScript in `public/assets/js/`.
- SEO sitemap integration: `@astrojs/sitemap`.
- CI/CD: GitHub Actions + `peaceiris/actions-gh-pages`.
- Hosting: GitHub Pages (`gh-pages` branch) + custom domain from `public/CNAME`.

## 2.1) Edge Infrastructure (Cloudflare)

This configuration is operational (outside the repository) and must be preserved:

- Domain traffic proxied through Cloudflare (orange-cloud proxy enabled).
- HTTPS enforced at edge level for all requests.
- TLS and cache behavior handled by Cloudflare in front of GitHub Pages.

Domain mapping note:

- The production domain is declared in `public/CNAME` as `lunytales.com`.
- GitHub Pages serves that custom domain binding, while authoritative DNS is managed in Cloudflare.
- All public traffic is expected to pass through Cloudflare proxy (orange cloud).

Verification commands:

```bash
curl -I https://lunytales.com/
curl -I https://www.lunytales.com/
curl -I https://lunytales.com/styles.css
curl -I https://lunytales.com/assets/img/mascota.webp
```

Expected outcomes:

- `https://lunytales.com/` returns `200`.
- `https://www.lunytales.com/` redirects to apex (`301`/`308`).
- Static assets return `200`.
- Response headers show Cloudflare presence (`server: cloudflare`, `cf-ray`).

Note: these settings are not controlled by Astro code. If behavior changes, review Cloudflare dashboard and DNS first.

## 3) Repository Layout

```text
.
├── .github/workflows/deploy.yml
├── astro.config.mjs
├── docs/
│   ├── PROJECT_HANDBOOK.md
│   └── PROJECT_HANDBOOK.es.md
├── public/
│   ├── CNAME
│   ├── styles.css
│   ├── favicon.ico
│   └── assets/
│       ├── demo/
│       ├── favicon/
│       ├── icons/
│       ├── img/
│       └── js/
├── src/
│   ├── components/
│   │   ├── HomePage.astro
│   │   └── StoriesCards.astro
│   ├── config/site.ts
│   ├── i18n/
│   ├── layouts/SiteLayout.astro
│   ├── lib/
│   └── pages/
└── README.md
```

## 4) Route Map

Primary routes:

- `/` (Spanish home)
- `/en/` (English home)
- `/privacy/`
- `/terms/`
- `/en/privacy/`
- `/en/terms/`
- `/3-cuentos-para-dormir/` (SEO landing ES)
- `/en/3-minute-bedtime-stories/` (SEO landing EN)

Infrastructure routes:

- `/robots.txt` from `src/pages/robots.txt.ts`
- `/sitemap.xml` from `src/pages/sitemap.xml.ts` (points to `sitemap-index.xml`)
- `/lunytales-v2/` redirect shim page to `/` for legacy links

Robots discovery:

- `/robots.txt` currently allows full crawling (`Allow: /`) in production.
- It also advertises sitemap discovery with `Sitemap: https://lunytales.com/sitemap.xml`.

## 5) Configuration Model

Single source for project-level settings:

- `src/config/site.ts`

Important keys:

- `IS_STAGING` from `PUBLIC_IS_STAGING === "true"`.
- `SITE_CONFIG.origin` (`https://lunytales.com`).
- `SITE_CONFIG.hotmartUrlEs` (Spanish checkout).
- `SITE_CONFIG.hotmartUrlEn` (English checkout).
- `SITE_CONFIG.paths.*` (all canonical paths and key assets).
- `SITE_CONFIG.trackingGate`.

Utility:

- `toHref(path)` normalizes internal links (`""` -> `"./"`).

## 6) i18n Architecture

Files:

- `src/i18n/es.ts`
- `src/i18n/en.ts`
- `src/i18n/index.ts`

Guardrails:

- Build fails if ES/EN dictionary parity breaks.
- Validation enforces:
  - missing/extra keys,
  - type mismatches,
  - array length mismatches,
  - key mismatch inside array object items.

## 7) SEO and Structured Data

SEO generator:

- `src/lib/seo.ts`

Sets:

- canonical URL,
- hreflang alternates (`es`, `en`, `x-default`),
- OG/Twitter meta,
- robots meta from staging flag.

Structured data:

- Built in `src/lib/structured-data.ts`
- Injected in `src/layouts/SiteLayout.astro` with JSON-LD script tags.
- Current graph includes `Organization`, `WebSite`, and `CreativeWorkSeries`.

Sitemaps:

- `@astrojs/sitemap` generates `sitemap-index.xml` + `sitemap-0.xml`.
- `astro.config.mjs` excludes legacy `/lunytales-v2/` from generated sitemap entries.
- `src/pages/sitemap.xml.ts` exposes `/sitemap.xml` as a stable sitemap index entrypoint.

Public sitemap entrypoint:

- `https://lunytales.com/sitemap.xml` is the public entrypoint consumed by crawlers.
- That endpoint points to `sitemap-index.xml`, which references `sitemap-0.xml` generated by `@astrojs/sitemap`.
- Generated sitemap entries include canonical, indexable URLs only.
- Legacy redirect routes (for example `/lunytales-v2/`) are intentionally excluded.

## 8) Styling and Bootstrap Loading Order

Source of truth for shell and CSS order:

- `src/layouts/SiteLayout.astro`

Current order in built HTML:

1. Local Bootstrap CSS asset (`/_astro/bootstrap.min.*.css`)
2. Custom stylesheet (`/styles.css?...`)

This order is intentional so custom button/theme rules in `public/styles.css` override Bootstrap defaults.

Bootstrap JS:

- Loaded locally from npm build asset (`/_astro/bootstrap.bundle.min.*.js`).
- No Bootstrap CDN references remain in source or built output.

## 9) Tracking and Consent

Files:

- `public/assets/js/consent.js`
- `public/assets/js/tracking.js`

Behavior:

- Tracking requires cookie consent acceptance.
- If `SITE_CONFIG.trackingGate` is enabled, tracking also requires `?track=1`.

## 10) CI/CD Pipeline

Workflow:

- `.github/workflows/deploy.yml`

Pipeline steps:

1. Checkout
2. `npm ci`
3. `npm run build`
4. Verify required build artifacts
5. Smoke test static output on local HTTP server
6. Publish `dist/` to `gh-pages`

Smoke test routes/assets currently covered:

- `/`, `/en/`, `/privacy/`, `/terms/`, `/en/privacy/`, `/en/terms/`
- `/sitemap.xml`, `/robots.txt`
- `/styles.css`
- `/assets/demo/demo.pdf`, `/assets/demo/demo_eng.pdf`

## 11) Asset Strategy

- Static assets are under `public/assets/...`.
- Hero assets are language-specific:
  - ES: default hero assets
  - EN: `hero-title-en.svg`, `mascota-en.webp`
- Demo PDFs:
  - ES: `assets/demo/demo.pdf`
  - EN: `assets/demo/demo_eng.pdf`
- Checkout by locale:
  - ES: `SITE_CONFIG.hotmartUrlEs`
  - EN: `SITE_CONFIG.hotmartUrlEn`

## 12) Key Shared Components

- `src/layouts/SiteLayout.astro`: head/nav/footer/cookie/tracking shell.
- `src/components/HomePage.astro`: shared home content structure.
- `src/components/StoriesCards.astro`: reusable stories cards block (optional heading control).

## 13) Change Guide

| Change needed | Primary file(s) |
| --- | --- |
| Canonical origin / global flags | `src/config/site.ts` |
| SEO meta behavior | `src/lib/seo.ts` |
| Structured data | `src/lib/structured-data.ts` |
| Shared layout behavior/scripts | `src/layouts/SiteLayout.astro` |
| Home/SEO cards presentation | `src/components/HomePage.astro`, `src/components/StoriesCards.astro` |
| ES/EN content strings | `src/i18n/es.ts`, `src/i18n/en.ts` |
| Global styling | `public/styles.css` |
| Robots/sitemap endpoint behavior | `src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts`, `astro.config.mjs` |
| Deploy checks | `.github/workflows/deploy.yml` |

## 14) Release Checklist

- `npm run build` passes.
- i18n parity validation passes.
- No manual changes in `dist/`.
- No hardcoded outdated domain/path values.
- No Bootstrap CDN references in source/build.
- Smoke-test routes/assets remain green in CI.
- Canonical, hreflang, robots, and sitemap outputs are production-correct.

## 15) Operational Notes

- Keep commit messages and code comments in professional English.
- Keep commits atomic and Conventional Commit compliant.
- Keep `/lunytales-v2/` redirect until all legacy external links are fully migrated.

## 16) Hosting Topology

Deployment flow:

- Astro build → GitHub Actions → `gh-pages` branch → GitHub Pages origin → Cloudflare edge cache → end user
