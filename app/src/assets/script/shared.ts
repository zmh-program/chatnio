import {ref} from "vue";

export const mobile = ref<boolean>((document.body.clientWidth < document.body.clientHeight) && (document.body.clientWidth < 600));
export const gpt4 = ref(false);

window.addEventListener("resize", () => {
  mobile.value = (document.body.clientWidth < document.body.clientHeight) && (document.body.clientWidth < 600);
})
