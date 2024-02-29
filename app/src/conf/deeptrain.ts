import { deeptrainAppName, deeptrainEndpoint } from "@/conf/env.ts";
import { dev } from "@/conf/bootstrap.ts";

export function goDeepLogin() {
  location.href = `${deeptrainEndpoint}/login?app=${
    dev ? "dev" : deeptrainAppName
  }`;
}
