import router from "@/router.tsx";
import { useDeeptrain } from "@/conf/env.ts";
import { goDeepLogin } from "@/conf/deeptrain.tsx";

export let event: BeforeInstallPromptEvent | undefined;

window.addEventListener("beforeinstallprompt", (e: Event) => {
  console.debug(`[service] catch event from app install prompt`);
  event = e as BeforeInstallPromptEvent;
});

export function triggerInstallApp() {
  /**
   * Trigger install app prompt
   * Warning: this is a browser experimental feature, it may not work on some browsers
   * @see https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
   *
   * @example
   * triggerInstallApp();
   */
  if (!event) return;
  try {
    event.prompt();
    event.userChoice.then((choice: any) => {
      console.debug(`[service] installed app (status: ${choice.outcome})`);
    });
  } catch (err) {
    console.debug("[service] install app error", err);
  }

  event = undefined;
}

export function getMemoryPerformance(): number {
  /**
   * Get memory performance
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory
   *
   * @example
   * getMemoryPerformance();
   */

  if (!performance || !performance.memory) return NaN;
  return performance.memory.usedJSHeapSize / 1024 / 1024;
}

export function navigate(path: string): void {
  router
    .navigate(path)
    .then(() => console.debug(`[service] navigate to ${path}`))
    .catch((err) => console.debug(`[service] navigate error`, err));
}

export function goAuth(): void {
  useDeeptrain ? goDeepLogin() : navigate("/login");
}
