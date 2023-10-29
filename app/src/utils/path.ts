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
