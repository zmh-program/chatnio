<script setup lang="ts">

import Send from "../src/components/icons/send.vue";
</script>

<template>
  <div class="chat-wrapper">

  </div>
  <div class="input-wrapper">
    <div class="input">
      <input type="text" placeholder="发送消息" />
      <button><send /></button>
    </div>
  </div>
</template>

<style scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: calc(100% - 86px);
}

.input-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 86px;
}

.input {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.input input {
  width: 100%;
  height: 32px;
  margin: 4px 16px;
  background: var(--card-input);
  border: 1px solid var(--card-input-border);
  border-radius: 12px;
  padding: 12px 48px 12px 18px;
  font-size: 16px;
  text-align: center;
  outline: none;
  transition: .5s;
}

.input input:hover {
  border: 1px solid var(--card-input-border-hover);
}

.input button {
  position: absolute;
  background: none;
  right: 16px;
  transform: translateY(10px);
}

.input button:hover {
  cursor: pointer;
}

.input button svg {
  width: 20px;
  height: 24px;
  transition: .4s;
  fill: var(--card-text);
}

.input button svg:hover {
  fill: var(--card-text-hover);
}
</style>
