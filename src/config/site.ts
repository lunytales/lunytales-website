export const SITE_CONFIG = {
  baseUrls: {
    staging: "https://lunytales.com",
    production: "https://lunytales.com",
  },
  environment: (import.meta.env.PUBLIC_SITE_ENV === "production" ? "production" : "staging") as "staging" | "production",
  email: "hola@lunytales.com",
  hotmartUrl: "https://pay.hotmart.com/H100949723W?off=94i6su53",
  paths: {
    home: "",
    homeEn: "en/",
    privacy: "privacy/",
    terms: "terms/",
    demoPdf: "assets/demo/demo.pdf",
    ogImagePng: "assets/img/og-lunytales.png",
    ogImageWebp: "assets/img/og-lunytales.webp",
  },
  flags: {
    noindex: true,
    trackingGate: true,
  },
} as const;

export const ACTIVE_BASE_URL = SITE_CONFIG.baseUrls[SITE_CONFIG.environment];

export function toHref(path: string): string {
  return path === "" ? "./" : path;
}
