import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getMemory, setMemory } from "@/utils/memory.ts";
import cn from "@/resources/i18n/cn.json";
import en from "@/resources/i18n/en.json";
import ru from "@/resources/i18n/ru.json";
import ja from "@/resources/i18n/ja.json";
import tw from "@/resources/i18n/tw.json";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)

const resources = {
  cn: { translation: cn },
  en: { translation: en },
  ru: { translation: ru },
  ja: { translation: ja },
  tw: { translation: tw },
};

export const langsProps: Record<string, string> = {
  cn: "简体中文",
  en: "English",
  ru: "Русский",
  ja: "日本語",
  tw: "正體中文",
};

export const supportedLanguages = Object.keys(resources);
export const defaultLanguage = "cn";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })
  .then(() => console.debug(`[i18n] initialized (language: ${i18n.language})`));

export default i18n;

export function getLanguage(): string {
  const storage = getMemory("language");
  if (storage && supportedLanguages.includes(storage)) {
    return storage;
  }
  // get browser language
  const lang = navigator.language.split("-")[0];
  if (supportedLanguages.includes(lang)) {
    return lang;
  }
  return defaultLanguage;
}

export function setLanguage(i18n: any, lang: string): void {
  if (supportedLanguages.includes(lang)) {
    i18n
      .changeLanguage(lang)
      .then(() =>
        console.debug(`[i18n] language changed (language: ${i18n.language})`),
      );
    setMemory("language", lang);
    return;
  }
  console.warn(`[i18n] language ${lang} is not supported`);
}
