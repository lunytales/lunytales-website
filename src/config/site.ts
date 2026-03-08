export const IS_STAGING =
  import.meta.env.PUBLIC_IS_STAGING === "true";

export const SITE_CONFIG = {
  origin: "https://lunytales.com",
  hotmartUrl: "https://pay.hotmart.com/H100949723W?off=94i6su53",
  paths: {
    home: "",
    homeEn: "en/",
    privacy: "privacy/",
    terms: "terms/",
    privacyEn: "en/privacy/",
    termsEn: "en/terms/",
    bedtimeStoriesEs: "3-cuentos-para-dormir/",
    bedtimeStoriesEn: "en/3-minute-bedtime-stories/",
    demoPdf: "assets/demo/demo.pdf",
    demoPdfEn: "assets/demo/demo_eng.pdf",
    ogImage: "assets/img/og-lunytales.jpg",
  },
  trackingGate: true,
} as const;

export const SITE_ORIGIN = SITE_CONFIG.origin;

export function toHref(path: string): string {
  return path === "" ? "./" : path;
}
