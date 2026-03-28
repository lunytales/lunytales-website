# Luny Tales Website — Project Handbook

This document is the technical source of truth for the `lunytales-website` repository.
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
- CI/CD: GitHub Actions (CI checks) + Cloudflare Pages deployments.
- Hosting: Cloudflare Pages (production from `main`, previews from non-main branches).

## 2.1) Edge Infrastructure (Cloudflare)

This configuration is operational (outside the repository) and must be preserved:

- Domain traffic proxied through Cloudflare (orange-cloud proxy enabled).
- HTTPS enforced at edge level for all requests.
- TLS and edge cache handled by Cloudflare in front of Cloudflare Pages origin.

Domain mapping note:

- `lunytales.com` is connected as a custom domain in Cloudflare Pages.
- Authoritative DNS is managed in Cloudflare.
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
- `/faq/`
- `/en/faq/`
- `/3-cuentos-para-dormir/` (SEO landing ES)
- `/en/3-minute-bedtime-stories/` (SEO landing EN)

Infrastructure routes:

- `/robots.txt` from `src/pages/robots.txt.ts`
- `/sitemap.xml` from `src/pages/sitemap.xml.ts` (points to `sitemap-index.xml`)
- `/lunytales-v2/` legacy redirect to `/` managed via `public/_redirects`

Robots discovery:

- `/robots.txt` currently allows full crawling (`Allow: /`) in production.
- It also advertises sitemap discovery with `Sitemap: https://lunytales.com/sitemap.xml`.

## 5) Configuration Model

Single source for project-level settings:

- `src/config/site.ts`

Important keys:

- `IS_STAGING` from staging/preview environment signals (`PUBLIC_IS_STAGING`, preview context).
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
6. Complete CI checks (no GitHub Pages publish step)

Smoke test routes/assets currently covered:

- `/`, `/en/`, `/privacy/`, `/terms/`, `/en/privacy/`, `/en/terms/`
- `/sitemap.xml`, `/robots.txt`
- `/styles.css`
- `/assets/demo/demo.pdf`, `/assets/demo/demo_eng.pdf`

## 11) Asset Strategy

- Static assets are under `public/assets/...`.
- Home hero uses:
  - shared responsive mascot assets: `mascota-luny-512.webp`, `mascota-luny-640.webp`, `mascota-luny-768.webp`, `mascota-luny-1024.webp`
  - shared background asset: `hero-bg.jpg`
  - locale-specific title art: ES `logo2.svg`, EN `hero-title-en.svg`
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
- `src/components/FaqSection.astro`: shared FAQ section for ES/EN (topic nav, anchors, and accordions).

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

- Astro build → Cloudflare Pages deployment pipeline → Cloudflare Pages origin → Cloudflare edge cache → end user


## 17) Post-Migration Cleanup Decisions

- Hosting cutover is completed: `https://lunytales.com` now runs on Cloudflare Pages.
- `public/CNAME` was removed because domain binding is managed directly in Cloudflare Pages.
- `.github/workflows/deploy.yml` was retained as CI checks, but GitHub Pages publishing was removed.
- `public/_redirects` remains the source of truth for legacy route redirects (including `/lunytales-v2/`).


## 18) FAQ and navigation updates (2026-03)

- FAQ was removed from home and consolidated as dedicated pages:
  - ES: `/faq/`
  - EN: `/en/faq/`
- Footer now includes locale-aware FAQ links (ES/EN).
- Home header now includes FAQ as a supporting navigation link:
  - ES: `Preguntas frecuentes`
  - EN: `FAQ`
- FAQ copy, topic navigation anchors, and ES/EN editorial consistency were refined.
- Skill naming convention in content:
  - ES: `Cuentos Luna`
  - EN: `Luny Tales`
- Branch QA policy: always use the stable Cloudflare Pages branch alias URL (`https://<normalized-branch>.lunytales-website.pages.dev`) for ongoing review; avoid hash-specific deploy URLs as the primary QA link.

## 19) FAQ hero and visual alignment (2026-03)

- FAQ hero was aligned with the latest home hero visual language:
  - same background treatment
  - same overlay/gradient approach
  - responsive composition tuning for desktop/tablet/mobile
- Relevant FAQ hero assets:
  - `public/assets/img/luny-faq.png`
  - `public/assets/img/hero-bg.jpg` (shared background)

## 20) Home hero update and frontend maintainability (2026-03)

- Home hero was updated with:
  - new background treatment
  - new Luny hero asset
  - CSS overlay to improve text legibility without flattening the atmosphere.
- Approved frontend maintainability cleanup (`codex/frontend-cleanup` branch):
  - scoped home hero styles to prevent global bleed
  - removed unused assets and dead imports.
- Operational note: this cleanup is documented as a maintenance track and should be validated again before final integration if it is not yet in `main`.


## 21) Performance, accessibility, and edge security hardening (2026-03-28)

Implemented scope:

- Home/hero performance:
  - LCP optimization centered on the hero mascot `<img>`.
  - Responsive mascot delivery with WebP variants and tuned loading priority.
  - Hero visual design preserved while reducing mobile transfer overhead.
- Story covers optimization:
  - Added responsive variants for `timo`, `galen`, and `lira`.
  - `src/components/StoriesCards.astro` now uses `srcset`/`sizes` to avoid overserving 1100px originals on mobile.
- Accessibility pass:
  - Improved touch targets in mobile footer legal links and cookie preferences trigger.
  - Contrast tuned in cookie banner and responsive nav hierarchy softened.

Cloudflare edge operations:

- Security headers are managed at edge level (Cloudflare), not in Astro source:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Frame-Options: SAMEORIGIN`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- Cloudflare Managed `robots.txt` content-signal injection was disabled.
  - Public `robots.txt` is standards-only (`User-agent`, `Allow`, `Sitemap`).

Repository cleanup in this round:

- Removed orphan hero image variants no longer referenced by source templates:
  - `public/assets/img/mascota-512.webp`
  - `public/assets/img/mascota-768.webp`
  - `public/assets/img/mascota-1024.webp`
  - `public/assets/img/mascota-en-512.webp`
  - `public/assets/img/mascota-en-768.webp`
  - `public/assets/img/mascota-en-1024.webp`

Status snapshot:

- Security headers grade reported in current operations review: `A`.
- Home Lighthouse is currently in the high range after this performance pass (exact score varies by run conditions).

Deliberate deferrals / tradeoffs:

- `Content-Security-Policy` intentionally deferred to a dedicated hardening phase to avoid accidental breakage of third-party resources.
- No aggressive CSS refactor in this round.
- CSS order intentionally kept stable (`bootstrap` first, `styles.css` second) to preserve approved CTA brand styling.
