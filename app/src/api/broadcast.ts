import axios from "axios";
import { getMemory, setMemory } from "@/utils/memory.ts";

export type Broadcast = {
  content: string;
  index: number;
};

export type BroadcastInfo = Broadcast & {
  poster: string;
  created_at: string;
};

export type BroadcastListResponse = {
  data: BroadcastInfo[];
};

export type CreateBroadcastResponse = {
  status: boolean;
  error: string;
};

export async function getRawBroadcast(): Promise<Broadcast> {
  try {
    const data = await axios.get("/broadcast/view");
    if (data.data) return data.data as Broadcast;
  } catch (e) {
    console.warn(e);
  }

  return {
    content: "",
    index: 0,
  };
}

export async function getBroadcast(): Promise<string> {
  const data = await getRawBroadcast();
  const content = data.content.trim();
  const index = data.index.toString();

  if (content.length === 0) return "";

  const memory = getMemory("broadcast");
  if (memory === index) return "";

  setMemory("broadcast", index);
  return content;
}

export async function getBroadcastList(): Promise<BroadcastInfo[]> {
  try {
    const resp = await axios.get("/broadcast/list");
    const data = resp.data as BroadcastListResponse;
    return data.data || [];
  } catch (e) {
    console.warn(e);
    return [];
  }
}

export async function createBroadcast(
  content: string,
): Promise<CreateBroadcastResponse> {
  try {
    const resp = await axios.post("/broadcast/create", { content });
    return resp.data as CreateBroadcastResponse;
  } catch (e) {
    console.warn(e);
    return {
      status: false,
      error: (e as Error).message,
    };
  }
}
