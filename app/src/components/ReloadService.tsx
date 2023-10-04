import { useRegisterSW } from 'virtual:pwa-register/react'
import {version} from "../conf.ts";
import {useTranslation} from "react-i18next";
import {useToast} from "./ui/use-toast.ts";
import {useEffect} from "react";
import {ToastAction} from "./ui/toast.tsx";

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
      console.log(`[service] service worker registration failed: ${error.message}`);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast({
        title: t('service.offline-title'),
        description: t('service.offline'),
      })
    }

    if (needRefresh) {
      toast({
        title: t('service.title'),
        description: t('service.description'),
        action: (
          <ToastAction altText={t('service.update')} onClick={() => updateServiceWorker(true)}>
            {t('service.update')}
          </ToastAction>
        ),
      });

      setOfflineReady(false);
      setNeedRefresh(false);
    }
  }, []);

  return <></>;
}

export default ReloadPrompt;

