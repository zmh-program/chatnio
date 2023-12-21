import { Plugin, ResolvedConfig } from "vite";
import { processTranslation } from "./translator";

export function createTranslationPlugin(): Plugin {
  return {
    name: "translate-plugin",
    apply: "build",
    async configResolved(config: ResolvedConfig) {
      try {
        console.info("[i18n] start translation process");
        await processTranslation(config);
      } catch (e) {
        console.warn(`error during translation: ${e}`);
      } finally {
        console.info("[i18n] translation process finished");
      }
    },
  };
}
