function normalizeEnvValue(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "").toLowerCase();
}

const PUBLIC_DEPLOY_ENV = normalizeEnvValue(import.meta.env.PUBLIC_DEPLOY_ENV);
const IS_EXPLICIT_STAGING = normalizeEnvValue(import.meta.env.PUBLIC_IS_STAGING) === "true";
const IS_PREVIEW_DEPLOY_ENV = PUBLIC_DEPLOY_ENV === "preview" || PUBLIC_DEPLOY_ENV === "staging";

const CF_PAGES_FLAG = normalizeEnvValue(process.env.CF_PAGES);
const CF_PAGES_BRANCH = normalizeEnvValue(process.env.CF_PAGES_BRANCH);
const IS_CLOUDFLARE_PREVIEW =
  (CF_PAGES_FLAG === "1" || CF_PAGES_FLAG === "true") &&
  CF_PAGES_BRANCH !== "" &&
  CF_PAGES_BRANCH !== "main";

export const IS_STAGING = IS_EXPLICIT_STAGING || IS_PREVIEW_DEPLOY_ENV || IS_CLOUDFLARE_PREVIEW;

export const SITE_CONFIG = {
  origin: "https://lunytales.com",
  hotmartUrlEs: "https://pay.hotmart.com/H100949723W?off=94i6su53",
  hotmartUrlEn: "https://pay.hotmart.com/K104828315K",
  paths: {
    home: "",
    homeEn: "en/",
    privacy: "privacy/",
    terms: "terms/",
    faq: "faq/",
    privacyEn: "en/privacy/",
    termsEn: "en/terms/",
    faqEn: "en/faq/",
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
