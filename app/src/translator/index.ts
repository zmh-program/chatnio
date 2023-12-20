import { Plugin } from "vite";
import path from "path";

export function createTranslationPlugin(): Plugin {
  return {
    name: "translate-plugin",
    apply: "build",
    configResolved(config) {
      const dir = path.resolve(config.root, "src");
    },
  };
}
