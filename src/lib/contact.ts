import type { Language } from "../i18n";

const MAIL_SUBJECT: Record<Language, string> = {
  es: "Contacto — Luny Tales",
  en: "Contact — Luny Tales",
};

const MAIL_BODY: Record<Language, string> = {
  es: "Hola Luny Tales,\r\n\r\n",
  en: "Hello Luny Tales,\r\n\r\n",
};

export function createContactMailto(email: string, lang: Language): string {
  const params = new URLSearchParams({
    subject: MAIL_SUBJECT[lang],
    body: MAIL_BODY[lang],
  });

  return `mailto:${email}?${params.toString()}`;
}
