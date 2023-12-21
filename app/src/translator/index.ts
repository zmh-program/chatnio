import { Plugin } from "vite";
import path from "path";
import * as fs from "fs";

const defaultDevLang = "cn";

function readJSON(...paths: string[]): any {
  return JSON.parse(fs.readFileSync(path.resolve(...paths)).toString());
}

export function createTranslationPlugin(): Plugin {
  return {
    name: "translate-plugin",
    apply: "build",
    configResolved(config) {
      try {
        const source = path.resolve(config.root, "src/resources/i18n");
        const files = fs.readdirSync(source);

        const motherboard = `${defaultDevLang}.json`;

        console.log(files.includes(`${defaultDevLang}.json`))
        if (files.length === 0) {
          console.warn("no translation files found");
          return;
        } else if (!files.includes(motherboard)) {
          console.warn(`no default translation file found (${defaultDevLang}.json)`);
          return;
        }

        const data = readJSON(source, motherboard);

        files.forEach((file) => {
          if (file === motherboard) return;
          const lang = file.split(".")[0];
          const translation = readJSON(source, file);
          console.log(`translation file ${file} loaded`);
        });
      } catch (e) {
        console.warn(`error during translation: ${e}`);
      }
    },
  };
}
