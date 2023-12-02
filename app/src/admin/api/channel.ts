import { Channel } from "@/admin/channel.ts";
import axios from "axios";
import { getErrorMessage } from "@/utils/base.ts";

export type ChannelCommonResponse = {
  status: boolean;
  error: string;
};

export type ChannelListResponse = ChannelCommonResponse & {
  data: Channel[];
};

export type GetChannelResponse = ChannelCommonResponse & {
  data?: Channel;
};

export async function listChannel(): Promise<ChannelListResponse> {
  try {
    const response = await axios.get("/admin/channel/list");
    return response.data as ChannelListResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e), data: [] };
  }
}

export async function getChannel(id: number): Promise<GetChannelResponse> {
  try {
    const response = await axios.get(`/admin/channel/get/${id}`);
    return response.data as GetChannelResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function createChannel(
  channel: Channel,
): Promise<ChannelCommonResponse> {
  try {
    const response = await axios.post("/admin/channel/create", channel);
    return response.data as ChannelCommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function updateChannel(
  id: number,
  channel: Channel,
): Promise<ChannelCommonResponse> {
  try {
    const response = await axios.post(`/admin/channel/update/${id}`, channel);
    return response.data as ChannelCommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function deleteChannel(
  id: number,
): Promise<ChannelCommonResponse> {
  try {
    const response = await axios.get(`/admin/channel/delete/${id}`);
    return response.data as ChannelCommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function activateChannel(
  id: number,
): Promise<ChannelCommonResponse> {
  try {
    const response = await axios.get(`/admin/channel/activate/${id}`);
    return response.data as ChannelCommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function deactivateChannel(
  id: number,
): Promise<ChannelCommonResponse> {
  try {
    const response = await axios.get(`/admin/channel/deactivate/${id}`);
    return response.data as ChannelCommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}
