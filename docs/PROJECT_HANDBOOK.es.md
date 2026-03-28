# Luny Tales Website — Manual del Proyecto

Este documento es la fuente técnica de verdad del repositorio `lunytales-website`.
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
- CI/CD: GitHub Actions (checks de CI) + despliegues en Cloudflare Pages.
- Hosting: Cloudflare Pages (producción desde `main`, previews desde ramas no-main).

## 2.1) Infraestructura Edge (Cloudflare)

Esta configuración es operativa (fuera del repositorio) y debe mantenerse:

- Tráfico del dominio proxyado por Cloudflare (proxy naranja activado).
- HTTPS forzado en el edge para todas las solicitudes.
- TLS y caché edge gestionados por Cloudflare delante del origen de Cloudflare Pages.

Nota de mapeo de dominio:

- `lunytales.com` está conectado como dominio personalizado en Cloudflare Pages.
- El DNS autoritativo se gestiona en Cloudflare.
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
- `/faq/`
- `/en/faq/`
- `/3-cuentos-para-dormir/` (landing SEO ES)
- `/en/3-minute-bedtime-stories/` (landing SEO EN)

Rutas de infraestructura:

- `/robots.txt` desde `src/pages/robots.txt.ts`
- `/sitemap.xml` desde `src/pages/sitemap.xml.ts` (apunta a `sitemap-index.xml`)
- `/lunytales-v2/` redirección legacy hacia `/` gestionada desde `public/_redirects`

Descubrimiento por robots:

- En producción, `/robots.txt` permite rastreo completo (`Allow: /`).
- También expone el sitemap con `Sitemap: https://lunytales.com/sitemap.xml`.

## 5) Modelo de configuración

Archivo fuente único para configuración global:

- `src/config/site.ts`

Claves importantes:

- `IS_STAGING` derivado de señales de entorno de staging/preview (`PUBLIC_IS_STAGING`, contexto preview).
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
6. Finalización de checks de CI (sin publicación a GitHub Pages)

Cobertura actual de smoke tests:

- `/`, `/en/`, `/privacy/`, `/terms/`, `/en/privacy/`, `/en/terms/`
- `/sitemap.xml`, `/robots.txt`
- `/styles.css`
- `/assets/demo/demo.pdf`, `/assets/demo/demo_eng.pdf`

## 11) Estrategia de assets

- Los assets estáticos viven en `public/assets/...`.
- El hero del home usa:
  - assets responsivos compartidos de mascota: `mascota-luny-512.webp`, `mascota-luny-640.webp`, `mascota-luny-768.webp`, `mascota-luny-1024.webp`
  - fondo compartido: `hero-bg.jpg`
  - arte de título por idioma: ES `logo2.svg`, EN `hero-title-en.svg`
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
- `src/components/FaqSection.astro`: sección FAQ compartida para ES/EN (TOC, anchors y acordeones).

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

- Build de Astro → pipeline de despliegue de Cloudflare Pages → origen de Cloudflare Pages → caché edge de Cloudflare → usuario final


## 17) Decisiones De Cleanup Post-Migración

- El cutover de hosting quedó completado: `https://lunytales.com` ahora corre en Cloudflare Pages.
- Se eliminó `public/CNAME` porque el dominio se administra directamente en Cloudflare Pages.
- `.github/workflows/deploy.yml` se mantiene para checks de CI, pero se retiró la publicación a GitHub Pages.
- `public/_redirects` se mantiene como fuente de verdad para redirecciones legacy (incluyendo `/lunytales-v2/`).


## 18) Actualizaciones FAQ y navegación (2026-03)

- FAQ movida fuera del home y consolidada como páginas dedicadas:
  - ES: `/faq/`
  - EN: `/en/faq/`
- El footer incluye enlace a FAQ por idioma (ES/EN).
- El header del home incluye FAQ como enlace de apoyo:
  - ES: `Preguntas frecuentes`
  - EN: `FAQ`
- Se refinaron copy, navegación interna por temas (anchors) y consistencia editorial ES/EN.
- Convención de nombre de skill en contenido:
  - ES: `Cuentos Luna`
  - EN: `Luny Tales`
- QA de ramas: usar siempre la URL estable de rama en Cloudflare Pages (`https://<rama-normalizada>.lunytales-website.pages.dev`) para revisión continua; evitar depender de URLs hash por deploy.

## 19) Hero FAQ y alineación visual (2026-03)

- El hero de FAQ se alineó con el lenguaje visual del hero actual del home:
  - mismo tratamiento de fondo
  - mismo enfoque de overlay/degradado
  - composición responsive ajustada para desktop/tablet/mobile
- Assets FAQ relevantes:
  - `public/assets/img/luny-faq.png`
  - `public/assets/img/hero-bg.jpg` (fondo compartido)

## 20) Hero principal y mantenibilidad frontend (2026-03)

- Hero del home actualizado con:
  - nuevo fondo visual
  - nuevo asset de Luny
  - overlay CSS para proteger legibilidad del bloque textual sin perder atmósfera.
- Cleanup técnico aprobado para mantenibilidad (rama `codex/frontend-cleanup`):
  - scope de estilos del hero del home para evitar bleed global
  - limpieza de assets no usados e imports muertos.
- Nota operativa: este cleanup está documentado como línea de mantenimiento y debe revisarse antes de su integración final si aún no está en `main`.


## 21) Endurecimiento de performance, accesibilidad y seguridad edge (2026-03-28)

Alcance implementado:

- Performance de home/hero:
  - Optimización de LCP centrada en la mascota del hero como `<img>`.
  - Entrega responsiva en WebP con prioridad de carga ajustada.
  - Se mantuvo el diseño visual del hero mientras se redujo transferencia innecesaria en mobile.
- Optimización de portadas de cuentos:
  - Se añadieron variantes responsivas para `timo`, `galen` y `lira`.
  - `src/components/StoriesCards.astro` usa `srcset`/`sizes` para evitar servir 1100px cuando no corresponde.
- Ajustes de accesibilidad:
  - Se mejoraron áreas táctiles en footer legal mobile y en el disparador de preferencias de cookies.
  - Se ajustó contraste del banner de cookies y jerarquía visual del nav responsive.

Operación en Cloudflare edge:

- Security headers gestionados en edge (Cloudflare), no en el código Astro:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Frame-Options: SAMEORIGIN`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- Se desactivó la inyección de contenido Managed en `robots.txt` de Cloudflare.
  - El `robots.txt` público quedó limpio y estándar (`User-agent`, `Allow`, `Sitemap`).

Limpieza de repositorio en esta ronda:

- Se eliminaron variantes huérfanas del hero que ya no tenían referencias en los templates:
  - `public/assets/img/mascota-512.webp`
  - `public/assets/img/mascota-768.webp`
  - `public/assets/img/mascota-1024.webp`
  - `public/assets/img/mascota-en-512.webp`
  - `public/assets/img/mascota-en-768.webp`
  - `public/assets/img/mascota-en-1024.webp`

Estado actual (snapshot):

- Security Headers reportado en revisión operativa: `A`.
- Lighthouse del home en rango alto tras este pase de performance (el valor exacto puede variar por corrida).

Decisiones y tradeoffs explícitos:

- `Content-Security-Policy` se pospone a una fase dedicada para evitar romper recursos de terceros en esta ronda.
- No se hizo refactor agresivo de CSS.
- El orden de CSS se mantiene estable (`bootstrap` primero, `styles.css` después) para preservar el estilo aprobado de CTA.
