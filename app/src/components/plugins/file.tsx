import {File} from "lucide-react";
import {saveAsFile} from "../../utils.ts";

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

  return (
    <div className={`file-instance`} onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();

      saveAsFile(filename, content);
    }}>
      <File className={`mr-1`} />
      <span className={`name`}>{filename}</span>
    </div>
  )
}
