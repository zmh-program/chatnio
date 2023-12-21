import { ResolvedConfig } from "vite";
import path from "path";
import fs from "fs";
import {
  getFields,
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

    const fields = getFields(data);
    const migration = getMigration(data, translation, "");
    const total = migration.length;
    let current = 0;
    for (const key of migration) {
      const from = getTranslation(data, key);
      const to =
        typeof from === "string"
          ? await doTranslate(from, defaultDevLang, lang)
          : from;
      current++;

      console.log(
        `[i18n] successfully translated: ${from} -> ${to} (lang: ${defaultDevLang} -> ${lang}, progress: ${current}/${total})`,
      );
      setTranslation(translation, key, to);
    }

    if (migration.length > 0) {
      writeJSON(translation, source, file);
    }

    console.info(
      `translation file ${file} loaded, ${fields} fields detected, ${migration.length} migration(s) applied`,
    );
  }
}
