export const tokenBilling = "token-billing";
export const timesBilling = "times-billing";
export const nonBilling = "non-billing";

export const defaultChargeType = tokenBilling;
export const chargeTypes = [nonBilling, timesBilling, tokenBilling];

export type ChargeProps = {
  id: number;
  models: string[];
  type: string;
  anonymous: boolean;
  input: number;
  output: number;
};
