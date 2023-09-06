import axios from "axios";
import type { ConversationInstance } from "./types.ts";
import { setHistory } from "../store/chat.ts";
import { manager } from "./manager.ts";

export async function updateConversationList(dispatch: any): Promise<void> {
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
  dispatch: any,
  id: number,
): Promise<boolean> {
  const resp = await axios.get(`/conversation/delete?id=${id}`);
  if (!resp.data.status) return false;
  await manager.delete(dispatch, id);
  return true;
}

export async function toggleConversation(
  dispatch: any,
  id: number,
): Promise<void> {
  return manager.toggle(dispatch, id);
}
