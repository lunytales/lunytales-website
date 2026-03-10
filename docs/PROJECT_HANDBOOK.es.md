# Luny Tales v2 — Manual del Proyecto

Este documento es la fuente técnica de verdad del repositorio `lunytales-v2`.
Está pensado para cualquier persona que necesite mantener, extender o migrar el sitio.

## 1) Alcance del proyecto

- Producto: sitio web de Luny Tales (español + inglés) construido con Astro.
- Dominio de producción: `https://lunytales.com` (dominio raíz).
- Modo de salida: generación estática (`output: "static"`).
- Regla: nunca editar `dist/` manualmente.

## 2) Stack tecnológico

- Runtime: Node.js (CI usa Node 20).
- Framework: Astro `^5.17.1`.
- Estilos:
  - Bootstrap `^5.3.8` (instalado por npm, servido localmente desde assets del build).
  - CSS global personalizado en `public/styles.css`.
- Scripts de cliente: JavaScript vanilla en `public/assets/js/`.
- Integración de sitemap SEO: `@astrojs/sitemap`.
- CI/CD: GitHub Actions + `peaceiris/actions-gh-pages`.
- Hosting: GitHub Pages (`gh-pages`) + dominio personalizado desde `public/CNAME`.

## 2.1) Infraestructura Edge (Cloudflare)

Esta configuración es operativa (fuera del repositorio) y debe mantenerse:

- Tráfico del dominio proxyado por Cloudflare (proxy naranja activado).
- HTTPS forzado en el edge para todas las solicitudes.
- TLS y caché gestionados por Cloudflare delante de GitHub Pages.

Nota de mapeo de dominio:

- El dominio de producción se declara en `public/CNAME` como `lunytales.com`.
- GitHub Pages sirve esa asociación de dominio personalizado, mientras que el DNS autoritativo se gestiona en Cloudflare.
- Todo el tráfico público debe pasar por el proxy de Cloudflare (nube naranja).

Comandos de verificación:

```bash
curl -I https://lunytales.com/
curl -I https://www.lunytales.com/
curl -I https://lunytales.com/styles.css
curl -I https://lunytales.com/assets/img/mascota.webp
```

Resultados esperados:

- `https://lunytales.com/` responde `200`.
- `https://www.lunytales.com/` redirige al dominio apex (`301`/`308`).
- Los assets estáticos responden `200`.
- Los headers reflejan Cloudflare (`server: cloudflare`, `cf-ray`).

Nota: estas configuraciones no se controlan desde Astro. Si el comportamiento cambia, revisar primero Cloudflare y DNS.

## 3) Estructura del repositorio

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

## 4) Mapa de rutas

Rutas principales:

- `/` (home en español)
- `/en/` (home en inglés)
- `/privacy/`
- `/terms/`
- `/en/privacy/`
- `/en/terms/`
- `/3-cuentos-para-dormir/` (landing SEO ES)
- `/en/3-minute-bedtime-stories/` (landing SEO EN)

Rutas de infraestructura:

- `/robots.txt` desde `src/pages/robots.txt.ts`
- `/sitemap.xml` desde `src/pages/sitemap.xml.ts` (apunta a `sitemap-index.xml`)
- `/lunytales-v2/` página de redirección a `/` para compatibilidad legacy

Descubrimiento por robots:

- En producción, `/robots.txt` permite rastreo completo (`Allow: /`).
- También expone el sitemap con `Sitemap: https://lunytales.com/sitemap.xml`.

## 5) Modelo de configuración

Archivo fuente único para configuración global:

- `src/config/site.ts`

Claves importantes:

- `IS_STAGING` derivado de `PUBLIC_IS_STAGING === "true"`.
- `SITE_CONFIG.origin` (`https://lunytales.com`).
- `SITE_CONFIG.hotmartUrlEs` (checkout en español).
- `SITE_CONFIG.hotmartUrlEn` (checkout en inglés).
- `SITE_CONFIG.paths.*` (rutas canónicas y assets clave).
- `SITE_CONFIG.trackingGate`.

Utilidad:

- `toHref(path)` normaliza enlaces internos (`""` -> `"./"`).

## 6) Arquitectura i18n

Archivos:

- `src/i18n/es.ts`
- `src/i18n/en.ts`
- `src/i18n/index.ts`

Guardrails:

- El build falla si se rompe la paridad de diccionarios ES/EN.
- La validación exige:
  - keys faltantes o extra,
  - tipos inconsistentes,
  - longitudes distintas en arrays,
  - keys distintas en objetos dentro de arrays.

## 7) SEO y datos estructurados

Generador SEO:

- `src/lib/seo.ts`

Define:

- canonical,
- hreflang alternates (`es`, `en`, `x-default`),
- metas OG/Twitter,
- meta robots según flag de staging.

Datos estructurados:

- Se generan en `src/lib/structured-data.ts`.
- Se inyectan en `src/layouts/SiteLayout.astro` como JSON-LD.
- Grafo actual: `Organization`, `WebSite`, `CreativeWorkSeries`.

Sitemaps:

- `@astrojs/sitemap` genera `sitemap-index.xml` + `sitemap-0.xml`.
- `astro.config.mjs` excluye la ruta legacy `/lunytales-v2/` del sitemap generado.
- `src/pages/sitemap.xml.ts` publica `/sitemap.xml` como entrypoint estable.

Punto de entrada público del sitemap:

- `https://lunytales.com/sitemap.xml` es el punto de entrada público que consumen los rastreadores.
- Ese endpoint apunta a `sitemap-index.xml`, que referencia `sitemap-0.xml` generado por `@astrojs/sitemap`.
- El sitemap generado solo incluye URLs canónicas e indexables.
- Las rutas legacy con redirección (por ejemplo `/lunytales-v2/`) se excluyen de forma intencional.

## 8) Estilos y orden de carga de Bootstrap

Archivo fuente para shell y orden de CSS:

- `src/layouts/SiteLayout.astro`

Orden actual en HTML generado:

1. Bootstrap local (`/_astro/bootstrap.min.*.css`)
2. Hoja personalizada (`/styles.css?...`)

Este orden es intencional para que `public/styles.css` sobrescriba estilos base de Bootstrap (por ejemplo, botones).

Bootstrap JS:

- Se carga localmente desde asset generado (`/_astro/bootstrap.bundle.min.*.js`).
- No quedan referencias a CDN de Bootstrap en source ni en build.

## 9) Tracking y consentimiento

Archivos:

- `public/assets/js/consent.js`
- `public/assets/js/tracking.js`

Comportamiento:

- Requiere consentimiento de cookies para activar tracking.
- Si `SITE_CONFIG.trackingGate` está activo, además requiere `?track=1`.

## 10) Pipeline de CI/CD

Workflow:

- `.github/workflows/deploy.yml`

Pasos:

1. Checkout
2. `npm ci`
3. `npm run build`
4. Verificación de artefactos requeridos
5. Smoke test contra salida estática en servidor local
6. Publicación de `dist/` en `gh-pages`

Cobertura actual de smoke tests:

- `/`, `/en/`, `/privacy/`, `/terms/`, `/en/privacy/`, `/en/terms/`
- `/sitemap.xml`, `/robots.txt`
- `/styles.css`
- `/assets/demo/demo.pdf`, `/assets/demo/demo_eng.pdf`

## 11) Estrategia de assets

- Los assets estáticos viven en `public/assets/...`.
- Hero por idioma:
  - ES: assets base
  - EN: `hero-title-en.svg`, `mascota-en.webp`
- PDFs demo:
  - ES: `assets/demo/demo.pdf`
  - EN: `assets/demo/demo_eng.pdf`
- Checkout por idioma:
  - ES: `SITE_CONFIG.hotmartUrlEs`
  - EN: `SITE_CONFIG.hotmartUrlEn`

## 12) Componentes compartidos clave

- `src/layouts/SiteLayout.astro`: shell global (head/nav/footer/cookies/tracking).
- `src/components/HomePage.astro`: estructura compartida del home.
- `src/components/StoriesCards.astro`: bloque reutilizable de cards de cuentos (permite ocultar/mostrar encabezado).

## 13) Guía de cambios

| Cambio requerido | Archivo(s) principal(es) |
| --- | --- |
| Origen canónico / flags globales | `src/config/site.ts` |
| Comportamiento SEO | `src/lib/seo.ts` |
| Datos estructurados | `src/lib/structured-data.ts` |
| Layout global/scripts | `src/layouts/SiteLayout.astro` |
| Presentación de home/cards SEO | `src/components/HomePage.astro`, `src/components/StoriesCards.astro` |
| Copy ES/EN | `src/i18n/es.ts`, `src/i18n/en.ts` |
| Estilo global | `public/styles.css` |
| Robots/sitemap | `src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts`, `astro.config.mjs` |
| Deploy y checks | `.github/workflows/deploy.yml` |

## 14) Checklist antes de release

- `npm run build` pasa.
- Validación de paridad i18n en verde.
- Sin cambios manuales en `dist/`.
- Sin dominios/rutas hardcodeados obsoletos.
- Sin referencias a Bootstrap CDN en source/build.
- Smoke tests de rutas/assets en verde.
- Canonical, hreflang, robots y sitemap correctos para producción.

## 15) Notas operativas

- Mantener mensajes de commit y comentarios técnicos en inglés profesional.
- Mantener commits atómicos y con Conventional Commits.
- Mantener `/lunytales-v2/` hasta migrar por completo los enlaces externos legacy.

## 16) Topología de hosting

Flujo de despliegue:

- Build de Astro → GitHub Actions → rama `gh-pages` → origen de GitHub Pages → caché edge de Cloudflare → usuario final
