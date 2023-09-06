import axios from "axios";

export const deploy: boolean = true;
export let rest_api: string = "http://localhost:8094";
export let ws_api: string = "ws://localhost:8094";

if (deploy) {
  rest_api = "https://nioapi.fystart.cn";
  ws_api = "wss://nioapi.fystart.cn";
}

export function login() {
  location.href = "https://deeptrain.lightxi.com/login?app=chatnio";
}

axios.defaults.baseURL = rest_api;
axios.defaults.headers.post["Content-Type"] = "application/json";
