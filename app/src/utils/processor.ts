import { FileObject } from "@/components/FileProvider.tsx";

export function formatMessage(file: FileObject, message: string): string {
  message = message.trim();
  if (file.name.length > 0 || file.content.length > 0) {
    return `
\`\`\`file
[[${file.name}]]
${file.content}
\`\`\`

${message}`;
  } else {
    return message;
  }
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
