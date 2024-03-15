export function isTauri(): boolean {
  return window.__TAURI__ !== undefined;
}
