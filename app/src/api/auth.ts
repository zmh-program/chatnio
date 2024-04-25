import axios from "axios";
import { getErrorMessage } from "@/utils/base.ts";
import { isEmailValid } from "@/utils/form.ts";

export type LoginForm = {
  username: string;
  password: string;
};

export type DeepLoginForm = {
  token: string;
};

export type LoginResponse = {
  status: boolean;
  error: string;
  token: string;
};

export type StateResponse = {
  status: boolean;
  user: string;
  admin: boolean;
};

export type RegisterForm = {
  username: string;
  password: string;
  repassword: string;
  email: string;
  code: string;
};

export type RegisterResponse = {
  status: boolean;
  error: string;
  token: string;
};

export type VerifyForm = {
  email: string;
};

export type VerifyResponse = {
  status: boolean;
  error: string;
};

export type ResetForm = {
  email: string;
  code: string;
  password: string;
  repassword: string;
};

export type ResetResponse = {
  status: boolean;
  error: string;
};

export async function doLogin(
  data: DeepLoginForm | LoginForm,
): Promise<LoginResponse> {
  const response = await axios.post("/login", data);
  return response.data as LoginResponse;
}

export async function doState(): Promise<StateResponse> {
  const response = await axios.post("/state");
  return response.data as StateResponse;
}

export async function doRegister(
  data: RegisterForm,
): Promise<RegisterResponse> {
  try {
    const response = await axios.post("/register", data);
    return response.data as RegisterResponse;
  } catch (e) {
    return {
      status: false,
      error: getErrorMessage(e),
      token: "",
    };
  }
}

export async function doVerify(
  email: string,
  checkout?: boolean,
): Promise<VerifyResponse> {
  try {
    const response = await axios.post("/verify", {
      email,
      checkout,
    } as VerifyForm);
    return response.data as VerifyResponse;
  } catch (e) {
    return {
      status: false,
      error: getErrorMessage(e),
    };
  }
}

export async function doReset(data: ResetForm): Promise<ResetResponse> {
  try {
    const response = await axios.post("/reset", data);
    return response.data as ResetResponse;
  } catch (e) {
    return {
      status: false,
      error: getErrorMessage(e),
    };
  }
}

export async function sendCode(
  t: any,
  toast: any,
  email: string,
  checkout?: boolean,
): Promise<boolean> {
  if (email.trim().length === 0 || !isEmailValid(email)) return false;

  const res = await doVerify(email, checkout);
  if (!res.status)
    toast({
      title: t("auth.send-code-failed"),
      description: t("auth.send-code-failed-prompt", { reason: res.error }),
    });
  else
    toast({
      title: t("auth.send-code-success"),
      description: t("auth.send-code-success-prompt"),
    });

  return res.status;
}
