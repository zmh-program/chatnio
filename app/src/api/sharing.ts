import axios from "axios";
import { Message } from "./types.tsx";

export type SharingForm = {
  status: boolean;
  message: string;
  data: string;
};

export type SharingPreviewForm = {
  name: string;
  conversation_id: number;
  hash: string;
  time: string;
};

export type ViewData = {
  name: string;
  username: string;
  time: string;
  model?: string;
  messages: Message[];
};

export type ViewForm = {
  status: boolean;
  message: string;
  data: ViewData | null;
};

export type ListSharingResponse = {
  status: boolean;
  message: string;
  data?: SharingPreviewForm[];
};

export type DeleteSharingResponse = {
  status: boolean;
  message: string;
};

export async function shareConversation(
  id: number,
  refs: number[] = [-1],
): Promise<SharingForm> {
  try {
    const resp = await axios.post("/conversation/share", { id, refs });
    return resp.data;
  } catch (e) {
    return { status: false, message: (e as Error).message, data: "" };
  }
}

export async function viewConversation(hash: string): Promise<ViewForm> {
  try {
    const resp = await axios.get(`/conversation/view?hash=${hash}`);
    return resp.data as ViewForm;
  } catch (e) {
    return {
      status: false,
      message: (e as Error).message,
      data: null,
    };
  }
}

export async function listSharing(): Promise<ListSharingResponse> {
  try {
    const resp = await axios.get("/conversation/share/list");
    return resp.data as ListSharingResponse;
  } catch (e) {
    return {
      status: false,
      message: (e as Error).message,
    };
  }
}

export async function deleteSharing(
  hash: string,
): Promise<DeleteSharingResponse> {
  try {
    const resp = await axios.get(`/conversation/share/delete?hash=${hash}`);
    return resp.data as DeleteSharingResponse;
  } catch (e) {
    return {
      status: false,
      message: (e as Error).message,
    };
  }
}

export function getSharedLink(hash: string): string {
  return `${location.origin}/share/${hash}`;
}
