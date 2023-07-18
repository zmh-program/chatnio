<script setup lang="ts">

</script>

<template>
  <div class="card">
    <aside>
      <div class="logo">
        <img src="/favicon.ico" alt="">
        <span>Chat Nio</span>
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
  height: 100vh;
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
}

.logo span {
  font-size: 28px;
  user-select: none;
  white-space: nowrap;
}

.container {
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

@media screen and (max-width: 600px) {
  .card {
    flex-direction: column;
    box-shadow: none;
    max-height: calc(100vh - 24px);
  }

  aside {
    width: 100%;
    height: max-content;
    border-radius: 0;
  }

  .logo {
    margin: 12px 24px;
  }
}
</style>
