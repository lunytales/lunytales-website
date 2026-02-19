# Luny Tales v2 — Manual del Proyecto

Este documento es la fuente técnica de verdad para el repositorio `lunytales-v2`.
Está pensado para cualquier persona del equipo que necesite mantener, extender o migrar el proyecto.

## 1) Alcance del proyecto

- Producto: sitio web de Luny Tales (español + inglés) construido con Astro.
- Objetivo de despliegue: `https://lunytales.com` (dominio raíz).
- Arquitectura actual: generación estática (`output: "static"`).
- Regla clave: no editar `dist/` manualmente (solo salida de build).

## 2) Stack tecnológico

- Runtime: Node.js (CI usa Node 20).
- Framework: Astro `^5.17.1`.
- Estilos: CSS global en `public/styles.css` + Bootstrap 5 (CDN).
- Scripts de cliente: JavaScript vanilla en `public/assets/js/`.
- CI/CD: GitHub Actions + `peaceiris/actions-gh-pages`.
- Hosting: GitHub Pages con dominio personalizado (`public/CNAME`).

## 3) Estructura del repositorio

```
.
├── .github/workflows/deploy.yml
├── astro.config.mjs
├── public/
│   ├── CNAME
│   ├── sitemap.xml
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
│   ├── config/
│   ├── i18n/
│   ├── layouts/
│   ├── lib/
│   └── pages/
└── README.md
```

### Carpetas importantes

- `src/pages/`: definición de rutas.
- `src/layouts/SiteLayout.astro`: shell compartido (head, nav, footer, banner de cookies, scripts).
- `src/components/HomePage.astro`: markup compartido del home ES/EN.
- `src/i18n/`: diccionarios + validación estricta de paridad.
- `src/config/site.ts`: configuración global del proyecto (origin, paths, flags).
- `src/lib/seo.ts`: generación de canonical/hreflang/og/twitter.
- `public/`: assets estáticos copiados tal cual al build.

## 4) Mapa de rutas

- `/` → home en español.
- `/en/` → home en inglés.
- `/privacy/` → privacidad en español.
- `/terms/` → términos en español.
- `/en/privacy/` → privacidad en inglés.
- `/en/terms/` → términos en inglés.
- `/robots.txt` → generado por `src/pages/robots.txt.ts`.
- `/sitemap.xml` → archivo estático desde `public/sitemap.xml`.
- `/lunytales-v2/` → redirección a `/` (compatibilidad con la URL legacy de project page).

## 5) Modelo de configuración

Archivo único: `src/config/site.ts`.

### Claves actuales

- `IS_STAGING`: derivado de `PUBLIC_IS_STAGING === "true"`.
- `SITE_CONFIG.origin`: origen canónico (`https://lunytales.com`).
- `SITE_CONFIG.hotmartUrl`: URL de checkout.
- `SITE_CONFIG.paths.*`: rutas y paths de assets.
- `SITE_CONFIG.trackingGate`: controla el gate de tracking.
- `toHref(path)`: normaliza la generación de href internos.

### Variable de entorno

- `PUBLIC_IS_STAGING`
  - `true`: comportamiento SEO de staging (`noindex` + `disallow` en robots).
  - ausente/false: comportamiento SEO de producción (`index` + `allow` en robots).
  - valor por defecto: seguro para producción (false si falta).

## 6) Arquitectura i18n

Archivos:

- `src/i18n/es.ts`
- `src/i18n/en.ts`
- `src/i18n/index.ts`

Reglas:

- Los diccionarios EN y ES deben mantenerse en paridad.
- El build falla si:
  - falta cualquier key,
  - existe una key inesperada,
  - difieren los tipos de valor,
  - difiere el largo de arrays,
  - difieren las keys de objetos dentro de arrays.

Este guardrail se aplica en `assertDictionaryParity()` y corre durante import/build.

## 7) SEO e indexación

Generador central: `src/lib/seo.ts`.

Define:

- `canonical`
- `alternate` hreflang (`es`, `en`, `x-default`)
- Open Graph (`og:title`, `og:description`, `og:url`, `og:image`)
- Twitter cards
- `robots` meta (`index,follow` o `noindex,nofollow`)

Política de robots:

- Servida por `src/pages/robots.txt.ts`.
- También depende de `IS_STAGING`.
- Incluye `Sitemap: https://lunytales.com/sitemap.xml`.

Sitemap:

- Archivo estático `public/sitemap.xml`.
- Debe incluir solo rutas canónicas vivas, salvo expansión intencional.

## 8) Tracking y consentimiento

Archivos:

- `public/assets/js/consent.js`
- `public/assets/js/tracking.js`

Comportamiento:

- Se requiere consentimiento de cookies (`accepted`) para cargar tracking.
- Si `SITE_CONFIG.trackingGate` es `true`, además se exige `?track=1`.
- Meta Pixel y listeners custom se cargan dinámicamente solo cuando corresponde.

Esto evita tracking accidental en contextos restringidos o de staging.

## 9) Pipeline de CI/CD

Workflow: `.github/workflows/deploy.yml`

Pasos:

1. Checkout.
2. Instalación de dependencias (`npm ci`).
3. Build (`npm run build`).
4. Verificación de archivos requeridos en build.
5. Smoke tests locales contra output estático (checks HTTP 200).
6. Publicación de `dist/` en `gh-pages` con historial huérfano.

### Cobertura actual de smoke tests (debe seguir en verde)

Rutas:

- `/`
- `/en/`
- `/privacy/`
- `/terms/`
- `/en/privacy/`
- `/en/terms/`
- `/sitemap.xml`
- `/robots.txt`

Assets críticos:

- `/styles.css`
- `/assets/demo/demo.pdf`
- `/assets/demo/demo_eng.pdf`

## 10) Estrategia de assets

- Los assets estáticos viven en `public/assets/...`.
- Referenciar assets con paths compatibles con la estrategia actual de `<base>`.
- Mantener assets de hero separados por idioma:
  - ES usa assets del hero en español.
  - EN usa assets del hero en inglés.
- PDFs demo:
  - ES: `assets/demo/demo.pdf`
  - EN: `assets/demo/demo_eng.pdf`

## 11) Flujo de desarrollo

Local:

```bash
npm ci
npm run dev
```

Validación de build:

```bash
npm run build
npm run preview
```

### Convenciones no negociables

- Usar Conventional Commits.
- Mantener commits atómicos (un objetivo por commit).
- No editar `dist/` manualmente.
- Mantener docs/comentarios técnicos/mensajes de commit en inglés.
- Centralizar constantes de configuración (`src/config/site.ts`).
- No introducir fallbacks silenciosos en i18n.

## 12) Guía rápida de cambios (dónde editar)

| Cambio requerido | Archivo(s) a editar |
| --- | --- |
| Dominio/origen/base canónica | `src/config/site.ts` |
| Reglas SEO/meta | `src/lib/seo.ts` |
| Rutas o páginas nuevas | `src/pages/` |
| Estructura compartida del home | `src/components/HomePage.astro` |
| Shell global (nav/footer/scripts) | `src/layouts/SiteLayout.astro` |
| Copy ES/EN | `src/i18n/es.ts`, `src/i18n/en.ts` |
| Comportamiento de tracking | `public/assets/js/consent.js`, `public/assets/js/tracking.js` |
| Estilos | `public/styles.css` |
| Deploy/smoke checks | `.github/workflows/deploy.yml` |
| URLs del sitemap | `public/sitemap.xml` |
| Dominio personalizado | `public/CNAME` |

## 13) Notas de migración (si se cambia de servicio)

Si se migra a otro proveedor:

1. Preservar `SITE_CONFIG.origin` y actualizarlo primero.
2. Mantener validación de canonical/hreflang/robots en entorno staging.
3. Replicar smoke tests actuales (rutas + assets críticos).
4. Preservar comportamiento de rutas estáticas y trailing slashes.
5. Mantener `/lunytales-v2/` hasta migrar enlaces externos legacy.

Secuencia recomendada:

- Infra primero (dominio + SSL + caché),
- luego pipeline de deploy,
- luego corte de DNS,
- y finalmente validación post-corte de SEO/tracking.

## 14) Checklist operativo previo a release

- `npm run build` pasa localmente.
- La paridad i18n está en verde.
- Las rutas/assets de smoke test responden 200.
- Canonical y hreflang apuntan a URLs de producción esperadas.
- `robots.txt` y `meta robots` coinciden con el entorno deseado.
- No hay cambios manuales en `dist/`.
- No hay secretos/tokens en archivos del repo.

## 15) Nota de mantenimiento

- Este archivo debe actualizarse cuando cambie:
  - el esquema de configuración,
  - el mapa de rutas,
  - los checks del workflow,
  - el comportamiento de tracking/SEO/i18n.

Mantener este manual actualizado forma parte de la definición de terminado para cambios de arquitectura/infra/contenido.
