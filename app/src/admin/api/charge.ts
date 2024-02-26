import { CommonResponse } from "@/api/common.ts";
import { ChargeProps } from "@/admin/charge.ts";
import { getErrorMessage } from "@/utils/base.ts";
import axios from "axios";

export type ChargeListResponse = CommonResponse & {
  data: ChargeProps[];
};

export type ChargeSyncRequest = {
  overwrite: boolean;
  data: ChargeProps[];
};

export async function listCharge(): Promise<ChargeListResponse> {
  try {
    const response = await axios.get("/admin/charge/list");
    return response.data as ChargeListResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e), data: [] };
  }
}

export async function setCharge(charge: ChargeProps): Promise<CommonResponse> {
  try {
    const response = await axios.post(`/admin/charge/set`, charge);
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function deleteCharge(id: number): Promise<CommonResponse> {
  try {
    const response = await axios.get(`/admin/charge/delete/${id}`);
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}

export async function syncCharge(
  data: ChargeSyncRequest,
): Promise<CommonResponse> {
  try {
    const response = await axios.post(`/admin/charge/sync`, data);
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}
