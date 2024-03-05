import { Plan } from "@/api/types.tsx";
import axios from "axios";
import { CommonResponse } from "@/api/common.ts";
import { getErrorMessage } from "@/utils/base.ts";
import { getApiPlans } from "@/api/v1.ts";

export type PlanConfig = {
  enabled: boolean;
  plans: Plan[];
};

export async function getPlanConfig(): Promise<PlanConfig> {
  try {
    const response = await axios.get("/admin/plan/view");
    const conf = response.data as PlanConfig;
    conf.plans = (conf.plans || []).filter((item) => item.level > 0);
    if (conf.plans.length === 0)
      conf.plans = [1, 2, 3].map(
        (level) => ({ level, price: 0, items: [] }) as Plan,
      );
    return conf;
  } catch (e) {
    console.warn(e);
    return { enabled: false, plans: [] };
  }
}

export async function getExternalPlanConfig(
  endpoint: string,
): Promise<PlanConfig> {
  const response = await getApiPlans({ endpoint });
  return { enabled: response.length > 0, plans: response };
}

export async function setPlanConfig(
  config: PlanConfig,
): Promise<CommonResponse> {
  try {
    const response = await axios.post(`/admin/plan/update`, config);
    return response.data as CommonResponse;
  } catch (e) {
    return { status: false, error: getErrorMessage(e) };
  }
}
