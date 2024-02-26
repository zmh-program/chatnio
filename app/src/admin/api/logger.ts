import axios from "axios";
import { CommonResponse } from "@/api/common.ts";
import { getErrorMessage } from "@/utils/base.ts";

export type Logger = {
  path: string;
  size: number;
};

export async function listLoggers(): Promise<Logger[]> {
  try {
    const response = await axios.get("/admin/logger/list");
    return (response.data || []) as Logger[];
  } catch (e) {
    console.warn(e);
    return [];
  }
}

export async function getLoggerConsole(n?: number): Promise<string> {
  try {
    const response = await axios.get(`/admin/logger/console?n=${n ?? 100}`);
    return response.data.content as string;
  } catch (e) {
    console.warn(e);
    return `failed to get info from server: ${getErrorMessage(e)}`;
  }
}

export async function downloadLogger(path: string): Promise<void> {
  try {
    const response = await axios.get("/admin/logger/download", {
      responseType: "blob",
      params: { path },
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", path);
    document.body.appendChild(link);
    link.click();
  } catch (e) {
    console.warn(e);
  }
}

export async function deleteLogger(path: string): Promise<CommonResponse> {
  try {
    const response = await axios.post(`/admin/logger/delete?path=${path}`);
    return response.data as CommonResponse;
  } catch (e) {
    console.warn(e);
    return { status: false, error: getErrorMessage(e) };
  }
}
