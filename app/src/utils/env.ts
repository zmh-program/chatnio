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
  return !deploy ? "http://localhost:8094" : "https://api.chatnio.net";
}

export function getWebsocketApi(deploy: boolean): string {
  /**
   * return the WebSocket API address
   */
  return !deploy ? "ws://localhost:8094" : "wss://api.chatnio.net";
}

export function getTokenField(deploy: boolean): string {
  /**
   * return the token field name in localStorage
   */
  return deploy ? "token" : "token-dev";
}
