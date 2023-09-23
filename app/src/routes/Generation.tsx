import "../assets/generation.less";
import { useSelector } from "react-redux";
import { selectAuthenticated } from "../store/auth.ts";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button.tsx";
import {ChevronLeft, Cloud, FileDown, Info, LogIn, Send} from "lucide-react";
import {login, rest_api} from "../conf.ts";
import router from "../router.ts";
import { Input } from "../components/ui/input.tsx";
import { useEffect, useRef, useState } from "react";
import SelectGroup from "../components/SelectGroup.tsx";
import {manager} from "../conversation/generation.ts";
import {useToast} from "../components/ui/use-toast.ts";
import {handleLine} from "../utils.ts";

type WrapperProps = {
  onSend?: (value: string, model: string) => boolean;
};

function Wrapper({ onSend }: WrapperProps) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [ stayed, setStayed ] = useState<boolean>(false);
  const [ hash, setHash ] = useState<string>("");
  const [ data, setData ] = useState<string>("");
  const [ quota, setQuota ] = useState<number>(0);
  const [model, setModel] = useState("GPT-3.5");
  const { toast } = useToast();

  function clear() {
    setData("");
    setQuota(0);
    setHash("");
  }

  manager.setMessageHandler(({ message, quota }) => {
    setData(message);
    setQuota(quota);
  })

  manager.setErrorHandler((err: string) => {
    toast({
      title: t('generate.failed'),
      description: `${t('generate.reason')} ${err}`,
    })
  })
  manager.setFinishedHandler((hash: string) => {
    toast({
      title: t('generate.success'),
      description: t('generate.success-prompt'),
    })
    setHash(hash);
  })

  function handleSend() {
    const target = ref.current as HTMLInputElement | null;
    if (!target) return;

    const value = target.value.trim();
    if (!value.length) return;

    if (onSend?.(value, model.toLowerCase())) {
      setStayed(true);
      clear();
      target.value = "";
    }
  }

  useEffect(() => {
    ref.current && (ref.current as HTMLInputElement).focus();
    ref.current &&
      (ref.current as HTMLInputElement).addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          handleSend();
        }
      });
  });
  return (
    <div className={`generation-wrapper`}>
      {
        stayed ?
          <div className={`box`}>
            { quota > 0 && <div className={`quota-box`}>
              <Cloud className={`h-4 w-4 mr-2`} />
              {quota}
            </div> }
            <pre className={`message-box`}>
              { handleLine(data, 10) || t('generate.empty') }
            </pre>
            {
              hash.length > 0 &&
                <div className={`hash-box`}>
                  <a className={`download-box`} href={`${rest_api}/generation/download/tar?hash=${hash}`}>
                    <FileDown className={`h-6 w-6`} />
                    <p>{ t('generate.download', { name: "tar.gz"}) }</p>
                  </a>
                  <a className={`download-box`} href={`${rest_api}/generation/download/zip?hash=${hash}`}>
                    <FileDown className={`h-6 w-6`} />
                    <p>{ t('generate.download', { name: "zip"}) }</p>
                  </a>

                </div>
            }
          </div> :
          <div className={`product`}><img src={`/favicon.ico`} alt={""} />AI Code Generator</div>
      }
      <div className={`generate-box`}>
        <Input className={`input`} ref={ref} placeholder={t('generate.input-placeholder')} />
        <Button
          size={`icon`}
          className={`action`}
          variant={`default`}
          onClick={handleSend}
        >
          <Send className={`h-5 w-5`} />
        </Button>
      </div>
      <div className={`model-box`}>
        <SelectGroup
          current={model}
          list={["GPT-3.5", "GPT-3.5-16k", "GPT-4", "GPT-4-32k"]}
          onChange={setModel}
        />
      </div>
    </div>
  );
}
function Generation() {
  const [ state, setState ] = useState(false);
  const { t } = useTranslation();
  const auth = useSelector(selectAuthenticated);

  manager.setProcessingChangeHandler(setState);

  return (
    <div className={`generation-page`}>
      {auth ? (
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
              return manager.generateWithBlock(prompt, model)
            }}
          />
        </div>
      ) : (
        <div className={`login-action`}>
          <div className={`tip`}>
            <Info className={`h-4 w-4 mr-2`} />
            {t("login-require")}
          </div>
          <Button size={`lg`} onClick={login}>
            <LogIn className={`h-4 w-4 mr-2`} />
            <p className={`text`}>{t("login")}</p>
          </Button>
        </div>
      )}
    </div>
  );
}

export default Generation;
