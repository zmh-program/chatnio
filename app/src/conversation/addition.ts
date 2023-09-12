import axios from "axios";

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
};

type BuySubscriptionResponse = {
  status: boolean;
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
      return { status: false, is_subscribed: false, expired: 0 };
    }
    return {
      status: resp.data.status,
      is_subscribed: resp.data.is_subscribed,
      expired: resp.data.expired,
    };
  } catch (e) {
    console.debug(e);
    return { status: false, is_subscribed: false, expired: 0 };
  }
}

export async function buySubscription(
  month: number,
): Promise<BuySubscriptionResponse> {
  try {
    const resp = await axios.post(`/subscribe`, { month });
    return resp.data as BuySubscriptionResponse;
  } catch (e) {
    console.debug(e);
    return { status: false, error: "network error" };
  }
}
