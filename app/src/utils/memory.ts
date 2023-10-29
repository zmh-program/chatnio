export function setMemory(key: string, value: string) {
  const data = value.trim();
  localStorage.setItem(key, data);
}

export function getMemory(key: string): string {
  return (localStorage.getItem(key) || "").trim();
}

export function forgetMemory(key: string) {
  localStorage.removeItem(key);
}

export function clearMemory() {
  localStorage.clear();
}

export function popMemory(key: string): string {
  const value = getMemory(key);
  forgetMemory(key);
  return value;
}
