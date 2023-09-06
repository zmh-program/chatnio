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

export function useShared<T>(): { hook: (v: T) => void, useHook: () => Promise<T> } {
  let value: T | undefined = undefined;
  return {
    hook: (v: T) => {
      value = v;
    },
    useHook: () => {
      return new Promise<T>((resolve) => {
        if (value) return resolve(value);
        const interval = setInterval(() => {
          if (value) {
            clearInterval(interval);
            resolve(value);
          }
        }, 50);
      });
    }
  }
}

export function insert<T>(arr: T[], idx: number, value: T): T[] {
  return [...arr.slice(0, idx), value, ...arr.slice(idx)];
}

export function insertStart<T>(arr: T[], value: T): T[] {
  return [value, ...arr];
}

export function remove<T>(arr: T[], idx: number): T[] {
  return [...arr.slice(0, idx), ...arr.slice(idx + 1)];
}

export function replace<T>(arr: T[], idx: number, value: T): T[] {
  return [...arr.slice(0, idx), value, ...arr.slice(idx + 1)];
}

export function move<T>(arr: T[], from: number, to: number): T[] {
  const value = arr[from];
  return insert(remove(arr, from), to, value);
}

window.addEventListener("resize", () => {
  mobile = (window.innerWidth <= 468 || window.innerHeight <= 468 || navigator.userAgent.includes("Mobile"));
});
