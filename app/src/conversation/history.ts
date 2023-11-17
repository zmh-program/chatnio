import axios from "axios";
import type { ConversationInstance } from "./types.ts";
import { setHistory } from "@/store/chat.ts";
import { manager } from "./manager.ts";
import { AppDispatch } from "@/store";

export async function getConversationList(): Promise<ConversationInstance[]> {
  try {
    const resp = await axios.get("/conversation/list");
    return (
      resp.data.status ? resp.data.data || [] : []
    ) as ConversationInstance[];
  } catch (e) {
    console.warn(e);
    return [];
  }
}

export async function updateConversationList(
  dispatch: AppDispatch,
): Promise<void> {
  const resp = await getConversationList();
  dispatch(setHistory(resp));
}

export async function loadConversation(
  id: number,
): Promise<ConversationInstance> {
  try {
    const resp = await axios.get(`/conversation/load?id=${id}`);
    return resp.data.status
      ? (resp.data.data as ConversationInstance)
      : { id, name: "", message: [] };
  } catch (e) {
    console.warn(e);
    return { id, name: "", message: [] };
  }
}

export async function deleteConversation(
  dispatch: AppDispatch,
  id: number,
): Promise<boolean> {
  try {
    const resp = await axios.get(`/conversation/delete?id=${id}`);
    if (!resp.data.status) return false;
    await manager.delete(dispatch, id);
    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

export async function deleteAllConversations(
  dispatch: AppDispatch,
): Promise<boolean> {
  try {
    const resp = await axios.get("/conversation/clean");
    if (!resp.data.status) return false;
    await manager.deleteAll(dispatch);
    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

export async function toggleConversation(
  dispatch: AppDispatch,
  id: number,
): Promise<void> {
  return manager.toggle(dispatch, id);
}
