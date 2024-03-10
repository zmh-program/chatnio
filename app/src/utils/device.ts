import { useEffect, useState } from "react";
import { addEventListeners } from "@/utils/dom.ts";

export let mobile = isMobile();

window.addEventListener("resize", () => {
  mobile = isMobile();
});

export function isMobile(): boolean {
  return (
    (document.documentElement.clientWidth || window.innerWidth) <= 668 ||
    (document.documentElement.clientHeight || window.innerHeight) <= 468 ||
    navigator.userAgent.includes("Mobile")
  );
}

export function useMobile(): boolean {
  const [mobile, setMobile] = useState<boolean>(isMobile);

  useEffect(() => {
    const handler = () => setMobile(isMobile);

    return addEventListeners(
      window,
      [
        "resize",
        "orientationchange",
        "touchstart",
        "touchmove",
        "touchend",
        "touchcancel",
        "gesturestart",
        "gesturechange",
        "gestureend",
      ],
      handler,
    );
  }, []);

  return mobile;
}

export function openWindow(url: string, target?: string): void {
  /**
   * Open a new window with the given URL.
   * If the device does not support opening a new window, the URL will be opened in the current window.
   * @param url The URL to open.
   * @param target The target of the URL.
   */

  if (mobile) {
    window.location.href = url;
  } else {
    window.open(url, target);
  }
}
