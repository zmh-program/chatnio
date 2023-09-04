import axios from "axios";
import type {ConversationInstance} from "../store/chat.ts";
import {removeHistory, setCurrent, setHistory, setMessages} from "../store/chat.ts";


export async function updateConversationList(dispatch: any): Promise<void> {
  const resp = await axios.get("/conversation/list");

  dispatch(setHistory(
    resp.data.status ?
      (resp.data.data || []) as ConversationInstance[]: []
  ));
}

export async function loadConversation(id: number): Promise<ConversationInstance> {
  const resp = await axios.get(`/conversation/load?id=${id}`);
  if (resp.data.status) return resp.data.data as ConversationInstance;
  return { id, name: "" };
}

export async function deleteConversation(dispatch: any, id: number): Promise<boolean> {
  const resp = await axios.get(`/conversation/delete?id=${id}`);
  if (!resp.data.status) return false;
  dispatch(removeHistory(id));
  return true;
}

export async function toggleConversation(dispatch: any, id: number): Promise<ConversationInstance> {
  const data = await loadConversation(id);
  dispatch(setMessages(data));
  dispatch(setCurrent(id));
  return data;
}
