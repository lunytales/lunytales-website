import { ACTIVE_BASE_URL, IS_STAGING, SITE_CONFIG } from "../config/site";
import type { Language } from "../i18n";

type SeoPage = "home" | "homeEn" | "privacy" | "terms";

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
  type: "image/png" | "image/webp";
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
  lang: Language;
  page: SeoPage;
  meta: SeoMetaInput;
  baseHref: string;
  siteUrl?: URL;
};

const PAGE_PATHS: Record<SeoPage, string> = {
  home: SITE_CONFIG.paths.home,
  homeEn: SITE_CONFIG.paths.homeEn,
  privacy: SITE_CONFIG.paths.privacy,
  terms: SITE_CONFIG.paths.terms,
};

function normalizeBase(baseHref: string): string {
  return baseHref.endsWith("/") ? baseHref : `${baseHref}/`;
}

function resolveUrl(siteUrl: URL, baseHref: string, path: string): string {
  return new URL(`${normalizeBase(baseHref)}${path}`, siteUrl).href;
}

function resolveSiteUrl(siteUrl?: URL): URL {
  return siteUrl ?? new URL(ACTIVE_BASE_URL);
}

export function createSeo(params: CreateSeoParams): SeoMeta {
  const siteUrl = resolveSiteUrl(params.siteUrl);
  const canonical = resolveUrl(siteUrl, params.baseHref, PAGE_PATHS[params.page]);

  const homeEsUrl = resolveUrl(siteUrl, params.baseHref, SITE_CONFIG.paths.home);
  const homeEnUrl = resolveUrl(siteUrl, params.baseHref, SITE_CONFIG.paths.homeEn);
  const alternates =
    params.page === "home" || params.page === "homeEn"
      ? [
          { hreflang: "es", href: homeEsUrl },
          { hreflang: "en", href: homeEnUrl },
          { hreflang: "x-default", href: homeEsUrl },
        ]
      : [];

  const ogImagePng = resolveUrl(siteUrl, params.baseHref, SITE_CONFIG.paths.ogImagePng);
  const ogImageWebp = resolveUrl(siteUrl, params.baseHref, SITE_CONFIG.paths.ogImageWebp);

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
          url: ogImagePng,
          type: "image/png",
          width: 1200,
          height: 630,
        },
        {
          url: ogImageWebp,
          type: "image/webp",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: params.meta.twitterTitle ?? params.meta.title,
      description: params.meta.twitterDescription ?? params.meta.description,
      image: ogImagePng,
    },
  };
}
