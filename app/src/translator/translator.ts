import { ResolvedConfig } from "vite";
import path from "path";
import fs from "fs";
import {
  getMigration,
  getTranslation,
  readJSON,
  setTranslation,
  writeJSON,
} from "./io";
import { doTranslate } from "./adapter";

export const defaultDevLang = "cn";

export async function processTranslation(
  config: ResolvedConfig,
): Promise<void> {
  const source = path.resolve(config.root, "src/resources/i18n");
  const files = fs.readdirSync(source);

  const motherboard = `${defaultDevLang}.json`;

  if (files.length === 0) {
    console.warn("no translation files found");
    return;
  } else if (!files.includes(motherboard)) {
    console.warn(`no default translation file found (${defaultDevLang}.json)`);
    return;
  }

  const data = readJSON(source, motherboard);

  const target = files.filter((file) => file !== motherboard);
  for (const file of target) {
    const lang = file.split(".")[0];
    const translation = { ...readJSON(source, file) };

    const migration = getMigration(data, translation, "");
    for (const key of migration) {
      const from = getTranslation(data, key);
      const to =
        typeof from === "string"
          ? await doTranslate(from, defaultDevLang, lang)
          : from;

      console.log(
        `[i18n] successfully translated: ${from} -> ${to} (lang: ${defaultDevLang} -> ${lang})`,
      );
      setTranslation(translation, key, to);
    }

    if (migration.length > 0) {
      writeJSON(translation, source, file);
    }

    console.info(
      `translation file ${file} loaded, ${migration.length} migration(s) found.`,
    );
  }
}
