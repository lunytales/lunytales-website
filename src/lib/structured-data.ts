import { SITE_CONFIG, SITE_ORIGIN } from "../config/site";
import type { Language } from "../i18n";

type JsonLdNode = Record<string, unknown>;

type HomeStructuredDataParams = {
  lang: Language;
  pageUrl: string;
  description: string;
};

function resolveAbsoluteUrl(path: string): string {
  return new URL(path, `${SITE_ORIGIN}/`).toString();
}

function getAudienceByLanguage(lang: Language): Array<{ "@type": "PeopleAudience"; audienceType: string }> {
  if (lang === "en") {
    return [
      { "@type": "PeopleAudience", audienceType: "Children" },
      { "@type": "PeopleAudience", audienceType: "Families" },
    ];
  }

  return [
    { "@type": "PeopleAudience", audienceType: "Niños" },
    { "@type": "PeopleAudience", audienceType: "Familias" },
  ];
}

export function createHomeStructuredData(params: HomeStructuredDataParams): JsonLdNode {
  const ogImageUrl = resolveAbsoluteUrl(SITE_CONFIG.paths.ogImage);
  const inLanguage = params.lang;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Luny Tales",
        url: SITE_ORIGIN,
        logo: ogImageUrl,
      },
      {
        "@type": "WebSite",
        name: "Luny Tales",
        url: SITE_ORIGIN,
        inLanguage,
      },
      {
        "@type": "CreativeWorkSeries",
        name: "Luny Tales",
        description: params.description,
        brand: {
          "@type": "Brand",
          name: "Luny Tales",
        },
        url: params.pageUrl,
        image: ogImageUrl,
        audience: getAudienceByLanguage(params.lang),
        inLanguage,
      },
    ],
  };
}
