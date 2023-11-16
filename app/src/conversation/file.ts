import axios from "axios";
import { blob_api } from "@/conf.ts";

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

export async function blobParser(file: File): Promise<BlobParserResponse> {
  try {
    const resp = await axios.post(
      `${blob_api}/upload`,
      { file },
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return resp.data as BlobParserResponse;
  } catch (e) {
    return { status: false, content: "", error: (e as Error).message };
  }
}
