<script setup lang="ts">
import { notifications } from "../assets/script/notify";
</script>

<template>
  <div class="notification-wrapper">
    <div class="notification" v-for="(notification, index) in notifications" :key="index" :class="{'leave': notification.leave}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M11 11h2v6h-2zm0-4h2v2h-2z"></path>
      </svg>
      <div class="content">{{ notification.content }}</div>
    </div>
  </div>
</template>

<style scoped>
.notification-wrapper {
  position: fixed;
  top: 0;
  width: 100%;
  height: max-content;
  pointer-events: none;
  z-index: 64;
  align-items: center;
  justify-content: center;
}

.notification {
  display: flex;
  flex-direction: row;
  align-items: center;
  vertical-align: center;
  justify-content: center;
  margin: 12px auto;
  width: max-content;
  min-width: 160px;
  text-align: center;
  height: min-content;
  padding: 12px 24px;
  border-radius: 8px;
  background: #202121;
  border: 1px solid #2d2d2f;
  color: #ddddde;
  font-size: 16px;
  user-select: none;
  animation: FadeInAnimation 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
}

.icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  fill: #ddddde;
  vertical-align: middle;
  user-select: none;
}

.leave {
  animation: FadeOutAnimation 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
}

@keyframes FadeInAnimation {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes FadeOutAnimation {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(12px);
  }
}
</style>
