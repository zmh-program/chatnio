// @ts-ignore
import { registerSW } from "virtual:pwa-register";
import { version } from "./conf.ts";

export const updateSW = registerSW({
  onRegisteredSW(url: string, registration: ServiceWorkerRegistration) {
    if (!(!registration.installing && navigator)) return;
    if ("connection" in navigator && !navigator.onLine) return;

    console.debug(
      "[service] checking for update (current version: %s)",
      version,
    );
    fetch(url, {
      headers: { "Service-Worker": "script", "Cache-Control": "no-cache" },
      cache: "no-store",
    }).then(async (resp) => {
      if (resp?.status === 200) {
        await registration.update();
        if (registration.onupdatefound) console.debug("[service] update found");
      }
    });
  },
});
