import axios from "axios";
import { Model, Plan } from "@/api/types.tsx";
import { ChargeProps, nonBilling } from "@/admin/charge.ts";
import { getErrorMessage } from "@/utils/base.ts";

type v1Options = {
  endpoint?: string;
};

type v1Models = {
  object: string;
  data: v1ModelItem[];
};

type v1ModelItem =
  | string
  | {
      id: string;
      object: string;
      created: number;
      owned_by: string;
    };

type v1Resp<T> = {
  data: T;
  status: boolean;
  error?: string;
};

export function getV1Path(path: string, options?: v1Options): string {
  let endpoint = options && options.endpoint ? options.endpoint : "";
  if (endpoint.endsWith("/")) endpoint = endpoint.slice(0, -1);

  return endpoint + path;
}

export async function getApiModels(
  secret?: string,
  options?: v1Options,
): Promise<v1Resp<string[]>> {
  try {
    const res = await axios.get(
      getV1Path("/v1/models", options),
      secret
        ? {
            headers: {
              Authorization: `Bearer ${secret}`,
            },
          }
        : undefined,
    );

    const data = res.data as v1Models;

    // if data.data is an array of strings, we can just return it

    const models = data.data
      ? data.data.map((model) => (typeof model === "string" ? model : model.id))
      : [];

    return models.length > 0
      ? { status: true, data: models }
      : { status: false, data: [], error: "No models found" };
  } catch (e) {
    console.warn(e);
    return { status: false, data: [], error: getErrorMessage(e) };
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

export async function bindMarket(options?: v1Options): Promise<Model[]> {
  const market = await getApiMarket(options);
  const charge = await getApiCharge(options);

  market.forEach((item: Model) => {
    const instance = charge.find((i: ChargeProps) =>
      i.models.includes(item.id),
    );
    if (!instance) return;

    item.free = instance.type === nonBilling;
    item.auth = !item.free || !instance.anonymous;
    item.price = { ...instance };
  });

  return market;
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
