import React, { useEffect } from "react";
import {FileObject} from "./components/FileProvider.tsx";

export let mobile =
  window.innerWidth <= 468 ||
  window.innerHeight <= 468 ||
  navigator.userAgent.includes("Mobile");

window.addEventListener("resize", () => {
  mobile =
    window.innerWidth <= 468 ||
    window.innerHeight <= 468 ||
    navigator.userAgent.includes("Mobile");
});

export function useEffectAsync<T>(effect: () => Promise<T>, deps?: any[]) {
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

export async function copyClipboard(text: string) {
  if (!navigator.clipboard) {
    const input = document.createElement("input");
    input.value = text;
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    return;
  }
  await navigator.clipboard.writeText(text);
}

export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const obj: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }
  return obj;
}

export function getQueryParam(key: string): string {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) || "";
}

export function saveAsFile(filename: string, content: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content]));
  a.download = filename;
  a.click();
}

export function replaceInputValue(
  input: HTMLInputElement | undefined,
  value: string,
) {
  return input && (input.value = value);
}

export function useInputValue(id: string, value: string) {
  const input = document.getElementById(id) as HTMLInputElement | undefined;
  return input && replaceInputValue(input, value) && input.focus();
}

export function testNumberInputEvent(e: any): boolean {
  if (
    /^[0-9]+$/.test(e.key) ||
    ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    return true;
  }
  e.preventDefault();
  return false;
}

export function formatMessage(file: FileObject, message: string): string {
  message = message.trim();
  if (file.name.length > 0 || file.content.length > 0) {
    return `
:::file
[[${file.name}]]
${file.content}
:::

${message}`;
  } else {
    return message;
  }
}
