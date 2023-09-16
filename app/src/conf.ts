import axios from "axios";

export const version: string = "2.6.0";
export const deploy: boolean = true;
export let rest_api: string = "http://localhost:8094";
export let ws_api: string = "ws://localhost:8094";

if (deploy) {
  rest_api = "https://api.chatnio.net";
  ws_api = "wss://api.chatnio.net";
}

export const tokenField = deploy ? "token" : "token-dev";

export function login() {
  location.href = "https://deeptrain.lightxi.com/login?app=chatnio";
}

axios.defaults.baseURL = rest_api;
axios.defaults.headers.post["Content-Type"] = "application/json";

console.debug(`chatnio application (version: ${version})`);
