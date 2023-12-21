import { Plugin, ResolvedConfig } from "vite";
import { processTranslation } from "./translator";

export function createTranslationPlugin(): Plugin {
  return {
    name: "translate-plugin",
    apply: "build",
    async configResolved(config: ResolvedConfig) {
      try {
        await processTranslation(config);
      } catch (e) {
        console.warn(`error during translation: ${e}`);
      }
    },
  };
}
