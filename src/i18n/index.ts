import { en } from "./en";
import { es } from "./es";

export const LANGUAGES = ["es", "en"] as const;

export type Language = (typeof LANGUAGES)[number];
export type HomeStrings = typeof es;
export type HomeStringKey = keyof HomeStrings;
export const HOME_STRING_KEYS = Object.keys(es) as HomeStringKey[];

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenKeys(item, `${prefix}[${index}]`));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      return flattenKeys(nested, next);
    });
  }

  return [prefix];
}

function normalizeKeyPath(path: string): string {
  return path.replace(/\[\d+\]/g, "[]");
}

function assertDictionaryCompleteness(): void {
  const esKeys = flattenKeys(es).map(normalizeKeyPath);
  const enKeys = flattenKeys(en).map(normalizeKeyPath);

  const missingInEn = esKeys.filter((key) => !enKeys.includes(key));
  if (missingInEn.length > 0) {
    throw new Error(
      `[i18n] Missing keys in en dictionary: ${missingInEn.join(", ")}`,
    );
  }
}

assertDictionaryCompleteness();

const dictionaries: Record<Language, DeepPartial<HomeStrings>> = {
  es,
  en,
};

function mergeWithFallback<T>(fallback: T, partial: DeepPartial<T> | undefined): T {
  if (Array.isArray(fallback)) {
    const source = Array.isArray(partial) ? partial : [];
    return fallback.map((item, index) => {
      return mergeWithFallback(item, source[index] as DeepPartial<typeof item> | undefined);
    }) as T;
  }

  if (fallback && typeof fallback === "object") {
    const source = partial && typeof partial === "object" ? partial : ({} as DeepPartial<T>);
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(fallback as Record<string, unknown>)) {
      result[key] = mergeWithFallback(
        (fallback as Record<string, unknown>)[key],
        (source as Record<string, unknown>)[key] as DeepPartial<unknown> | undefined,
      );
    }

    return result as T;
  }

  return (partial === undefined ? fallback : (partial as T));
}

export function getStrings(lang: Language): HomeStrings {
  return mergeWithFallback(es, dictionaries[lang]);
}
