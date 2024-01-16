import axios from "axios";
import { getMemory } from "@/utils/memory.ts";

type AxiosConfig = {
  endpoint: string;
  token: string;
};

export function setAxiosConfig(config: AxiosConfig) {
  axios.defaults.baseURL = config.endpoint;
  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios.defaults.headers.common["Authorization"] = getMemory(config.token);
}
