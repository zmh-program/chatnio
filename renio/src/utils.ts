import React, {useEffect} from "react";

export let mobile = (window.innerWidth <= 468 || window.innerHeight <= 468 || navigator.userAgent.includes("Mobile"));
export function useEffectAsync(effect: () => Promise<any>, deps?: any[]) {
    return useEffect(() => {
      effect()
        .catch((err) => console.debug("[runtime] error during use effect", err));
    }, deps);
}

export function useAnimation(ref: React.MutableRefObject<any>, cls: string, min?: number): (() => number) | undefined {
  if (!ref.current) return;
  const target = ref.current as HTMLButtonElement;
  const stamp = Date.now();
  target.classList.add(cls);

  return function () {
    const duration = Date.now() - stamp;
    const timeout = min ? Math.max(min - duration, 0) : 0;
    setTimeout(() => target.classList.remove(cls), timeout);
    return timeout;
  }
}

window.addEventListener("resize", () => {
  mobile = (window.innerWidth <= 468 || window.innerHeight <= 468 || navigator.userAgent.includes("Mobile"));
});
