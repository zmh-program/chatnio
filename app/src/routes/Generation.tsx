import "@/assets/pages/generation.less";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { ChevronLeft, Cloud, FileDown, Send } from "lucide-react";
import { apiEndpoint } from "@/conf/bootstrap.ts";
import router from "@/router.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useEffect, useRef, useState } from "react";
import { manager } from "@/api/generation.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { handleGenerationData } from "@/utils/processor.ts";
import { selectModel } from "@/store/chat.ts";
import ModelFinder from "@/components/home/ModelFinder.tsx";
import { appLogo } from "@/conf/env.ts";
import { isEnter } from "@/utils/base.ts";

type WrapperProps = {
  onSend?: (value: string, model: string) => boolean;
};

function Wrapper({ onSend }: WrapperProps) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [stayed, setStayed] = useState<boolean>(false);
  const [hash, setHash] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [quota, setQuota] = useState<number>(0);
  const model = useSelector(selectModel);
  const modelRef = useRef(model);

  const { toast } = useToast();

  function clear() {
    setData("");
    setQuota(0);
    setHash("");
  }

  manager.setMessageHandler(({ message, quota }) => {
    setData(message);
    setQuota(quota);
  });

  manager.setErrorHandler((err: string) => {
    toast({
      title: t("generate.failed"),
      description: `${t("generate.reason")} ${err}`,
    });
  });
  manager.setFinishedHandler((hash: string) => {
    toast({
      title: t("generate.success"),
      description: t("generate.success-prompt"),
    });
    setHash(hash);
  });

  function handleSend(model: string = "gpt-3.5-16k") {
    const target = ref.current as HTMLInputElement | null;
    if (!target) return;

    const value = target.value.trim();
    if (!value.length) return;

    if (onSend?.(value, model)) {
      setStayed(true);
      clear();
      target.value = "";
    }
  }

  useEffect(() => {
    const target = ref.current as HTMLInputElement | null;
    if (!target) return;
    target.focus();
    target.removeEventListener("keydown", () => {});
    target.addEventListener("keydown", (e) => {
      if (isEnter(e)) {
        // cannot use model here, because model is not updated
        handleSend(modelRef.current);
      }
    });

    return () => {
      ref.current &&
        (ref.current as HTMLInputElement).removeEventListener(
          "keydown",
          () => {},
        );
    };
  }, [ref]);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  return (
    <div className={`generation-wrapper`}>
      {stayed ? (
        <div className={`box`}>
          {quota > 0 && (
            <div className={`quota-box`}>
              <Cloud className={`h-4 w-4 mr-2`} />
              {quota.toFixed(2)}
            </div>
          )}
          <pre className={`message-box`}>
            {handleGenerationData(data) || t("generate.empty")}
          </pre>
          {hash.length > 0 && (
            <div className={`hash-box`}>
              <a
                className={`download-box`}
                href={`${apiEndpoint}/generation/download/tar?hash=${hash}`}
              >
                <FileDown className={`h-6 w-6`} />
                <p>{t("generate.download", { name: "tar.gz" })}</p>
              </a>
              <a
                className={`download-box`}
                href={`${apiEndpoint}/generation/download/zip?hash=${hash}`}
              >
                <FileDown className={`h-6 w-6`} />
                <p>{t("generate.download", { name: "zip" })}</p>
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className={`product`}>
          <img src={appLogo} alt={""} />
          AI Code Generator
        </div>
      )}
      <div className={`generate-box`}>
        <Input
          className={`input`}
          ref={ref}
          placeholder={t("generate.input-placeholder")}
        />
        <Button
          size={`icon`}
          className={`action`}
          variant={`default`}
          onClick={() => handleSend(model)}
        >
          <Send className={`h-5 w-5`} />
        </Button>
      </div>
      <div className={`model-box`}>
        <ModelFinder side={`bottom`} />
      </div>
    </div>
  );
}
function Generation() {
  const [state, setState] = useState(false);
  manager.setProcessingChangeHandler(setState);

  return (
    <div className={`generation-page`}>
      <div className={`generation-container`}>
        <Button
          className={`action`}
          variant={`ghost`}
          size={`icon`}
          onClick={() => router.navigate("/")}
          disabled={state}
        >
          <ChevronLeft className={`h-5 w-5 back`} />
        </Button>
        <Wrapper
          onSend={(prompt: string, model: string) => {
            console.debug(
              `[generation] create generation request (prompt: ${prompt}, model: ${model})`,
            );
            return manager.generateWithBlock(prompt, model);
          }}
        />
      </div>
    </div>
  );
}

export default Generation;
