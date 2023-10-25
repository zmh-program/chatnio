import axios from "axios";

export type InvitationResponse = {
  status: boolean;
  error: string;
  quota: number;
};

export async function getInvitation(code: string): Promise<InvitationResponse> {
  try {
    const resp = await axios.get(`/invite?code=${code}`);
    return resp.data as InvitationResponse;
  } catch (e) {
    console.debug(e);
    return { status: false, error: "network error", quota: 0 };
  }
}
