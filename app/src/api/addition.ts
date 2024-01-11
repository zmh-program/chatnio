import axios from "axios";
import { getErrorMessage } from "@/utils/base.ts";

type QuotaResponse = {
  status: boolean;
  error: string;
};

type PackageResponse = {
  status: boolean;
  cert: boolean;
  teenager: boolean;
};

type SubscriptionResponse = {
  status: boolean;
  is_subscribed: boolean;
  expired: number;
  enterprise?: boolean;
  usage: Record<string, number>;
  level: number;
};

type BuySubscriptionResponse = {
  status: boolean;
  error: string;
};

type ApiKeyResponse = {
  status: boolean;
  key: string;
};

type ResetApiKeyResponse = {
  status: boolean;
  key: string;
  error: string;
};

export async function buyQuota(quota: number): Promise<QuotaResponse> {
  try {
    const resp = await axios.post(`/buy`, { quota });
    return resp.data as QuotaResponse;
  } catch (e) {
    console.debug(e);
    return { status: false, error: "network error" };
  }
}

export async function getPackage(): Promise<PackageResponse> {
  try {
    const resp = await axios.get(`/package`);
    if (resp.data.status === false) {
      return { status: false, cert: false, teenager: false };
    }
    return {
      status: resp.data.status,
      cert: resp.data.data.cert,
      teenager: resp.data.data.teenager,
    };
  } catch (e) {
    console.debug(e);
    return { status: false, cert: false, teenager: false };
  }
}

export async function getSubscription(): Promise<SubscriptionResponse> {
  try {
    const resp = await axios.get(`/subscription`);
    if (resp.data.status === false) {
      return {
        status: false,
        is_subscribed: false,
        level: 0,
        expired: 0,
        usage: {},
      };
    }
    return resp.data as SubscriptionResponse;
  } catch (e) {
    console.debug(e);
    return {
      status: false,
      is_subscribed: false,
      level: 0,
      expired: 0,
      usage: {},
    };
  }
}

export async function buySubscription(
  month: number,
  level: number,
): Promise<BuySubscriptionResponse> {
  try {
    const resp = await axios.post(`/subscribe`, { level, month });
    return resp.data as BuySubscriptionResponse;
  } catch (e) {
    console.debug(e);
    return { status: false, error: "network error" };
  }
}

export async function getKey(): Promise<ApiKeyResponse> {
  try {
    const resp = await axios.get(`/apikey`);
    if (resp.data.status === false) {
      return { status: false, key: "" };
    }
    return {
      status: resp.data.status,
      key: resp.data.key,
    };
  } catch (e) {
    console.debug(e);
    return { status: false, key: "" };
  }
}

export async function regenerateKey(): Promise<ResetApiKeyResponse> {
  try {
    const resp = await axios.post(`/resetkey`);
    return resp.data as ResetApiKeyResponse;
  } catch (e) {
    console.debug(e);
    return { status: false, key: "", error: getErrorMessage(e) };
  }
}
