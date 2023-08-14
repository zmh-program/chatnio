import axios from "axios";
import {list} from "./shared";

type Message = {
  content: string;
  role: string;
}

export type ConversationInstance = {
  id: number;
  name: string;
  message?: Message[];
}

export async function getConversationList(): Promise<ConversationInstance[]> {
  const resp = await axios.get("/conversation/list");
  if (resp.data.status) return resp.data.data as ConversationInstance[];
  return [];
}

export async function loadConversation(id: number): Promise<ConversationInstance> {
  const resp = await axios.get(`/conversation/load?id=${id}`);
  if (resp.data.status) return resp.data.data as ConversationInstance;
  return { id, name: "" };
}

export async function deleteConversation(id: number): Promise<boolean> {
  const resp = await axios.get(`/conversation/delete?id=${id}`);
  if (!resp.data.status) return false;
  list.value = list.value.filter((item) => item.id !== id);
  return true;
}
