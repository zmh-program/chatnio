import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronUp,
  File,
  Loader2,
  Menu,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import "@/assets/common/file.less";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useTranslation } from "react-i18next";
import { Alert, AlertTitle } from "./ui/alert.tsx";
import { useToast } from "./ui/use-toast.ts";
import { useDraggableInput } from "@/utils/dom.ts";
import { FileObject, FileArray, blobParser } from "@/api/file.ts";
import { Button } from "@/components/ui/button.tsx";
import { useSelector } from "react-redux";
import { isHighContextModel } from "@/conf/model.ts";
import { selectModel, selectSupportModels } from "@/store/chat.ts";
import { ChatAction } from "@/components/home/assemblies/ChatAction.tsx";
import { cn } from "@/components/ui/lib/utils.ts";
import { blobEvent } from "@/events/blob.ts";
import { isB64Image } from "@/utils/base.ts";

const MaxFileSize = 1024 * 1024 * 25; // 25MB File Size Limit
const MaxPromptSize = 5000; // 5000 Prompt Size Limit (to avoid token overflow)

type FileProviderProps = {
  files: FileArray;
  dispatch: (action: Record<string, any>) => void;
};

function FileProvider({ files, dispatch }: FileProviderProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const model = useSelector(selectModel);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const supportModels = useSelector(selectSupportModels);

  useEffect(() => {
    blobEvent.bind(async (file: File | File[]) => {
      setOpen?.(true);
      await triggerFile(Array.isArray(file) ? file : [file]);
    });
  }, []);

  const triggerFile = async (files: (File | null)[]) => {
    setLoading(true);
    for (const file of files) {
      if (!file) continue;
      if (file.size > MaxFileSize) {
        toast({
          title: t("file.over-size"),
          description: t("file.over-size-prompt", {
            size: (MaxFileSize / 1024 / 1024).toFixed(),
          }),
        });
      } else {
        const stamp: number = Date.now();
        const timeout = setTimeout(() => {
          toast({
            title: t("file.large-file"),
            description: t("file.large-file-prompt"),
          });
        }, 2000);

        const resp = await blobParser(file, model);
        clearTimeout(timeout);

        if (!resp.status) {
          toast({
            title: t("file.parse-error"),
            description: t("file.parse-error-prompt", { reason: resp.error }),
          });
          continue;
        }

        if (file.name.length === 0 || resp.content.length === 0) {
          toast({
            title: t("file.empty-file"),
            description: t("file.empty-file-prompt"),
          });
          continue;
        }

        // large file prompt
        const offset = (Date.now() - stamp) / 1000;
        if (offset > 2) {
          toast({
            title: t("file.large-file-success"),
            description: t("file.large-file-success-prompt", {
              time: offset.toFixed(1),
            }),
          });
        }
        addFile({ name: file.name, content: resp.content, size: file.size });
      }
    }
    setLoading(false);
  };

  function addFile(file: FileObject) {
    console.debug(
      `[file] new file was added (filename: ${file.name}, size: ${file.size}, prompt: ${file.content.length})`,
    );
    if (
      file.content.length > MaxPromptSize &&
      !isHighContextModel(supportModels, model) &&
      !isB64Image(file.content)
    ) {
      file.content = file.content.slice(0, MaxPromptSize);
      toast({
        title: t("file.max-length"),
        description: t("file.max-length-prompt"),
      });
    }

    dispatch({ type: "add", payload: file });
  }

  function removeFile(index: number) {
    dispatch({ type: "remove", payload: index });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ChatAction
          text={t("file.upload")}
          className={cn(files.length > 0 && "active")}
        >
          <Plus className={`h-4 w-4`} />
        </ChatAction>
      </DialogTrigger>
      <DialogContent className={`file-dialog flex-dialog`}>
        <DialogHeader>
          <DialogTitle>{t("file.upload")}</DialogTitle>
          <DialogDescription asChild>
            <div className={`file-wrapper`}>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("file.type")}</AlertTitle>
              </Alert>
              <FileList value={files} removeFile={removeFile} />
              <FileInput
                loading={loading}
                id={"file"}
                className={"file"}
                handleEvent={triggerFile}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

type FileListProps = {
  value: FileArray;
  removeFile: (index: number) => void;
};

function FileList({ value, removeFile }: FileListProps) {
  const { t } = useTranslation();
  const [full, setFull] = useState(false);
  const file = useMemo(() => value[0], [value]);
  const size = useMemo(
    () => value.reduce((acc, cur) => acc + (cur.size || cur.content.length), 0),
    [value],
  );

  return (
    <>
      <div className={`file-list`}>
        {value.length > 3 && full && (
          <div className={`file-item`}>
            <Paperclip className={`flex-shrink-0 h-4 w-4 ml-2 mr-1.5`} />
            <div className={`file-name mr-1`}>
              {t("file.number", { number: value.length })}
            </div>
            <div className={`grow`} />
            <Button
              variant={`ghost`}
              size={`icon`}
              className={`h-7 w-7`}
              onClick={() => setFull(false)}
            >
              <ChevronUp className={`h-4 w-4`} />
            </Button>
          </div>
        )}
        {value.length <= 3 || full ? (
          value.map((file, index) => (
            <div className={`file-item`} key={index}>
              <File className={`flex-shrink-0 h-4 w-4 ml-2 mr-1.5`} />
              <div className={`file-name mr-1`}>{file.name}</div>
              <div className={`grow`} />
              <div className={`file-size mr-2`}>
                {((file.size || file.content.length) / 1024).toFixed(2)}KB
              </div>
              <Button
                variant={`ghost`}
                size={`icon`}
                className={`h-7 w-7`}
                onClick={() => removeFile(index)}
              >
                <X className={`h-4 w-4`} />
              </Button>
            </div>
          ))
        ) : (
          <div className={`file-item`}>
            <Paperclip className={`flex-shrink-0 h-4 w-4 ml-2 mr-1.5`} />
            <div className={`file-name mr-1`}>
              {t("file.zipper", {
                filename: file.name,
                number: value.length - 1,
              })}
            </div>
            <div className={`grow`} />
            <div className={`file-size mr-2`}>{(size / 1024).toFixed(2)}KB</div>
            <Button
              variant={`ghost`}
              size={`icon`}
              className={`h-7 w-7`}
              onClick={() => setFull(true)}
            >
              <Menu className={`h-4 w-4`} />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

type FileInputProps = {
  id: string;
  loading: boolean;
  className?: string;
  handleEvent: (files: (File | null)[]) => void;
};

function FileInput({ id, loading, className, handleEvent }: FileInputProps) {
  const { t } = useTranslation();
  const ref = useRef(null);

  useEffect(() => {
    return useDraggableInput(window.document.body, handleEvent);
  }, []);

  return (
    <>
      <label className={`drop-window`} htmlFor={id} ref={ref}>
        {loading && <Loader2 className={`h-4 w-4 animate-spin mr-2`} />}
        <p>{t("file.drop")}</p>
      </label>
      <input
        id={id}
        type="file"
        className={className}
        onChange={(e) => handleEvent(Array.from(e.target?.files || []))}
        accept="*"
        style={{ display: "none" }}
        multiple={true}
        // on transfer file
        onPaste={(e) => {
          const items = e.clipboardData.items;
          const files = Array.from(items).filter(
            (item) => item.kind === "file",
          );
          handleEvent(files.map((file) => file.getAsFile()));
        }}
      />
    </>
  );
}

export default FileProvider;
