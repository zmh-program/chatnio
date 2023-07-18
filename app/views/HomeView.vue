<script setup lang="ts">
import Send from "../src/components/icons/send.vue";
import Openai from "../src/components/icons/openai.vue";
</script>

<template>
  <div class="chat-wrapper">
    <div class="preview">
      <h1><openai /> ChatGPT</h1>
      <p>👋 你好！欢迎来到ChatNIO！</p>
      <p>🧐 ChatNio 是一个 AI 聊天网站，它可以与您进行对话并提供各种功能。</p>
      <p>🎃 您可以向它提问问题、寻求建议，或者闲聊。</p>
      <p>🎈 欢迎开始与 ChatNio 展开交流！</p>
    </div>
  </div>
  <div class="input-wrapper">
    <div class="input">
      <input type="text" placeholder="写点什么" />
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

.preview {
  margin-top: 36px;
  text-align: center;
  user-select: none;
}

.preview h1 {
  color: var(--card-text);
}

.preview h1 svg {
  width: 42px;
  height: 42px;
  fill: var(--card-text);
  transition: .4s;
  transform: translateY(2px);
}

.preview p {
  color: var(--card-text);
  font-size: 16px;
  line-height: 1.5;
  margin: 12px 16px;
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

@media (max-width: 600px) {
  .preview h1 {
    font-size: 32px;
  }

  .preview h1 svg {
    width: 26px;
    height: 26px;
  }
}
</style>
