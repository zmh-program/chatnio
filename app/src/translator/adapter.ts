// format language code to name/ISO 639-1 code map
const languageTranslatorMap: Record<string, string> = {
  cn: "zh-CN",
  en: "en",
  ru: "ru",
  ja: "ja",
  ko: "ko",
  fr: "fr",
  de: "de",
  es: "es",
  pt: "pt",
  it: "it",
};

export function getFormattedLanguage(lang: string): string {
  return languageTranslatorMap[lang.toLowerCase()] || lang;
}

type translationResponse = {
  responseData: {
    translatedText: string;
  };
};

async function translate(
  text: string,
  from: string,
  to: string,
): Promise<string> {
  if (from === to || text.length === 0) return text;
  const resp = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text,
    )}&langpair=${from}|${to}`,
  );
  const data: translationResponse = await resp.json();

  return data.responseData.translatedText;
}

export function doTranslate(
  content: string,
  from: string,
  to: string,
): Promise<string> {
  from = getFormattedLanguage(from);
  to = getFormattedLanguage(to);

  if (content.startsWith("!!")) content = content.substring(2);

  return translate(content, from, to);
}
