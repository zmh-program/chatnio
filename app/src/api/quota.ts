import axios from "axios";

export async function getQuota(): Promise<number> {
  try {
    const response = await axios.get("/quota");
    if (response.data.status) {
      return response.data.quota as number;
    }
  } catch (e) {
    console.debug(e);
  }

  return NaN;
}
