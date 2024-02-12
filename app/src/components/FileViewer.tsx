import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useTranslation } from "react-i18next";
import React from "react";
import { Heading2, Paperclip, Text } from "lucide-react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { CodeMarkdown } from "@/components/Markdown.tsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";

type FileViewerProps = {
  filename: string;
  content: string;
  children: React.ReactNode;
  asChild?: boolean;
};

enum viewerType {
  Text = "text",
  Image = "image",
}

function FileViewer({ filename, content, children, asChild }: FileViewerProps) {
  const { t } = useTranslation();

  const [renderedType, setRenderedType] = React.useState(viewerType.Text);

  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className={`flex-dialog`}>
        <DialogHeader>
          <DialogTitle className={`flex flex-row items-center select-none`}>
            <Paperclip className={`h-4 w-4 mr-2`} />
            {filename ?? t("file.file")}
          </DialogTitle>
        </DialogHeader>
        <div className={`file-viewer-action`}>
          <ToggleGroup variant={`outline`} type={`single`} value={renderedType}>
            <ToggleGroupItem
              value={viewerType.Text}
              onClick={() => setRenderedType(viewerType.Text)}
            >
              <Text className={`h-4 w-4`} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value={viewerType.Image}
              onClick={() => setRenderedType(viewerType.Image)}
            >
              <Heading2 className={`h-4 w-4`} />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className={`file-viewer-content`}>
          {renderedType === viewerType.Text ? (
            <Textarea
              className={`file-viewer-textarea thin-scrollbar`}
              value={content}
              rows={15}
              readOnly
            />
          ) : (
            <div>
              <CodeMarkdown
                filename={filename}
                codeStyle={`overflow-auto max-h-[60vh] thin-scrollbar`}
              >
                {content}
              </CodeMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FileViewer;
