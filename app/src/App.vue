<script setup lang="ts">
import Login from "./components/icons/login.vue";
import { auth, username } from "./assets/script/auth";
import Light from "./components/icons/light.vue";
import Star from "./components/icons/star.vue";
import {mobile, gpt4, list, manager} from "./assets/script/shared";
import Github from "./components/icons/github.vue";
import Heart from "./components/icons/heart.vue";
import Chat from "./components/icons/chat.vue";
import Delete from "./components/icons/delete.vue";
import { deleteConversation } from "./assets/script/api";
import {ref} from "vue";
import Close from "./components/icons/close.vue";

const current = manager.getCurrent();
const sidebar = ref(false), padding = ref(false);

function goto() {
  window.location.href = "https://deeptrain.net/login?app=chatnio";
}

function toggle(n: boolean) {
  gpt4.value = mobile.value ? !gpt4.value : n;
  if (gpt4.value && !auth.value) return goto();
}

function setSidebar(n: boolean) {
  sidebar.value = n;
  if (!n) return setTimeout(() => padding.value = false, 500);
  padding.value = n;
}

function toggleConversation(id: number) {
  manager.toggle(id);
  setSidebar(false);
}
</script>

<template>
  <div class="card">
    <aside>
      <div class="logo">
        <img src="/favicon.ico" alt="">
        <span>Chat Nio</span>
      </div>
      <div class="model-container">
        <div class="model gpt3" :class="{'active': !gpt4}" @click="toggle(false)">
          <light />
          <span>GPT-3.5</span>
        </div>
        <div class="model gpt4" :class="{'active': gpt4}" @click="toggle(true)">
          <star />
          <span>GPT-4</span>
        </div>
      </div>
      <a class="donate-container" target="_blank" href="https://zmh-program.site/donate" v-if="!auth">
        <heart />
        捐助我们
      </a>
      <div class="conversation-container" v-if="auth" :class="{'mobile': mobile, 'active': sidebar, 'padding': padding}">
        <div class="operation-wrapper" v-if="mobile">
          <div class="grow" />
          <div class="operation" @click="setSidebar(false)">
            <close />
          </div>
        </div>
        <div class="conversation"
             v-for="(conversation, idx) in list" :key="idx"
             :class="{'active': current === conversation.id}"
             @click="toggleConversation(conversation.id)"
        >
          <chat class="icon" />
          <div class="title">{{ conversation.name }}</div>
          <div class="id">{{ conversation.id }}</div>
          <delete class="delete" @click="deleteConversation(conversation.id)" />
        </div>
      </div>
      <div class="grow" />
      <div class="user" v-if="auth" @click="setSidebar(true)">
        <img class="avatar" :src="'https://api.deeptrain.net/avatar/' + username" alt="">
        <span class="username">{{ username }}</span>
      </div>
      <div class="login" v-else>
        <button @click="goto">
          <login />
          <span>登录</span>
        </button>
      </div>
    </aside>
    <div class="container">
      <router-view />
    </div>
  </div>
  <div class="copyright">
    <a href="https://github.com/zmh-program/chatnio" target="_blank"><github /> chatnio</a>
    <a href="https://deeptrain.net" target="_blank">© 2023 Deeptrain Team</a>
  </div>
</template>

<style scoped>
.card {
  position: fixed;
  display: flex;
  flex-direction: row;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--card-background);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow: 0 0 16px var(--card-shadow);
  width: calc(100% - 32px);
  height: calc(100% - 32px);
  max-width: 1200px;
  max-height: 650px;
  z-index: 1;
  overflow: hidden;
}

aside {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: var(--aside-background);
  width: max-content;
}

.user {
  display: flex;
  cursor: pointer;
  user-select: none;
  flex-direction: row;
  margin: 28px auto;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--card-input);
  border: 1px solid var(--card-input-border);
  transition: .5s;
  flex-shrink: 0;
  user-select: none;
}

.username {
  user-select: none;
  font-size: 16px;
  padding: 5px 4px;
  margin: 0 4px;
  color: var(--card-text);
  font-family: var(--fonts-code);
}

.grow {
  flex-grow: 1;
}

.logo {
  display: flex;
  align-items: center;
  padding: 16px 18px;
  margin: 12px 48px;
  gap: 14px;
}

.logo img {
  width: 42px;
  height: 42px;
  padding: 4px;
  background: rgb(30, 30, 30);
  border-radius: 12px;
  user-select: none;
}

.logo span {
  font-size: 28px;
  user-select: none;
  white-space: nowrap;
}

.model-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 4px auto;
  padding: 6px 8px;
  border-radius: 8px;
  gap: 8px;
  background: rgb(32, 33, 35);
  width: max-content;
}

.donate-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 6px auto;
  padding: 6px 8px;
  vertical-align: center;
  border-radius: 8px;
  gap: 8px;
  width: 235px;
  background: rgba(220, 119, 127, 0.25);
  transition: .25s;
  cursor: pointer;
  color: rgb(255, 110, 122);
  font-size: 16px;
  justify-content: center;
  user-select: none;
}

.donate-container:hover {
  background: rgba(255, 110, 122, .3);
}

.donate-container svg {
  width: 32px;
  height: 32px;
  stroke: rgb(255, 110, 122);
}

.conversation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 235px;
  height: 100%;
  margin: 12px auto;
  padding: 10px 12px;
  border-radius: 8px;
  gap: 8px;
  background: rgba(72, 73, 85, 0.1);
  overflow-x: hidden;
  overflow-y: auto;
  touch-action: pan-y;
  scrollbar-width: thin;
}

.conversation-container.mobile {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: rgb(32, 33, 35);
  transition: .5s;
  transition-property: width, opacity;
  z-index: -1;
  padding: 0;
  margin: 0;
  pointer-events: none;
  opacity: 0;
}

.conversation-container.padding {
  padding: 16px;
  z-index: 2;
}

.conversation-container.mobile.active {
  width: calc(100% - 32px);
  opacity: 1;
  pointer-events: all;
}

.operation-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: max-content;
}

.operation-wrapper svg {
  width: 24px;
  height: 24px;
  stroke: var(--card-text);
  cursor: pointer;
  transition: .25s;
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

.conversation {
  display: flex;
  flex-direction: row;
  width: calc(100% - 18px);
  height: 28px;
  padding: 8px 12px;
  margin: 0 16px;
  border-radius: 8px;
  background: rgba(152, 153, 165, 0.05);
  transition: .15s;
  cursor: pointer;
  user-select: none;
  vertical-align: center;
  flex-shrink: 0;
  align-items: center;
  overflow: hidden;
}

.conversation:hover {
  background: rgba(152, 153, 165, 0.2);
}

.conversation.active {
  background: rgba(152, 153, 165, 0.3);
}

.conversation .icon {
  width: 1rem;
  height: 1rem;
  stroke: var(--card-text);
  flex-shrink: 0;
  user-select: none;
  margin-left: 4px;
  margin-right: 2px;
  transform: translateY(2px);
}

.conversation .title {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  color: var(--card-text);
  user-select: none;
  margin: 0 4px;
}

.conversation .id::before {
  content: '#';
}

.conversation .id {
  width: max-content;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  color: rgb(152, 153, 165);
  user-select: none;
  margin: 0 4px;
}

.conversation:hover .id {
  display: none;
}

.conversation .delete {
  width: 1rem;
  height: 1rem;
  stroke: rgb(182, 183, 205);
  flex-shrink: 0;
  user-select: none;
  margin-left: 4px;
  margin-right: 2px;
  transform: translateY(2px);
  display: none;
  transition: .25s;
}

.conversation:hover .delete {
  display: block;
}

.model {
  display: flex;
  align-items: center;
  width: 82px;
  height: max-content;
  padding: 6px 16px;
  border-radius: 8px;
  user-select: none;
  cursor: pointer;
  gap: 4px;
  transition: .25s;
}

.model.active {
  background: var(--card-button);
}

.model.gpt3 {
  padding-left: 18px;
  padding-right: 14px;
}

.model.gpt4 {
  padding-left: 24px;
  padding-right: 8px;
}

.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 28px 8px;
}

.login button {
  display: flex;
  user-select: none;
  width: max-content;
  height: min-content;
  background: var(--card-button);
  border: 1px solid var(--card-button-hover);
  border-radius: 12px;
  color: var(--card-text);
  font-size: 18px;
  outline: none;
  transition: .5s;
}

.login button:hover {
  background: var(--card-button-hover);
}

.login button svg {
  width: 24px;
  height: 24px;
  fill: var(--card-text);
  margin-right: 8px;
}

.container {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100% - 6px);
  padding-bottom: 6px;
}

.copyright {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  bottom: 10px;
  right: 20px;
  user-select: none;
  z-index: 0;
}

.copyright a {
  color: rgba(255,255,255,0.8);
  font-size: 16px;
  text-decoration: none;
  transition: .25s;
}

.copyright a:hover {
  color: var(--card-text-hover);
}

.copyright a svg {
  width: 14px;
  height: 14px;
  fill: rgba(255,255,255,0.8);
  margin-right: 2px;
  transform: translateY(2px);
  transition: .25s;
}

.copyright a:hover svg {
  fill: var(--card-text-hover);
}

@media (max-width: 600px) {
  .container {
    max-height: calc(100% - 94px);
  }
}

@media screen and (max-width: 420px) {
  .username {
    display: none;
  }
}

@media screen and (max-width: 600px) {
  .card {
    flex-direction: column;
    box-shadow: none;
    max-height: calc(100% - 24px);
  }

  .model-container {
    flex-direction: column;
  }

  .donate-container {
    display: none;
  }

  .logo {
    display: none;
  }

  .model-container {
    margin: 0 16px 0 0;
    height: max-content;
  }

  .model {
    display: none;
  }

  .model.active {
    display: flex;
    background: none;
  }

  .username {
    margin-right: 10px;
  }

  .logo span {
    display: none;
  }

  .logo {
    margin: 0 !important;
  }

  .login {
    margin: 0 8px;
  }

  .avatar {
    margin-left: 12px;
  }

  .user {
    margin: 6px auto;
  }

  aside {
    width: 100%;
    padding: 16px 0;
    height: max-content;
    border-radius: 0;
    flex-direction: row-reverse;
  }

  .logo {
    margin: 12px 24px;
  }

  .copyright {
    display: none;
  }
}
</style>
