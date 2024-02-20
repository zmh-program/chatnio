import { FileArray, FileObject } from "@/api/file.ts";

export function getFile(file: FileObject): string {
  return `\`\`\`file
[[${file.name}]]
${file.content}
\`\`\``;
}

export function formatMessage(files: FileArray, message: string): string {
  message = message.trim();

  const data = files.map((file) => getFile(file)).join("\n\n");
  return files.length > 0 ? `${data}\n\n${message}` : message;
}

export function filterMessage(message: string): string {
  return message.replace(/```file\n\[\[.*]]\n[\s\S]*?\n```\n\n/g, "");
}

export function extractMessage(
  message: string,
  length: number = 50,
  flow: string = "...",
) {
  return message.length > length ? message.slice(0, length) + flow : message;
}

export function escapeRegExp(str: string): string {
  // convert \n to [enter], \t to [tab], \r to [return], \s to [space], \" to [quote], \' to [single-quote]
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r")
    .replace(/\\s/g, " ")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");
}

export function handleLine(
  data: string,
  max_line: number,
  end?: boolean,
): string {
  const segment = data.split("\n");
  const line = segment.length;
  if (line > max_line) {
    return end ?? true
      ? segment.slice(line - max_line).join("\n")
      : segment.slice(0, max_line).join("\n");
  } else {
    return data;
  }
}

export function handleGenerationData(data: string): string {
  data = data
    .replace(/{\s*"result":\s*{/g, "")
    .trim()
    .replace(/}\s*$/g, "");
  return handleLine(escapeRegExp(data), 6);
}

export function getReadableNumber(
  num: number,
  fixed?: number,
  must_k?: boolean,
): string {
  if (num >= 1e9) return (num / 1e9).toFixed(fixed) + "b";
  if (num >= 1e6) return (num / 1e6).toFixed(fixed) + "m";
  if (num >= 1e3 || (num !== 0 && must_k))
    return (num / 1e3).toFixed(fixed) + "k";
  return num.toFixed(0);
}
