import { useSelector } from "react-redux";
import { selectInit } from "@/store/auth.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { useTranslation } from "react-i18next";
import { useEffectAsync } from "@/utils/hook.ts";
import { getBroadcast } from "@/api/broadcast.ts";

function Broadcast() {
  const { t } = useTranslation();
  const init = useSelector(selectInit);
  const { toast } = useToast();
  useEffectAsync(async () => {
    if (!init) return;

    const content = await getBroadcast();
    if (content.length === 0) return;

    toast({
      title: t("broadcast"),
      description: content,
      duration: 10000,
    });
  }, [init]);

  return <div id={`broadcast`} />;
}

export default Broadcast;
