import { version } from "@/conf/bootstrap.ts";
import { useTranslation } from "react-i18next";
import { useToast } from "./ui/use-toast.ts";
import { getMemory, setMemory } from "@/utils/memory.ts";

function ReloadPrompt() {
  const { t } = useTranslation();
  const { toast } = useToast();

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

  return <></>;
}

export default ReloadPrompt;
