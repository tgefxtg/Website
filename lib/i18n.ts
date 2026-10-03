export const locales = {
  en: { direction: "ltr", label: "English" },
  ar: { direction: "rtl", label: "العربية" },
} as const;
export type Locale = keyof typeof locales;
// Enable Arabic routing only after a verified translation of the interface is supplied.
export const activeLocale: Locale = "en";
