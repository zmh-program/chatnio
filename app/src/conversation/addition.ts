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
