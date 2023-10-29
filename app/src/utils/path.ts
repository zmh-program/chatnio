export function getQueryParams() {
  /**
   * Get query params from url
   *
   * @example
   * // https://example.com?foo=bar&baz=qux
   * getQueryParams();
   * // { foo: "bar", baz: "qux" }
   */

  const params = new URLSearchParams(window.location.search);
  const obj: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }
  return obj;
}

export function getQueryParam(key: string): string {
  /**
   * Get query param from url
   *
   * @example
   * // https://example.com?foo=bar&baz=qux
   * getQueryParam("foo");
   * // "bar"
   */

  const params = new URLSearchParams(window.location.search);
  return params.get(key) || "";
}

export function replaceHistoryState(
  state: Record<string, string>,
  title: string,
  url: string,
) {
  /**
   * Replace history state
   *
   * @example
   * replaceHistoryState({ foo: "bar" }, "title", "/url");
   */

  window.history.replaceState(state, title, url);
}

export function pushHistoryState(
  state: Record<string, string>,
  title: string,
  url: string,
) {
  /**
   * Push history state
   *
   * @example
   * pushHistoryState({ foo: "bar" }, "title", "/url");
   */

  window.history.pushState(state, title, url);
}

export function getHistoryState(): Record<string, string> {
  /**
   * Get history state
   *
   * @example
   * getHistoryState();
   * // { foo: "bar" }
   */

  return window.history.state;
}

export function clearHistoryState() {
  /**
   * Clear history state
   *
   * @example
   * clearHistoryState();
   */

  window.history.replaceState({}, "", window.location.pathname);
}
