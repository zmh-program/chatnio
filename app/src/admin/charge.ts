export const tokenBilling = "token-billing";
export const timesBilling = "times-billing";
export const nonBilling = "non-billing";

export const defaultChargeType = tokenBilling;
export const chargeTypes = [nonBilling, timesBilling, tokenBilling];
export type ChargeType = (typeof chargeTypes)[number];

export type ChargeBaseProps = {
  type: string;
  anonymous: boolean;
  input: number;
  output: number;
};

export type ChargeProps = ChargeBaseProps & {
  id: number;
  models: string[];
};
