<script setup lang="ts">
import {onMounted, ref} from "vue";
import axios from "axios";
import {auth, token} from "../assets/script/auth";
import router from "../../router";

const message = ref("登录中...");

onMounted(async () => {
  const url = new URL(location.href);
  const client = url.searchParams.get("token");
  if (!client) location.href = "https://deeptrain.lightxi.com/login?app=chatnio";

  try {
    const res = await axios.post("/login", {
          token: client,
        }),
        data = res.data;
    if (data.status) {
      token.value = data.token;
      auth.value = true;
      message.value = "登录成功！正在跳转中...";
      await router.push("/");
    } else {
      message.value = "登录失败！请检查您的账号授权是否过期";
    }
  } catch (e) {
    message.value = "登录失败！请检查您的网络连接";
  }
});
</script>

<template>
  <svg viewBox="25 25 50 50">
    <circle r="20" cy="50" cx="50"></circle>
  </svg>
  <span>{{ message }}</span>
</template>

<style scoped>
span {
  margin: 20px auto 16px;
  transform: translateX(4px);
  font-size: 20px;
  color: var(--card-text);
  user-select: none;
}

svg {
  width: 3.25em;
  transform-origin: center;
  animation: RotateAnimation 2s linear infinite;
  user-select: none;
}

circle {
  fill: none;
  stroke: #4a8dec;
  stroke-width: 2;
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: DashAnimation 1.5s ease-in-out infinite;
}

@keyframes DashAnimation {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35px;
  }

  100% {
    stroke-dashoffset: -125px;
  }
}
</style>
