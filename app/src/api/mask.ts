import { CustomMask } from "@/masks/types.ts";
import axios from "axios";
import { CommonResponse } from "@/api/common.ts";
import { getErrorMessage } from "@/utils/base.ts";

type ListMaskResponse = CommonResponse & {
  data: CustomMask[];
};

export async function listMasks(): Promise<ListMaskResponse> {
  try {
    const resp = await axios.get("/conversation/mask/view");
    return (
      resp.data ?? {
        status: true,
        data: [],
      }
    );
  } catch (e) {
    return {
      status: false,
      data: [],
      error: getErrorMessage(e),
    };
  }
}

export async function saveMask(mask: CustomMask): Promise<CommonResponse> {
  try {
    const resp = await axios.post("/conversation/mask/save", mask);
    return resp.data;
  } catch (e) {
    return {
      status: false,
      error: getErrorMessage(e),
    };
  }
}

export async function deleteMask(id: number): Promise<CommonResponse> {
  try {
    const resp = await axios.post("/conversation/mask/delete", { id });
    return resp.data;
  } catch (e) {
    return {
      status: false,
      error: getErrorMessage(e),
    };
  }
}
