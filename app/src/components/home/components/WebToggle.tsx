import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Toggle } from "@/components/ui/toggle.tsx";
import { selectWeb, setWeb } from "@/store/chat.ts";
import { Globe } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

function WebToggle() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const web = useSelector(selectWeb);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              aria-label={t("chat.web-aria")}
              defaultPressed={false}
              onPressedChange={(state: boolean) => dispatch(setWeb(state))}
              variant={`outline`}
            >
              <Globe className={`h-4 w-4 web ${web ? "enable" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p className={`tooltip`}>{t("chat.web")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}

export default WebToggle;
