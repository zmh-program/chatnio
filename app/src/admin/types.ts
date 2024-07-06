export type CommonResponse = {
  status: boolean;
  message: string;
  error?: string;
};

export type InfoResponse = {
  billing_today: number;
  billing_month: number;
  subscription_count: number;
};

export type ModelChartResponse = {
  date: string[];
  value: {
    model: string;
    data: number[];
  }[];
};

export type RequestChartResponse = {
  date: string[];
  value: number[];
};

export type BillingChartResponse = {
  date: string[];
  value: number[];
};

export type ErrorChartResponse = {
  date: string[];
  value: number[];
};

export type UserTypeChartResponse = {
  total: number;
  normal: number;
  api_paid: number;
  basic_plan: number;
  standard_plan: number;
  pro_plan: number;
};

export type InvitationData = {
  code: string;
  quota: number;
  type: string;
  used: boolean;
  username: string;
  created_at: string;
  updated_at: string;
};

export type InvitationForm = {
  data: InvitationData[];
  total: number;
};

export type InvitationResponse = {
  status: boolean;
  message: string;
  data: InvitationData[];
  total: number;
};

export type Redeem = {
  code: string;
  quota: number;
  used: boolean;
  created_at: string;
  updated_at: string;
};

export type RedeemForm = {
  data: Redeem[];
  total: number;
};

export type RedeemResponse = CommonResponse & {
  data: Redeem[];
  total: number;
};

export type InvitationGenerateResponse = {
  status: boolean;
  data: string[];
  message: string;
};

export type RedeemGenerateResponse = {
  status: boolean;
  data: string[];
  message: string;
};

export type UserData = {
  id: number;
  username: string;
  email: string;
  is_banned: boolean;
  is_admin: boolean;
  quota: number;
  used_quota: number;
  is_subscribed: boolean;
  total_month: number;
  expired_at: string;
  level: number;
  enterprise: boolean;
};

export type UserForm = {
  data: UserData[];
  total: number;
};

export type UserResponse = {
  status: boolean;
  message: string;
  data: UserData[];
  total: number;
};
