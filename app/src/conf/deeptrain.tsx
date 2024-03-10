import {
  deeptrainAppName,
  deeptrainEndpoint,
  useDeeptrain,
} from "@/conf/env.ts";
import { dev } from "@/conf/bootstrap.ts";
import React from "react";

export function goDeepLogin() {
  location.href = `${deeptrainEndpoint}/login?app=${
    dev ? "dev" : deeptrainAppName
  }`;
}

export function DeeptrainOnly({ children }: { children: React.ReactNode }) {
  return useDeeptrain ? <>{children}</> : null;
}
