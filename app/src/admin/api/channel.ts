import { Channel } from "@/admin/channel.ts";
import axios from "axios";
import { getErrorMessage } from "@/utils/base.ts";
import { CommonResponse } from "@/api/common.ts";

export type ChannelListResponse = CommonResponse & {
  data: Channel[];
};

export type GetChannelResponse = CommonResponse & {
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

export async function createChannel(channel: Channel): Promise<CommonResponse> {
  try {
    const response = await axios.post("/admin/channel/create", channel);
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function updateChannel(
  id: number,
  channel: Channel,
): Promise<CommonResponse> {
  try {
    const response = await axios.post(`/admin/channel/update/${id}`, channel);
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function deleteChannel(id: number): Promise<CommonResponse> {
  try {
    const response = await axios.get(`/admin/channel/delete/${id}`);
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function activateChannel(id: number): Promise<CommonResponse> {
  try {
    const response = await axios.get(`/admin/channel/activate/${id}`);
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function deactivateChannel(id: number): Promise<CommonResponse> {
  try {
    const response = await axios.get(`/admin/channel/deactivate/${id}`);
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}
