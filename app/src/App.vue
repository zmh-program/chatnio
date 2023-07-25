<script setup lang="ts">
import Login from "./components/icons/login.vue";
import { auth, username } from "./assets/script/auth";
import Light from "./components/icons/light.vue";
import Star from "./components/icons/star.vue";
import { mobile, gpt4 } from "./assets/script/shared";


function goto() {
  window.location.href = "https://deeptrain.net/login?app=chatnio";
}

function toggle(n: boolean) {
  if (mobile.value) {
    gpt4.value = !gpt4.value;
  } else {
    gpt4.value = n;
  }

  if (gpt4.value && !auth.value) return goto();
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
      <div class="grow" />
      <div class="user" v-if="auth">
        <img class="avatar" src="https://zmh-program.site/avatar/zmh-program.webp" alt="">
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
  height: 100%;
  max-width: 1000px;
  max-height: 600px;
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
}

@media (max-width: 600px) {
  .container {
    max-height: calc(100% - 112px);
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
}
</style>
