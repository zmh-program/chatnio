import React from "react";

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

export function asyncCaller<T>(fn: (...args: any[]) => Promise<T>) {
  let promise: Promise<T> | undefined;
  return (...args: any[]) => {
    if (!promise) promise = fn(...args);
    return promise;
  };
}

export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

export function average(arr: number[]): number {
  return sum(arr) / arr.length;
}

export function getUniqueList<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function getNumber(value: string, supportNegative = true): string {
  return value.replace(supportNegative ? /[^-0-9.]/g : /[^0-9.]/g, "");
}

export function parseNumber(value: string): number {
  return parseFloat(getNumber(value));
}

export function splitList(value: string, separators: string[]): string[] {
  const result: string[] = [];
  for (const item of value.split(new RegExp(separators.join("|"), "g"))) {
    if (item) result.push(item);
  }
  return result;
}

export function getErrorMessage(error: any): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return JSON.stringify(error);
}

export function isAsyncFunc(fn: any): boolean {
  return fn.constructor.name === "AsyncFunction";
}

export function generateRandomChar(n: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  return Array(n)
    .fill(0)
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

export function generateInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateListNumber(n: number): number {
  return generateInt(Math.pow(10, n - 1), Math.pow(10, n) - 1);
}

export function isUrl(value: string): boolean {
  value = value.trim();
  if (!value.length) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isEnter<T extends HTMLElement>(
  e: React.KeyboardEvent<T> | KeyboardEvent,
): boolean {
  return e.key === "Enter" && e.keyCode != 229;
}

export function withCtrl<T extends HTMLElement>(
  e: React.KeyboardEvent<T> | KeyboardEvent,
): boolean {
  // if platform is Mac, use Command instead of Ctrl
  return e.ctrlKey || e.metaKey;
}

export function withShift<T extends HTMLElement>(
  e: React.KeyboardEvent<T> | KeyboardEvent,
): boolean {
  return e.shiftKey;
}

export function resetJsArray<T>(arr: T[], target: T[]): T[] {
  /**
   * this function is used to reset an array to another array without changing the *pointer
   */

  arr.splice(0, arr.length, ...target);
  return arr;
}

export function getSizeUnit(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function getHostName(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function isB64Image(value: string): boolean {
  return /data:image\/([^;]+);base64,([a-zA-Z0-9+/=]+)/g.test(value);
}

export function trimSuffixes(value: string, suffixes: string[]): string {
  for (const suffix of suffixes) {
    if (value.endsWith(suffix)) return value.slice(0, -suffix.length);
  }
  return value;
}
