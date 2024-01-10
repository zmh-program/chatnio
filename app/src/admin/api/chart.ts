import {
  BillingChartResponse,
  CommonResponse,
  ErrorChartResponse,
  InfoResponse,
  InvitationGenerateResponse,
  InvitationResponse,
  ModelChartResponse,
  RedeemResponse,
  RequestChartResponse,
  UserResponse,
} from "@/admin/types.ts";
import axios from "axios";
import { getErrorMessage } from "@/utils/base.ts";

export async function getAdminInfo(): Promise<InfoResponse> {
  const response = await axios.get("/admin/analytics/info");
  if (response.status !== 200) {
    return { subscription_count: 0, billing_today: 0, billing_month: 0 };
  }

  return response.data as InfoResponse;
}

export async function getModelChart(): Promise<ModelChartResponse> {
  const response = await axios.get("/admin/analytics/model");
  if (response.status !== 200) {
    return { date: [], value: [] };
  }

  const data = response.data as ModelChartResponse;

  return {
    date: data.date,
    value: data.value || [],
  };
}

export async function getRequestChart(): Promise<RequestChartResponse> {
  const response = await axios.get("/admin/analytics/request");
  if (response.status !== 200) {
    return { date: [], value: [] };
  }

  return response.data as RequestChartResponse;
}

export async function getBillingChart(): Promise<BillingChartResponse> {
  const response = await axios.get("/admin/analytics/billing");
  if (response.status !== 200) {
    return { date: [], value: [] };
  }

  return response.data as BillingChartResponse;
}

export async function getErrorChart(): Promise<ErrorChartResponse> {
  const response = await axios.get("/admin/analytics/error");
  if (response.status !== 200) {
    return { date: [], value: [] };
  }

  return response.data as ErrorChartResponse;
}

export async function getInvitationList(
  page: number,
): Promise<InvitationResponse> {
  try {
    const response = await axios.get(`/admin/invitation/list?page=${page}`);
    return response.data as InvitationResponse;
  } catch (e) {
    return {
      status: false,
      message: getErrorMessage(e),
      data: [],
      total: 0,
    };
  }
}

export async function generateInvitation(
  type: string,
  quota: number,
  number: number,
): Promise<InvitationGenerateResponse> {
  const response = await axios.post("/admin/invitation/generate", {
    type,
    quota,
    number,
  });
  if (response.status !== 200) {
    return { status: false, data: [], message: "" };
  }

  return response.data as InvitationGenerateResponse;
}

export async function getRedeemList(): Promise<RedeemResponse> {
  const response = await axios.get("/admin/redeem/list");
  if (response.status !== 200) {
    return [];
  }

  return response.data as RedeemResponse;
}

export async function generateRedeem(
  quota: number,
  number: number,
): Promise<InvitationGenerateResponse> {
  const response = await axios.post("/admin/redeem/generate", {
    quota,
    number,
  });
  if (response.status !== 200) {
    return { status: false, data: [], message: "" };
  }

  return response.data as InvitationGenerateResponse;
}

export async function getUserList(
  page: number,
  search: string,
): Promise<UserResponse> {
  const response = await axios.get(
    `/admin/user/list?page=${page}&search=${search}`,
  );
  if (response.status !== 200) {
    return {
      status: false,
      message: "",
      data: [],
      total: 0,
    };
  }

  return response.data as UserResponse;
}

export async function quotaOperation(
  id: number,
  quota: number,
): Promise<CommonResponse> {
  const response = await axios.post("/admin/user/quota", { id, quota });
  if (response.status !== 200) {
    return { status: false, message: "" };
  }

  return response.data as CommonResponse;
}

export async function subscriptionOperation(
  id: number,
  month: number,
): Promise<CommonResponse> {
  const response = await axios.post("/admin/user/subscription", { id, month });
  if (response.status !== 200) {
    return { status: false, message: "" };
  }

  return response.data as CommonResponse;
}
