<script setup lang="ts">
import 'md-editor-v3/lib/style.css';
import Post from "../components/icons/post.vue";
import Openai from "../components/icons/openai.vue";
import { MdPreview } from 'md-editor-v3';
import {Conversation} from "../assets/script/conversation";
import {nextTick, onMounted, ref} from "vue";

const conversation = new Conversation(1, refreshScrollbar);
const state = conversation.getState(), length = conversation.getLength(), messages = conversation.getMessages();
const input = ref("");
const inputEl = ref<HTMLElement | undefined>();
const chatEl = ref<HTMLElement | undefined>();

async function send() {
  let val = input.value.trim();
  if (val) {
    input.value = "";
    await conversation.send(val);
  }
}

function refreshScrollbar() {
  nextTick(() => {
    if (!chatEl.value) return;
    const el = chatEl.value as HTMLElement;
    el.scrollTop = el.scrollHeight;
  })
}

onMounted(() => {
  if (!inputEl.value) return;
  (inputEl.value as HTMLElement).addEventListener("keydown", async (e) => {
    if (e.key === "Enter") await send();
  });
});
</script>

<template>
  <div class="chat-wrapper" ref="chatEl">
    <div class="conversation" v-if="length">
      <div class="message" v-for="(message, index) in messages" :key="index" :class="{'user': message.role === 'user'}">
        <div class="grow" v-if="message.role === 'user'"></div>
        <div class="content">
          <span v-if="message.role === 'user'">{{ message.content }}</span>
          <md-preview v-model="message.content" theme="dark" v-else />
        </div>
      </div>
    </div>
    <div class="preview" v-else>
      <h1><openai /> ChatGPT</h1>
      <p>👋 你好！欢迎来到 ChatNio！</p>
      <p>🧐 ChatNio 是一个 AI 聊天网站，它可以与您进行对话并提供各种功能。</p>
      <p>🎃 您可以向它提问问题、寻求建议，或者闲聊。</p>
      <p>🎈 欢迎开始与 ChatNio 展开交流！</p>
    </div>
  </div>
  <div class="input-wrapper">
    <div class="input">
      <input type="text" placeholder="写点什么" v-model="input" ref="inputEl" />
      <button @click="send"><post /></button>
    </div>
  </div>
</template>

<style scoped>
@import "../assets/style/anim.css";

.chat-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: calc(100% - 86px);
  max-height: calc(100% - 86px);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
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

.grow {
  flex-grow: 1;
}

.message {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: calc(100% - 36px);
  height: auto;
  margin: 12px 0;
  padding: 0 18px;
  animation: FlexInAnimationFromLeft 1s;
}

.message .content {
  color: var(--card-text);
  background: var(--card-input);
  border: 1px solid var(--card-input-border);
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 16px;
  outline: none;
  transition: .5s;
  text-align: left;
}

.message .content:hover {
  border: 1px solid var(--card-input-border-hover);
  color: var(--card-text-hover);
}

.message .content {
  color: var(--card-text);
}

.message.user {
  animation: FlexInAnimationFromRight 1s;
}

.message.user .content {
  background: var(--card--element);
  border: 1px solid var(--card-border);
  text-align: right;
}

.message.user .content:hover {
  border: 1px solid var(--card-border-hover);
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
