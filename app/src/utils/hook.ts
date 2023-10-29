import React, { useEffect } from "react";

export function useEffectAsync<T>(effect: () => Promise<T>, deps?: any[]) {
  /**
   * useEffect with async/await support
   *
   * @example
   * useEffectAsync(async () => {
   *    const result = await fetch("https://api.example.com");
   *    console.log(result);
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

export function useShared<T>(): {
  hook: (v: T) => void;
  useHook: () => Promise<T>;
} {
  /**
   * Share value between components, useful for sharing data between components / redux dispatches
   *
   * @example
   *
   * const dispatch = useDispatch();
   * const { hook, useHook } = useShared<string>();
   *
   * dispatch(updateMigration({ hook }));
   * const response = await useHook();
   */
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
    },
  };
}
