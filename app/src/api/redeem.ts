import axios from "axios";
import { getErrorMessage } from "@/utils/base.ts";

export type RedeemResponse = {
  status: boolean;
  error: string;
  quota: number;
};

export async function useRedeem(code: string): Promise<RedeemResponse> {
  try {
    const resp = await axios.get(`/redeem?code=${code}`);
    return resp.data as RedeemResponse;
  } catch (e) {
    console.debug(e);
    return {
      status: false,
      error: `network error: ${getErrorMessage(e)}`,
      quota: 0,
    };
  }
}
