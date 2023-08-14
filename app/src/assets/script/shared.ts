import { ref, watch } from "vue";
import type { ConversationInstance } from "./api";
import { auth } from "./auth";
import { getConversationList } from "./api";
import {Manager} from "./manager";

export const mobile = ref<boolean>((document.body.clientWidth < document.body.clientHeight) && (document.body.clientWidth < 600));
export const gpt4 = ref(false);
export const list = ref<ConversationInstance[]>([]);
export const manager = new Manager();
window.addEventListener("resize", () => {
  mobile.value = (document.body.clientWidth < document.body.clientHeight) && (document.body.clientWidth < 600);
})

watch(auth, async () => {
  if (!auth.value) return;
  list.value = await getConversationList();
});
