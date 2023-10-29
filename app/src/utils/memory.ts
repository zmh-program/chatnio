export function recordMemory(key: string, value: string) {
  const data = value.trim();
  localStorage.setItem(key, data);
}

export function recallMemory(key: string): string {
  return (localStorage.getItem(key) || "").trim();
}

export function forgetMemory(key: string) {
  localStorage.removeItem(key);
}

export function clearMemory() {
  localStorage.clear();
}

export function popMemory(key: string): string {
  const value = recallMemory(key);
  forgetMemory(key);
  return value;
}
