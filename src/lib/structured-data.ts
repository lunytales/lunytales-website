import { SITE_CONFIG, SITE_ORIGIN } from "../config/site";
import type { Language } from "../i18n";

export type JsonLdNode = Record<string, unknown>;

type HomeStructuredDataParams = {
  lang: Language;
  pageUrl: string;
  description: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pruneUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map(pruneUndefined)
      .filter((entry) => entry !== undefined);
  }

  if (isRecord(value)) {
    const cleanedEntries = Object.entries(value)
      .map(([key, entry]) => [key, pruneUndefined(entry)] as const)
      .filter(([, entry]) => entry !== undefined);

    return Object.fromEntries(cleanedEntries);
  }

  return value;
}

function sanitizeJsonLdNode(node: JsonLdNode): JsonLdNode {
  const sanitized = pruneUndefined(node);
  return isRecord(sanitized) ? sanitized : {};
}

export function normalizeStructuredData(
  structuredData?: JsonLdNode | Array<JsonLdNode>,
): Array<JsonLdNode> {
  if (!structuredData) {
    return [];
  }

  const nodes = Array.isArray(structuredData) ? structuredData : [structuredData];
  const uniqueNodes: Array<JsonLdNode> = [];
  const seen = new Set<string>();

  for (const node of nodes) {
    const sanitizedNode = sanitizeJsonLdNode(node);
    if (Object.keys(sanitizedNode).length === 0) {
      continue;
    }

    const serialized = JSON.stringify(sanitizedNode);
    if (seen.has(serialized)) {
      continue;
    }

    seen.add(serialized);
    uniqueNodes.push(sanitizedNode);
  }

  return uniqueNodes;
}

export function serializeStructuredData(node: JsonLdNode): string {
  return JSON.stringify(sanitizeJsonLdNode(node))
    .replace(/</g, "\\u003c")
    .replace(/-->/g, "--\\>");
}

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

  return sanitizeJsonLdNode({
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
        publisher: {
          "@type": "Organization",
          name: "Luny Tales",
          url: SITE_ORIGIN,
        },
        url: params.pageUrl,
        image: ogImageUrl,
        audience: getAudienceByLanguage(params.lang),
        inLanguage,
      },
    ],
  });
}
