export const useDeeptrain = !!import.meta.env.VITE_USE_DEEPTRAIN;
export const backendEndpoint = import.meta.env.VITE_BACKEND_ENDPOINT || "/api";
export const blobEndpoint =
  import.meta.env.VITE_BLOB_ENDPOINT || "https://blob.chatnio.net";
export const docsEndpoint =
  import.meta.env.VITE_DOCS_ENDPOINT || "https://docs.chatnio.net";
export const deeptrainEndpoint =
  import.meta.env.VITE_DEEPTRAIN_ENDPOINT || "https://deeptrain.net";
export const deeptrainAppName = import.meta.env.VITE_DEEPTRAIN_APP || "chatnio";
export const deeptrainApiEndpoint =
  import.meta.env.VITE_DEEPTRAIN_API_ENDPOINT || "https://api.deeptrain.net";

export function getDev(): boolean {
  /**
   * return if the current environment is development
   */
  return window.location.hostname === "localhost";
}

export function getRestApi(deploy: boolean): string {
  /**
   * return the REST API address
   */
  return !deploy ? "http://localhost:8094" : backendEndpoint;
}

export function getWebsocketApi(deploy: boolean): string {
  /**
   * return the WebSocket API address
   */
  if (!deploy) return "ws://localhost:8094";

  if (backendEndpoint.startsWith("http://"))
    return `ws://${backendEndpoint.slice(7)}`;
  if (backendEndpoint.startsWith("https://"))
    return `wss://${backendEndpoint.slice(8)}`;
  if (backendEndpoint.startsWith("/"))
    return location.protocol === "https:"
      ? `wss://${location.host}${backendEndpoint}`
      : `ws://${location.host}${backendEndpoint}`;
  return backendEndpoint;
}

export function getTokenField(deploy: boolean): string {
  /**
   * return the token field name in localStorage
   */
  return deploy ? "token" : "token-dev";
}
