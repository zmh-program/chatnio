import axios from "axios";
import { Model } from "@/api/types.ts";
import { ChargeProps } from "@/admin/charge.ts";

export async function getApiModels(): Promise<string[]> {
  try {
    const res = await axios.get("/v1/models");
    return res.data as string[];
  } catch (e) {
    console.warn(e);
    return [];
  }
}

export async function getApiMarket(): Promise<Model[]> {
  try {
    const res = await axios.get("/v1/market");
    return res.data as Model[];
  } catch (e) {
    console.warn(e);
    return [];
  }
}

export async function getApiCharge(): Promise<ChargeProps[]> {
  try {
    const res = await axios.get("/v1/charge");
    return res.data as ChargeProps[];
  } catch (e) {
    console.warn(e);
    return [];
  }
}
