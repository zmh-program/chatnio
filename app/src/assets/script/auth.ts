import { ref, watch } from "vue";
import axios from "axios";

export const auth = ref<boolean | undefined>(undefined);
export const token = ref(localStorage.getItem("token") || "");
export const username = ref("");

watch(token, () => {
  localStorage.setItem("token", token.value);
  axios.defaults.headers.common["Authorization"] = token.value;
});
axios.defaults.headers.common["Authorization"] = token.value;

export async function awaitUtilSetup(): Promise<any> {
  if (auth.value !== undefined) return;
  if (!token.value) return (auth.value = false);
  try {
    const resp = await axios.post("/state");
    username.value = resp.data.user;
    auth.value = resp.data.status;
  } catch {
    auth.value = false;
  }
  return;
}
