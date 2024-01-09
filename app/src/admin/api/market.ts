import { Model } from "@/api/types.ts";
import { CommonResponse } from "@/admin/utils.ts";
import axios from "axios";
import { getErrorMessage } from "@/utils/base.ts";

export async function updateMarket(data: Model[]): Promise<CommonResponse> {
  try {
    const resp = await axios.post("/admin/market/update", data);
    return resp.data as CommonResponse;
  } catch (e) {
    console.warn(e);
    return { status: false, error: getErrorMessage(e) };
  }
}
