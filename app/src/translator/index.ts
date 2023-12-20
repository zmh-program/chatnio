import { Plugin } from "vite";
import path from "path";
import * as fs from "fs";

export function createTranslationPlugin(): Plugin {
  return {
    name: "translate-plugin",
    apply: "build",
    configResolved(config) {
      const source = path.resolve(config.root, "src/resources/i18n");

      const files = fs.readdirSync(source);
      console.log(files);
    },
  };
}
