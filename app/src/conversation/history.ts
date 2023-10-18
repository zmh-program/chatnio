import axios from "axios";
import type { ConversationInstance } from "./types.ts";
import { setHistory } from "../store/chat.ts";
import { manager } from "./manager.ts";
import { AppDispatch } from "../store";

type SharingForm = {
  status: boolean;
  message: string;
  data: string;
}

export async function updateConversationList(
  dispatch: AppDispatch,
): Promise<void> {
  const resp = await axios.get("/conversation/list");

  dispatch(
    setHistory(
      resp.data.status
        ? ((resp.data.data || []) as ConversationInstance[])
        : [],
    ),
  );
}

export async function loadConversation(
  id: number,
): Promise<ConversationInstance> {
  const resp = await axios.get(`/conversation/load?id=${id}`);
  if (resp.data.status) return resp.data.data as ConversationInstance;
  return { id, name: "", message: [] };
}

export async function deleteConversation(
  dispatch: AppDispatch,
  id: number,
): Promise<boolean> {
  const resp = await axios.get(`/conversation/delete?id=${id}`);
  if (!resp.data.status) return false;
  await manager.delete(dispatch, id);
  return true;
}

export async function shareConversation(
  id: number, refs: number[] = [-1],
): Promise<SharingForm> {
  try {
    const resp = await axios.post("/conversation/share", { id, refs });
    return resp.data;
  } catch (e) {
    return { status: false, message: (e as Error).message, data: "" };
  }
}

export async function toggleConversation(
  dispatch: AppDispatch,
  id: number,
): Promise<void> {
  return manager.toggle(dispatch, id);
}
