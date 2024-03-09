import "@/assets/pages/article.less";
import { Button } from "@/components/ui/button.tsx";
import router from "@/router.tsx";
import { Check, ChevronLeft, Cloud, Files, Globe, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast.ts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useState } from "react";
import ModelFinder from "@/components/home/ModelFinder.tsx";
import { Toggle } from "@/components/ui/toggle.tsx";
import { selectModel, selectWeb, setWeb } from "@/store/chat.ts";
import { Label } from "@/components/ui/label.tsx";
import {
  apiEndpoint,
  tokenField,
  websocketEndpoint,
} from "@/conf/bootstrap.ts";
import { getMemory } from "@/utils/memory.ts";
import { Progress } from "@/components/ui/progress.tsx";
import { cn } from "@/components/ui/lib/utils.ts";

type ProgressProps = {
  current: number;
  total: number;
};

function GenerateProgress({
  current,
  total,
  quota,
}: ProgressProps & { quota: number }) {
  const { t } = useTranslation();

  return (
    <div className={`article-progress w-full mb-4`}>
      <p
        className={`select-none mt-4 mb-2.5 flex flex-row items-center content-center w-full justify-center text-center`}
      >
        {total !== 0 && current === total ? (
          <>
            <Check
              className={`h-5 w-5 mr-2 inline-block animate-out shrink-0`}
            />
            {t("article.generate-success")}
          </>
        ) : (
          <>
            <Loader2
              className={`h-5 w-5 mr-2 inline-block animate-spin shrink-0`}
            />
            {t("article.progress-title", { current, total })}
          </>
        )}
      </p>
      <Progress value={(100 * current) / total} />
      <div
        className={`article-quota flex flex-row mt-4 border border-input rounded-md py-1 px-3 select-none w-max items-center mx-auto`}
      >
        <Cloud className={`h-4 w-4 mr-2`} />
        <p>{quota.toFixed(2)}</p>
      </div>
    </div>
  );
}

function ArticleContent() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const web = useSelector(selectWeb);
  const model = useSelector(selectModel);

  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(false);

  const [state, setState] = useState<ProgressProps>({ current: 0, total: 0 });
  const [quota, setQuota] = useState<number>(0);
  const [hash, setHash] = useState("");

  function clear() {
    setPrompt("");
    setTitle("");
    setHash("");
    setProgress(false);
    setQuota(0);
    setState({ current: 0, total: 0 });
  }

  function generate() {
    setProgress(true);
    const connection = new WebSocket(`${websocketEndpoint}/article/create`);

    connection.onopen = () => {
      connection.send(
        JSON.stringify({
          token: getMemory(tokenField),
          web,
          title,
          prompt,
          model,
        }),
      );
    };

    connection.onmessage = (e) => {
      const data = JSON.parse(e.data);

      data.data && data.data.quota && setQuota(quota + data.data.quota);
      if (!data.hash) setState(data.data as ProgressProps);
      else {
        toast({
          title: t("article.generate-success"),
          description: t("article.generate-success-prompt"),
        });
        setHash(data.hash);
      }
    };

    connection.onerror = (e: Event) => {
      console.debug(`[article] error during generation: ${e}`);
      toast({
        title: t("article.generate-failed"),
        description: `${t("article.generate-failed-prompt")} (${e.toString()})`,
      });
      setProgress(false);
      connection.close();
    };
  }

  return progress ? (
    <>
      <GenerateProgress {...state} quota={quota} />
      {hash && (
        <div className={`article-action flex flex-row items-center my-4 gap-4`}>
          <Button
            variant={`outline`}
            className={`w-full whitespace-nowrap`}
            onClick={() => {
              location.href = `${apiEndpoint}/article/download/zip?hash=${hash}`;
            }}
          >
            {" "}
            {t("article.download-format", { name: "zip" })}{" "}
          </Button>

          <Button
            variant={`outline`}
            className={`w-full whitespace-nowrap`}
            onClick={() => {
              location.href = `${apiEndpoint}/article/download/tar?hash=${hash}`;
            }}
          >
            {" "}
            {t("article.download-format", { name: "tar" })}{" "}
          </Button>
        </div>
      )}
      <Button
        variant={`default`}
        className={`mt-5 w-full mx-auto`}
        onClick={clear}
      >
        {t("close")}
      </Button>
    </>
  ) : (
    <>
      <div className={`flex flex-row items-center mx-auto`}>
        <Toggle
          aria-label={t("chat.web-aria")}
          defaultPressed={false}
          onPressedChange={(state: boolean) => dispatch(setWeb(state))}
          variant={`outline`}
        >
          <Globe className={cn("h-4 w-4 web", web && "enable")} />
        </Toggle>
        <Label className={`ml-2.5 whitespace-nowrap`}>
          {t("article.web-checkbox")}
        </Label>
      </div>
      <Textarea
        placeholder={t("article.prompt-placeholder")}
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Textarea
        placeholder={t("article.input-placeholder")}
        rows={8}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <ModelFinder side={`bottom`} />
      <Button
        variant={`default`}
        className={`mt-5 w-full mx-auto`}
        onClick={generate}
        disabled={progress || !title}
      >
        {t("article.generate")}
      </Button>
    </>
  );
}

function Wrapper() {
  const { t } = useTranslation();

  return (
    <Card className={`article-wrapper`}>
      <CardHeader className={`py-4`}>
        <CardTitle className={`article-title`}>
          <Files className={`h-5 w-5 mr-2`} />
          {t("article.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className={`article-content`}>
        <ArticleContent />
      </CardContent>
    </Card>
  );
}

function Article() {
  return (
    <div className={`article-page`}>
      <div className={`article-container`}>
        <Button
          className={`action`}
          variant={`ghost`}
          size={`icon`}
          onClick={() => router.navigate("/")}
        >
          <ChevronLeft className={`h-5 w-5 back`} />
        </Button>
        <Wrapper />
      </div>
    </div>
  );
}

export default Article;
