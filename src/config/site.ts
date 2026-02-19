export const IS_STAGING =
  import.meta.env.PUBLIC_IS_STAGING === "true";

export const SITE_CONFIG = {
  baseUrls: {
    staging: "https://lunytales.com",
    production: "https://lunytales.com",
  },
  hotmartUrl: "https://pay.hotmart.com/H100949723W?off=94i6su53",
  paths: {
    home: "",
    homeEn: "en/",
    privacy: "privacy/",
    terms: "terms/",
    privacyEn: "en/privacy/",
    termsEn: "en/terms/",
    demoPdf: "assets/demo/demo.pdf",
    demoPdfEn: "assets/demo/demo_eng.pdf",
    ogImage: "assets/img/og-lunytales.jpg",
  },
  trackingGate: true,
} as const;

export const ACTIVE_BASE_URL = IS_STAGING
  ? SITE_CONFIG.baseUrls.staging
  : SITE_CONFIG.baseUrls.production;

export function toHref(path: string): string {
  return path === "" ? "./" : path;
}
