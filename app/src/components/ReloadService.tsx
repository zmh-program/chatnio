import { useRegisterSW } from "virtual:pwa-register/react";
import { version } from "@/conf.ts";
import { useTranslation } from "react-i18next";
import { useToast } from "./ui/use-toast.ts";
import { useEffect } from "react";
import { ToastAction } from "./ui/toast.tsx";
import { getMemory, setMemory } from "@/utils/memory.ts";

function ReloadPrompt() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() {
      console.debug(`[service] service worker registered (version ${version})`);
    },
    onRegisterError(error) {
      console.log(
        `[service] service worker registration failed: ${error.message}`,
      );
    },
  });

  const before = getMemory("version");
  if (before.length > 0 && before !== version) {
    setMemory("version", version);
    toast({
      title: t("service.update-success"),
      description: t("service.update-success-prompt"),
    });
    console.debug(
      `[service] service worker updated (from ${before} to ${version})`,
    );
  }
  setMemory("version", version);

  useEffect(() => {
    if (offlineReady) {
      toast({
        title: t("service.offline-title"),
        description: t("service.offline"),
      });
    }

    if (needRefresh) {
      toast({
        title: t("service.title"),
        description: t("service.description"),
        action: (
          <ToastAction
            altText={t("service.update")}
            onClick={() => updateServiceWorker(true)}
          >
            {t("service.update")}
          </ToastAction>
        ),
      });

      setOfflineReady(false);
      setNeedRefresh(false);
    }
  }, [offlineReady, needRefresh]);

  return <></>;
}

export default ReloadPrompt;
