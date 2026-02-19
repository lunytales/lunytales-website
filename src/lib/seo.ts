import { IS_STAGING, SITE_CONFIG, SITE_ORIGIN } from "../config/site";

type SeoPage = "home" | "homeEn" | "privacy" | "privacyEn" | "terms" | "termsEn";

type SeoMetaInput = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
};

type AlternateLink = {
  hreflang: string;
  href: string;
};

type OpenGraphImage = {
  url: string;
  type: "image/png" | "image/webp" | "image/jpeg";
  width?: number;
  height?: number;
};

export type SeoMeta = {
  title: string;
  description: string;
  robots?: string;
  canonical: string;
  alternates: AlternateLink[];
  og: {
    title: string;
    description: string;
    url: string;
    type: "website";
    images: OpenGraphImage[];
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    image: string;
  };
};

type CreateSeoParams = {
  page: SeoPage;
  meta: SeoMetaInput;
  baseHref: string;
};

const PAGE_PATHS: Record<SeoPage, string> = {
  home: SITE_CONFIG.paths.home,
  homeEn: SITE_CONFIG.paths.homeEn,
  privacy: SITE_CONFIG.paths.privacy,
  privacyEn: SITE_CONFIG.paths.privacyEn,
  terms: SITE_CONFIG.paths.terms,
  termsEn: SITE_CONFIG.paths.termsEn,
};

const ALTERNATE_PAGE_GROUPS: Record<SeoPage, { es: SeoPage; en: SeoPage }> = {
  home: { es: "home", en: "homeEn" },
  homeEn: { es: "home", en: "homeEn" },
  privacy: { es: "privacy", en: "privacyEn" },
  privacyEn: { es: "privacy", en: "privacyEn" },
  terms: { es: "terms", en: "termsEn" },
  termsEn: { es: "terms", en: "termsEn" },
};

function normalizeBase(baseHref: string): string {
  return baseHref.endsWith("/") ? baseHref : `${baseHref}/`;
}

function resolveUrl(siteUrl: URL, baseHref: string, path: string): string {
  return new URL(`${normalizeBase(baseHref)}${path}`, siteUrl).href;
}

function resolveSiteUrl(): URL {
  return new URL(SITE_ORIGIN);
}

export function createSeo(params: CreateSeoParams): SeoMeta {
  const siteUrl = resolveSiteUrl();
  const canonical = resolveUrl(siteUrl, params.baseHref, PAGE_PATHS[params.page]);

  const alternatePages = ALTERNATE_PAGE_GROUPS[params.page];
  const alternateEsUrl = resolveUrl(siteUrl, params.baseHref, PAGE_PATHS[alternatePages.es]);
  const alternateEnUrl = resolveUrl(siteUrl, params.baseHref, PAGE_PATHS[alternatePages.en]);
  const alternates = [
    { hreflang: "es", href: alternateEsUrl },
    { hreflang: "en", href: alternateEnUrl },
    { hreflang: "x-default", href: alternateEsUrl },
  ];

  const ogImage = resolveUrl(siteUrl, params.baseHref, SITE_CONFIG.paths.ogImage);

  return {
    title: params.meta.title,
    description: params.meta.description,
    robots: IS_STAGING ? "noindex,nofollow" : "index,follow",
    canonical,
    alternates,
    og: {
      title: params.meta.ogTitle ?? params.meta.title,
      description: params.meta.ogDescription ?? params.meta.description,
      url: canonical,
      type: "website",
      images: [
        {
          url: ogImage,
          type: "image/jpeg",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: params.meta.twitterTitle ?? params.meta.title,
      description: params.meta.twitterDescription ?? params.meta.description,
      image: ogImage,
    },
  };
}
