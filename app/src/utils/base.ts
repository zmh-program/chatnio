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
