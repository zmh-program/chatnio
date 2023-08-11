<script setup lang="ts">
import 'md-editor-v3/lib/style.css';
import Post from "../components/icons/post.vue";
import Openai from "../components/icons/openai.vue";
import { MdPreview } from 'md-editor-v3';
import {Conversation} from "../assets/script/conversation";
import {nextTick, onMounted, ref} from "vue";
import {auth, username} from "../assets/script/auth";
import Loading from "../components/icons/loading.vue";
import Bing from "../components/icons/bing.vue";

const conversation = new Conversation(1, refreshScrollbar);
const state = conversation.getState(), length = conversation.getLength(), messages = conversation.getMessages();
const input = ref("");
const inputEl = ref<HTMLElement | undefined>();
const chatEl = ref<HTMLElement | undefined>();

async function send() {
  let val = input.value.trim();
  if (val && !state.value) {
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
  const param = new URLSearchParams(window.location.search);
  const message = param.get("q");
  if (message) {
    input.value = message.trim();
    window.history.replaceState({}, "", window.location.pathname);
    send();
  }
  inputEl.value.focus();
  (inputEl.value as HTMLElement).addEventListener("keydown", async (e) => {
    if (e.key === "Enter") await send();
  });
});
</script>

<template>
  <div class="chat-wrapper" ref="chatEl">
    <div class="conversation" v-if="length">
      <template v-for="(message, index) in messages" :key="index">
        <div class="time" v-if="index === 0 || message.stamp - messages[index - 1].stamp > 10 * 60 * 1000">
          {{ message.time }}
        </div>
        <div class="message" :class="{'user': message.role === 'user'}">
          <div class="grow" v-if="message.role === 'user'"></div>
          <div class="avatar openai" :class="{'gpt4': message.gpt4}" v-else><openai /></div>
          <div class="content">
            <div v-if="message.role === 'bot' && message.keyword !== ''" class="bing">
              <bing />
              {{ message.keyword }}
            </div>
            <div class="loader" v-if="!message.content" />
            <span v-if="message.role === 'user'">{{ message.content }}</span>
            <md-preview v-model="message.content" theme="dark" v-else />
          </div>
          <div class="avatar user" v-if="message.role === 'user'">
            <img :src="'https://api.deeptrain.net/avatar/' + username" alt="" v-if="auth">
            <img src="/favicon.ico" alt="" v-else>
          </div>
        </div>
      </template>
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
      <div class="button" @click="send">
        <loading v-if="state" :loading="state" />
        <post v-else />
      </div>
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
  flex-grow: 1;
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
  height: 74px;
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

.time {
  color: var(--card-text-secondary);
  font-size: 16px;
  transform: translateY(8px);
  margin: 14px 16px 6px;
  text-align: center;
  animation: FlexInAnimationFromTop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
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
  color: var(--card-text);
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

.input .button {
  position: absolute;
  padding: 0.6em 1.2em;
  background: none;
  right: 16px;
  transform: translateY(10px);
}

.bing {
  display: inline-block;
  color: #2f7eee;
  background: #e8f2ff;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 16px;
  margin: 4px 0 6px;
  user-select: none;
  animation: FadeInAnimation .5s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
}

.bing svg {
  width: 20px;
  height: 20px;
  margin-right: 6px;
  transform: translate(3px, 3px);
}

.input .button:hover {
  cursor: pointer;
}

.input .button svg {
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

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: var(--card-input);
  border: 1px solid var(--card-input-border);
  transition: .5s;
  flex-shrink: 0;
  user-select: none;
}

.avatar.user {
  margin-left: 12px;
  background: var(--card--element);
  border: 1px solid var(--card-border);
}

.avatar.user img {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  transition: .5s;
}

.avatar.user:hover {
  border: 1px solid var(--card-border-hover);
}

.avatar.user:hover + .content {
  border: 1px solid var(--card-border-hover);
}

.avatar.user:hover + .content:hover {
  border: 1px solid var(--card-border-hover);
}

.avatar.openai {
  margin-right: 12px;
  background: var(--card--element);
  border: 1px solid var(--card-border);
}

.avatar.openai svg {
  padding: 6px;
  fill: var(--card-text);
  background: var(--card-input);
  border: 1px solid var(--card-input-border);
  transition: .5s;
}

.avatar.openai.gpt4 svg {
  fill: #FFD700;
}

.avatar.openai:hover {
  border: 1px solid var(--card-border-hover);
}

@media (max-width: 600px) {
  .preview h1 {
    font-size: 32px;
  }

  .preview h1 svg {
    width: 26px;
    height: 26px;
  }

  .message {
    flex-direction: column;
  }

  .message.user {
    flex-direction: column-reverse;
  }

  .message .avatar {
    margin: 8px auto 8px 4px;
  }

  .message.user .avatar {
    margin: 8px 4px 8px auto;
  }

  .message .content {
    margin-right: auto;
  }

  .message.user .content {
    margin-left: auto;
    margin-right: 0;
  }
}


.loader {
  border: 2px solid var(--card-text);
  border-left-color: transparent;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: RotateAnimation 1s linear infinite;
}
</style>
