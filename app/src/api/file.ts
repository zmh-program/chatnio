import axios from "axios";
import { blobEndpoint } from "@/conf/env.ts";
import { trimSuffixes } from "@/utils/base.ts";

export type BlobParserResponse = {
  status: boolean;
  content: string;
  error?: string;
};

export type FileObject = {
  name: string;
  content: string;
  size?: number;
};

export type FileArray = FileObject[];

export async function blobParser(
  file: File,
  model: string,
): Promise<BlobParserResponse> {
  const endpoint = trimSuffixes(blobEndpoint, ["/upload", "/"]);

  try {
    const resp = await axios.post(
      `${endpoint}/upload`,
      { file, model },
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return resp.data as BlobParserResponse;
  } catch (e) {
    return { status: false, content: "", error: (e as Error).message };
  }
}
