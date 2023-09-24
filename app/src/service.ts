// @ts-ignore
import { registerSW } from "virtual:pwa-register";

export const updateSW = registerSW({
  onRegisteredSW(url: string, registration: ServiceWorkerRegistration) {
    if (!(!registration.installing && navigator)) return;
    if ("connection" in navigator && !navigator.onLine) return;

    fetch(url, {
      headers: { "Service-Worker": "script", "Cache-Control": "no-cache" },
      cache: "no-store",
    }).then(async (resp) => {
      if (resp?.status === 200) {
        await registration.update();
        if (registration.onupdatefound) console.debug("update found");
      }
    });
  },
});
