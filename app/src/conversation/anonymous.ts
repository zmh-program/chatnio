import axios from "axios";

export type AnonymousResponse = {
  status: boolean;
  message: string;
  keyword: string;
};

export type AnonymousProps = {
  message: string;
  web?: boolean;
};

export async function requestAnonymous(
  t: any,
  props: AnonymousProps,
): Promise<AnonymousResponse> {
  try {
    const response = await axios.post("/anonymous", props);
    return response.data as AnonymousResponse;
  } catch (error) {
    console.debug(error);
    return {
      status: false,
      message: t("request-failed"),
      keyword: "",
    } as AnonymousResponse;
  }
}
