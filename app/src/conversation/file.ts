import axios from "axios";
import { blob_api } from "@/conf.ts";

export type BlobParserResponse = {
  status: number;
  content: string;
  error?: string;
};

export type FileObject = {
  name: string;
  content: string;
  size?: number;
};

export type FileArray = FileObject[];

export async function blobParser(file: File): Promise<BlobParserResponse> {
  const resp = await axios.post(
    `${blob_api}/upload`,
    { file },
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  if (resp.status !== 200) {
    return {
      status: resp.status,
      content: "",
      error: resp.statusText,
    };
  }

  return resp.data as BlobParserResponse;
}
