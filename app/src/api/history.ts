import axios from "axios";
import type { ConversationInstance } from "./types.tsx";
import { setHistory } from "@/store/chat.ts";
import { AppDispatch } from "@/store";
import { CommonResponse } from "@/api/common.ts";
import { getErrorMessage } from "@/utils/base.ts";

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

export async function deleteConversation(id: number): Promise<boolean> {
  try {
    const resp = await axios.get(`/conversation/delete?id=${id}`);
    return resp.data.status;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

export async function renameConversation(
  id: number,
  name: string,
): Promise<CommonResponse> {
  try {
    const resp = await axios.post("/conversation/rename", { id, name });
    return resp.data as CommonResponse;
  } catch (e) {
    console.warn(e);
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function deleteAllConversations(): Promise<boolean> {
  try {
    const resp = await axios.get("/conversation/clean");
    return resp.data.status;
  } catch (e) {
    console.warn(e);
    return false;
  }
}
