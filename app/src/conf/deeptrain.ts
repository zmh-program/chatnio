import { deeptrainAppName, deeptrainEndpoint } from "@/conf/env.ts";
import { dev } from "@/conf/index.ts";

export function goDeepLogin() {
  location.href = `${deeptrainEndpoint}/login?app=${
    dev ? "dev" : deeptrainAppName
  }`;
}
