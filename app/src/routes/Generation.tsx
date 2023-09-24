import "../assets/generation.less";
import {useDispatch, useSelector} from "react-redux";
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
import {handleGenerationData} from "../utils.ts";
import {selectModel, setModel} from "../store/chat.ts";

type WrapperProps = {
  onSend?: (value: string, model: string) => boolean;
};

function Wrapper({ onSend }: WrapperProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const ref = useRef(null);
  const [ stayed, setStayed ] = useState<boolean>(false);
  const [ hash, setHash ] = useState<string>("");
  const [ data, setData ] = useState<string>("");
  const [ quota, setQuota ] = useState<number>(0);
  const model = useSelector(selectModel);
  const auth = useSelector(selectAuthenticated);

  const { toast } = useToast();

  useEffect(() => {
    if (auth && model === "GPT-3.5") dispatch(setModel("GPT-3.5-16k"));
  }, [auth]);

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
    ref.current && (ref.current as HTMLInputElement).focus();
    ref.current && (ref.current as HTMLInputElement).removeEventListener("keydown", () => {});
    ref.current &&
      (ref.current as HTMLInputElement).addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          handleSend(model);
        }
      });

    return () => {
      ref.current && (ref.current as HTMLInputElement).removeEventListener("keydown", () => {});
    }
  }, [ref]);
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
              { handleGenerationData(data) || t('generate.empty') }
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
          onClick={() => handleSend(model)}
        >
          <Send className={`h-5 w-5`} />
        </Button>
      </div>
      <div className={`model-box`}>
        <SelectGroup
          current={model}
          list={["GPT-3.5", "GPT-3.5-16k", "GPT-4", "GPT-4-32k"]}
          onChange={(value: string) => {
            dispatch(setModel(value));
          }}
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
              console.debug(`[generation] create generation request (prompt: ${prompt}, model: ${model.toLowerCase()})`);
              return manager.generateWithBlock(prompt, model.toLowerCase());
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
