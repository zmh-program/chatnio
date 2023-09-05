import axios from "axios";

export type AnonymousResponse = {
  status: boolean;
  message: string;
  keyword: string;
}

export type AnonymousProps = {
  message: string;
  web?: boolean;
}

export async function requestAnonymous({ message }: AnonymousProps): Promise<AnonymousResponse> {
  try {
    const response = await axios.post("/anonymous", { message });
    return response.data as AnonymousResponse;
  } catch (error) {
    console.debug(error);
    return {
      status: false,
      message: "Request failed. Please check your network and try again.",
      keyword: "",
    } as AnonymousResponse;
  }
}
