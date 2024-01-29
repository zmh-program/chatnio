import { Download, Eye, File } from "lucide-react";
import { saveAsFile, saveBlobAsFile } from "@/utils/dom.ts";
import { useMemo } from "react";
import { Button } from "@/components/ui/button.tsx";
import FileViewer from "@/components/FileViewer.tsx";

/**
 * file format:
 * ```file
 * [[<filename>]]
 * <file content>
 * ```
 */

export function parseFile(data: string, acceptDownload?: boolean) {
  const filename = data.split("\n")[0].replace("[[", "").replace("]]", "");
  const content = data.replace(`[[${filename}]]\n`, "");
  const image = useMemo(() => {
    // get image url from content (like: https://i.imgur.com/xxxxx.png)
    const match = content
      .toLowerCase()
      .match(/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/);
    return match ? match[0] : "";
  }, [filename, content]);

  return (
    <div
      className={`file-instance`}
      onClick={(e) => {
        if (!acceptDownload) return;
        e.preventDefault();
        e.stopPropagation();

        saveAsFile(filename, content);
      }}
    >
      <div className={`file-content`}>
        <File className={`mr-1`} />
        <span className={`name`}>{filename}</span>
        <div className={`grow`} />
        {image ? (
          <Button
            variant={`ghost`}
            size={`icon`}
            className={`download-action p-0 h-4 w-4`}
            onClick={async () => {
              const res = await fetch(image);
              saveBlobAsFile(filename, await res.blob());
            }}
          >
            <Download className={`cursor-pointer`} />
          </Button>
        ) : (
          <FileViewer filename={filename} content={content}>
            <Eye className={`cursor-pointer`} />
          </FileViewer>
        )}
      </div>
      {image && <img src={image} className={`file-image`} alt={""} />}
    </div>
  );
}
