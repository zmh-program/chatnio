declare module "virtual:pwa-register/react" {
  // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
  // @ts-expect-error ignore when React is not installed
  import type { Dispatch, SetStateAction } from "react";
  import type { RegisterSWOptions } from "vite-plugin-pwa/types";

  export type { RegisterSWOptions };

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
    onRegistered: (registration: ServiceWorkerRegistration) => void;
  };
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}
