import { en } from "./en";
import { es } from "./es";

export const LANGUAGES = ["es", "en"] as const;

export type Language = (typeof LANGUAGES)[number];
export type HomeStrings = typeof es;
export type HomeStringKey = keyof HomeStrings;
export const HOME_STRING_KEYS = Object.keys(es) as HomeStringKey[];

const MAX_PARITY_ERRORS = 25;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function valueType(value: unknown): string {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function appendError(errors: string[], message: string): void {
  if (errors.length < MAX_PARITY_ERRORS) {
    errors.push(message);
  }
}

function compareObjectKeys(
  esValue: Record<string, unknown>,
  enValue: Record<string, unknown>,
  path: string,
  errors: string[],
): void {
  const esKeys = Object.keys(esValue);
  const enKeys = Object.keys(enValue);

  const missingInEn = esKeys.filter((key) => !(key in enValue));
  if (missingInEn.length > 0) {
    appendError(
      errors,
      `${path}: missing keys in en -> ${missingInEn.join(", ")}`,
    );
  }

  const extraInEn = enKeys.filter((key) => !(key in esValue));
  if (extraInEn.length > 0) {
    appendError(
      errors,
      `${path}: unexpected keys in en -> ${extraInEn.join(", ")}`,
    );
  }
}

function compareDictionaryShape(
  esValue: unknown,
  enValue: unknown,
  path: string,
  errors: string[],
): void {
  if (Array.isArray(esValue)) {
    if (!Array.isArray(enValue)) {
      appendError(
        errors,
        `${path}: expected array in en, received ${valueType(enValue)}`,
      );
      return;
    }

    if (esValue.length !== enValue.length) {
      appendError(
        errors,
        `${path}: array length mismatch (es=${esValue.length}, en=${enValue.length})`,
      );
    }

    const itemCount = Math.min(esValue.length, enValue.length);
    for (let index = 0; index < itemCount; index += 1) {
      const esItem = esValue[index];
      const enItem = enValue[index];
      const itemPath = `${path}[${index}]`;

      if (isPlainObject(esItem) && isPlainObject(enItem)) {
        compareObjectKeys(esItem, enItem, itemPath, errors);
      }

      compareDictionaryShape(esItem, enItem, itemPath, errors);
    }

    return;
  }

  if (isPlainObject(esValue)) {
    if (!isPlainObject(enValue)) {
      appendError(
        errors,
        `${path}: expected object in en, received ${valueType(enValue)}`,
      );
      return;
    }

    compareObjectKeys(esValue, enValue, path, errors);

    for (const key of Object.keys(esValue)) {
      if (key in enValue) {
        const nestedPath = path ? `${path}.${key}` : key;
        compareDictionaryShape(esValue[key], enValue[key], nestedPath, errors);
      }
    }

    return;
  }

  if (valueType(esValue) !== valueType(enValue)) {
    appendError(
      errors,
      `${path}: type mismatch (es=${valueType(esValue)}, en=${valueType(enValue)})`,
    );
  }
}

function assertDictionaryParity(): void {
  const errors: string[] = [];
  compareDictionaryShape(es, en, "root", errors);

  if (errors.length > 0) {
    const truncated = errors.slice(0, MAX_PARITY_ERRORS);
    throw new Error(
      `[i18n] Dictionary parity check failed:\n- ${truncated.join("\n- ")}`,
    );
  }
}

assertDictionaryParity();

const dictionaries = {
  es,
  en,
} satisfies Record<Language, HomeStrings>;

export function getStrings(lang: Language): HomeStrings {
  return dictionaries[lang];
}
