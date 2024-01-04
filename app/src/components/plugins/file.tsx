import { File } from "lucide-react";
import { saveAsFile } from "@/utils/dom.ts";
import { useMemo } from "react";

/**
 * file format:
 * ```file
 * [[<filename>]]
 * <file content>
 * ```
 */

export function parseFile(data: string) {
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
        e.preventDefault();
        e.stopPropagation();

        saveAsFile(filename, content);
      }}
    >
      <div className={`file-content`}>
        <File className={`mr-1`} />
        <span className={`name`}>{filename}</span>
      </div>
      {image && <img src={image} className={`file-image`} alt={""} />}
    </div>
  );
}
