import React, { useEffect } from "react";

export function useEffectAsync<T>(effect: () => Promise<T>, deps?: any[]) {
  /**
   * useEffect with async/await support
   *
   * @example
   * useEffectAsync(async () => {
   *    const result = await fetch("https://api.example.com");
   *    console.debug(result);
   *  }, []);
   */

  return useEffect(() => {
    effect().catch((err) =>
      console.debug("[runtime] error during use effect", err),
    );
  }, deps);
}

export function useAnimation(
  ref: React.MutableRefObject<any>,
  cls: string,
  min?: number,
): (() => number) | undefined {
  /**
   * Add animation class to react ref element and remove it after min ms when returned function is called
   *
   * @example
   * const animation = useAnimation(ref, "animate", 1000);
   * axios.get("https://api.example.com")
   *  .finally(() => animation());
   */
  if (!ref.current) return;
  const target = ref.current as HTMLButtonElement;
  const stamp = Date.now();
  target.classList.add(cls);

  return function () {
    const duration = Date.now() - stamp;
    const timeout = min ? Math.max(min - duration, 0) : 0;
    setTimeout(() => target.classList.remove(cls), timeout);
    return timeout;
  };
}

export function useTemporaryState(interval?: number): {
  state: boolean;
  triggerState: () => void;
} {
  const [stamp, setStamp] = React.useState<number>(0);
  const triggerState = () => setStamp(new Date().getTime());

  return {
    state: Date.now() - stamp < (interval ?? 3000),
    triggerState,
  };
}
