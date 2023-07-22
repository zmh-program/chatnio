<script setup lang="ts">
import Login from "./components/icons/login.vue";
import {auth} from "./assets/script/auth";

function goto() {
  window.location.href = "https://deeptrain.net/login?app=chatnio";
}
</script>

<template>
  <div class="card">
    <aside>
      <div class="logo">
        <img src="/favicon.ico" alt="">
        <span>Chat Nio</span>
      </div>
      <div class="grow" />
      <div class="user" v-if="auth">

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

.grow {
  flex-grow: 1;
}

.logo {
  display: flex;
  align-items: center;
  padding: 16px 18px;
  margin: 12px 48px;
  gap: 16px;
}

.logo img {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  user-select: none;
}

.logo span {
  font-size: 28px;
  user-select: none;
  white-space: nowrap;
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

@media screen and (max-width: 600px) {
  .card {
    flex-direction: column;
    box-shadow: none;
    max-height: calc(100% - 24px);
  }

  .logo span {
    display: none;
  }

  .logo {
    margin: 0 !important;
  }

  .login {
    margin-right: 16px !important;
  }

  aside {
    width: 100%;
    height: max-content;
    border-radius: 0;
    flex-direction: row;
  }

  .logo {
    margin: 12px 24px;
  }
}
</style>
