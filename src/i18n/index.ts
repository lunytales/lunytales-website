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
