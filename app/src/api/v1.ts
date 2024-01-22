import axios from "axios";
import { Model, Plan } from "@/api/types.ts";
import { ChargeProps } from "@/admin/charge.ts";

type v1Options = {
  endpoint?: string;
};

export function getV1Path(path: string, options?: v1Options): string {
  let endpoint = options && options.endpoint ? options.endpoint : "";
  if (endpoint.endsWith("/")) endpoint = endpoint.slice(0, -1);

  return endpoint + path;
}

export async function getApiModels(options?: v1Options): Promise<string[]> {
  try {
    const res = await axios.get(getV1Path("/v1/models", options));
    return res.data as string[];
  } catch (e) {
    console.warn(e);
    return [];
  }
}

export async function getApiPlans(options?: v1Options): Promise<Plan[]> {
  try {
    const res = await axios.get(getV1Path("/v1/plans", options));
    const plans = res.data as Plan[];
    return plans.filter((plan: Plan) => plan.level !== 0);
  } catch (e) {
    console.warn(e);
    return [];
  }
}

export async function getApiMarket(options?: v1Options): Promise<Model[]> {
  try {
    const res = await axios.get(getV1Path("/v1/market", options));
    return (res.data || []) as Model[];
  } catch (e) {
    console.warn(e);
    return [];
  }
}

export async function getApiCharge(
  options?: v1Options,
): Promise<ChargeProps[]> {
  try {
    const res = await axios.get(getV1Path("/v1/charge", options));
    return res.data as ChargeProps[];
  } catch (e) {
    console.warn(e);
    return [];
  }
}
