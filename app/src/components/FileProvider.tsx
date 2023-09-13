import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, File, FileCheck, Plus, X } from "lucide-react";
import "../assets/file.less";
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
import { useDraggableInput } from "../utils.ts";

export type FileObject = {
  name: string;
  content: string;
};

type FileProviderProps = {
  id: string;
  className?: string;
  maxLength?: number;
  onChange?: (data: FileObject) => void;
  setClearEvent?: (event: () => void) => void;
};

type FileObjectProps = {
  id: string;
  filename: string;
  className?: string;
  onChange?: (filename?: string, data?: string) => void;
};

function isValidUnicode(str: string): boolean {
  if (!Array.from(str).every(c => {
    const code = c.codePointAt(0);
    return c.length === 1 ? code <= 0xFFFF : code >= 0x010000 && code <= 0x10FFFF;
  })) return false;
  if (str.includes('\0')) {
    return false;
  }
  
  const binaryRegex = /[\0-\x1F\x7F-\xFF]/;
  if (binaryRegex.test(str)) {
    return false;
  }
  return true;
}

function FileProvider({
  id,
  className,
  onChange,
  maxLength,
  setClearEvent,
}: FileProviderProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [active, setActive] = useState(false);
  const [filename, setFilename] = useState<string>("");

  useEffect(() => {
    setClearEvent && setClearEvent(() => clear);

    return () => {
      setClearEvent && setClearEvent(() => {});
    };
  }, [setClearEvent]);

  function clear() {
    setFilename("");
    setActive(false);
    onChange?.({ name: "", content: "" });
  }

  function handleChange(name?: string, data?: string) {
    name = name || "";
    data = data || "";

    if (maxLength && data.length > maxLength) {
      data = data.slice(0, maxLength);
      toast({
        title: t("file.max-length"),
        description: t("file.max-length-prompt"),
      });
    }
    setActive(data !== "");
    if (data === "") {
      setFilename("");
      onChange?.({ name: "", content: "" });
    } else {
      setFilename(name);
      onChange?.({ name: name, content: data });
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <div className={`file-action`}>
            {active ? (
              <FileCheck className={`h-3.5 w-3.5`} />
            ) : (
              <Plus className={`h-3.5 w-3.5`} />
            )}
          </div>
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
                <FileObject
                  id={id}
                  filename={filename}
                  className={className}
                  onChange={handleChange}
                />
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FileObject({ id, filename, className, onChange }: FileObjectProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const target = ref.current as HTMLLabelElement;
    onChange && useDraggableInput(t, toast, target, onChange);
    return () => {
      target.removeEventListener("dragover", () => {});
      target.removeEventListener("drop", () => {});
    };
  }, [ref]);

  const handleChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
    const file = e && e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        if (!isValidUnicode(data)) {
          toast({
            title: t("file.parse-error"),
            description: t("file.parse-error-prompt"),
          });
          onChange?.(file.name, "");
        } else {
          onChange?.(file.name, e.target?.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      onChange?.("", "");
    }
  };

  return (
    <>
      <label className={`drop-window`} htmlFor={id} ref={ref}>
        {filename ? (
          <div className={`file-object`}>
            <File className={`h-4 w-4`} />
            <p>{filename}</p>
            <X
              className={`h-3.5 w-3.5 ml-1 close`}
              onClick={(e) => {
                handleChange();
                e.preventDefault();
              }}
            />
          </div>
        ) : (
          <p>{t("file.drop")}</p>
        )}
      </label>
      <input
        id={id}
        type="file"
        className={className}
        onChange={handleChange}
        multiple={false}
        style={{ display: "none" }}
      />
    </>
  );
}

export default FileProvider;
