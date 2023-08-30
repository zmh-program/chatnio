<script setup lang="ts">
import Back from "../components/icons/back.vue";
import Wallet from "../components/icons/wallet.vue";
import {onMounted, reactive, ref, watch} from "vue";
import Chart from "../components/icons/chart.vue";
import Draw from "../components/icons/draw.vue";
import axios from "axios";
import {username} from "../assets/script/auth";
import Gift from "../components/icons/gift.vue";
import Sale from "../components/icons/sale.vue";
import Buy from "../components/icons/buy.vue";
import {notify} from "../assets/script/notify";

const info = reactive<Record<string, any>>({
  balance: 0,
  gpt4: 0,
  dalle: 0,
});

const loading = ref(false);
const packages = reactive<Record<string, any>>({
  cert: false,
  teenager: false,
});

const form = reactive<Record<string, any>>({
  type: "dalle",
  count: 1,
});

function count(value: number, type: string): string {
  if (type === "dalle") {
    return (value * 0.1).toFixed(2);
  } else {
    if (value <= 20) return (value * 0.5).toFixed(2);
    return (20 * 0.5 + (value - 20) * 0.4).toFixed(2);
  }
}

onMounted(() => {
  axios.get("/package")
      .then((res) => {
        packages.cert = res.data.data.cert;
        packages.teenager = res.data.data.teenager;
      })
      .catch((err) => {
        console.error(err);
      });

  axios.get("/usage")
      .then((res) => {
        info.balance = res.data.balance;
        info.gpt4 = res.data.data.gpt4;
        info.dalle = res.data.data.dalle;
      })
      .catch((err) => {
        console.error(err);
      });
})

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

watch(form, () => {
  if (form.count < 0) form.count = 0;
  if (form.count > 50000) form.count = 50000;
})

function payment() {
  if (loading.value) return;
  loading.value = true;
  axios.post("/buy", {
    type: form.type,
    quota: form.count,
  })
      .then((res) => {
        if (res.data.status) {
          info.balance = res.data.balance;
          info.gpt4 = res.data.data.gpt4;
          info.dalle = res.data.data.dalle;
          notify("购买成功！稍后将刷新页面更新配额！");
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          notify("购买失败！请检查您的账户余额");
        }
      })
      .catch((err) => {
        console.error(err);
        notify("购买失败！请检查您的网络连接");
      })
      .finally(() => {
        loading.value = false;
      });
}
</script>

<template>
  <div class="page">
    <div class="wrapper">
      <div class="nav">
        <router-link to="/" class="router">
          <back class="back" />
        </router-link>
        <div class="grow" />
        <span class="title">设置</span>
        <div class="grow" />
      </div>
      <div class="body">
        <div class="subtitle">账户</div>
        <div class="row user">
          <img :src="'https://api.deeptrain.net/avatar/' + username" alt="">
          <span class="value">{{ username }}</span>
          <button @click="logout">登出</button>
        </div>
        <div class="split" />

        <div class="subtitle">配额</div>
        <div class="row">
          <wallet />
          <span class="text">余额</span>
          <span class="value money">{{ info.balance }}</span>
          <a href="https://deeptrain.lightxi.com/home/wallet" target="_blank" class="action">充值</a>
        </div>
        <div class="row">
          <chart />
          <span class="text">GPT-4</span>
          <span class="value time">{{ info.gpt4 }}</span>
        </div>
        <div class="row">
          <draw />
          <span class="text">DALL-E</span>
          <span class="value time">{{ info.dalle }}</span>
        </div>
        <div class="split" />
        <div class="subtitle">购买</div>
        <div class="buy-form">
          <div class="buy-type">
            <div class="buy-card" :class="{'select': form.type === 'dalle'}" @click="form.type = 'dalle'">
              <draw />
              <p>DALL-E</p>
              <span>0.10</span>
            </div>
            <div class="buy-card" :class="{'select': form.type === 'gpt4'}" @click="form.type = 'gpt4'">
              <chart />
              <p>GPT-4</p>
              <span>0.50</span>
            </div>
          </div>
          <div class="sale" v-if="form.type === 'gpt4'">
            <sale />
            限时优惠：单次购买 20 份额以上的 GPT-4 配额，享受 20% 折扣
          </div>
          <div class="buy-quota">
            <input type="number" v-model="form.count" class="buy-input" />
            <p class="pay-info">{{ count(form.count, form.type) }}</p>
          </div>
          <div class="buy-action" @click="payment"><buy />购买</div>
        </div>
        <div class="split" />

        <div class="subtitle">礼包</div>
        <div class="tips">tip: 首次领取后，刷新后即可领取配额</div>
        <div class="row gift">
          <span class="text">实名认证礼包</span>
          <span class="value" :class="{'success': packages.cert}">
          <gift />
        </span>
        </div>
        <div class="row gift">
          <span class="text">青少年礼包</span>
          <span class="value" :class="{'success': packages.teenager}">
          <gift />
        </span>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.page.fade-leave-active {
  transform: translateY(35px);
}
</style>
<style scoped>
.page {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: max-content;
  padding-top: 24px;
  padding-bottom: 12px;
}

.body {
  width: calc(100% - 72px);
  flex-grow: 1;
  padding: 24px 36px;
  height: max-content;
  overflow-x: hidden;
  touch-action: pan-y;
  overflow-y: auto;
  scrollbar-width: thin;
}

.grow {
  flex-grow: 1;
}

.split {
  height: 32px;
}

.buy-type {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.buy-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 4px;
  gap: 4px;
  padding: 12px 36px;
  border-radius: 8px;
  background: rgb(43, 50, 69);
  user-select: none;
  transition: .25s;
  cursor: pointer;
  border: 1px solid #3C445C;
}

.buy-card p {
  margin: 2px 0;
  padding: 0;
  letter-spacing: 1px;
  color: #fff;
}

.buy-card span {
  color: #ddd;
}

.buy-card span::before {
  content: "¥";
  margin-right: 2px;
  font-size: 12px;
  color: #eee;
}

.buy-card.select {
  background-color: #004182;
  border-color: #57ABFF;
}

.buy-card svg {
  width: 24px;
  height: 24px;
  fill: #fff;
}

.buy-quota {
  display: flex;
  flex-direction: row;
  max-width: 480px;
  align-items: center;
  gap: 12px;
}

.pay-info {
  text-align: center;
  min-width: 80px;
  font-size: 20px;
  background: rgb(2, 90, 175);
  color: #fff;
  user-select: none;
  border-radius: 8px;
  padding: 4px 12px;
}

.pay-info::before {
  content: "¥";
  margin-right: 2px;
  font-size: 12px;
  color: #eee;
}

.buy-action {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 12px 0;
  padding: 6px 16px;
  border-radius: 6px;
  background: #1b8cff;
  color: #fff;
  user-select: none;
  transition: .5s;
  cursor: pointer;
  border: 1px solid #3C445C;
  width: max-content;
}

.buy-action:hover {
  background: #007cfc;
  border-color: #57ABFF;
}

.buy-action svg {
  width: 24px;
  height: 24px;
  fill: #fff;
  margin-right: 4px;
}

.sale {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 4px 0;
  user-select: none;
}

.sale svg {
  width: 24px;
  height: 24px;
  fill: #eee;
  margin-right: 4px;
  flex-shrink: 0;
}

.buy-input {
  flex-grow: 1;
  height: 36px;
  margin: 6px 2px;
  padding: 0 12px;
  border-radius: 8px;
  background: rgb(43, 50, 69);
  border: 1px solid #3C445C;
  color: var(--card-text);
  font-size: 16px;
  outline: none;
  transition: .5s;
}

.buy-input:hover {
  border: 1px solid #57ABFF;
}

.buy-input::placeholder {
  color: var(--card-text-hover);
}

.buy-input::-webkit-outer-spin-button,
.buy-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.buy-input[type=number] {
  -moz-appearance: textfield;
}

.user {
  vertical-align: center;
  align-items: center;
}

.user img {
  width: 36px;
  height: 36px;
  border-radius: 2px;
  flex-shrink: 0;
  transform: translateY(2px);
}

.user .value {
  margin-left: 8px;
  margin-right: auto;
}

.user button {
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
  transition: .5s;
  cursor: pointer;
  margin-right: -2px;
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.user button:hover {
  background: rgba(0, 0, 0, 0.4);
}

.back {
  width: 36px;
  height: 36px;
  margin: 0 0 0 16px;
  fill: var(--card-text);
  transition: .5s;
  cursor: pointer;
  transform: translateY(4px);
}

.back:hover {
  fill: var(--card-text-hover);
}

.title {
  padding: 2px 4px;
  font-size: 24px;
  color: #fff !important;
  user-select: none;
  text-align: center;
  transform: translateX(-26px);
}

.subtitle::before {
  content: "";
  display: inline-block;
  top: 4px;
  left: -2px;
  width: 4px;
  height: 24px;
  background: #409eff;
  margin-right: 8px;
  border-radius: 2px;
  user-select: none;
  transform: translateY(6px);
}

.subtitle {
  display: inline-block;
  color: #fff;
  font-size: 20px;
  margin: 12px 0 6px;
  user-select: none;
}

.tips {
  margin: 4px;
}

.row {
  width: calc(100% - 32px);
  display: flex;
  flex-direction: row;
  margin: 12px 0;
  padding: 16px 26px;
  gap: 6px;
  user-select: none;
  background: var(--card-input);
  border-radius: 12px;
}

.row.gift .value {
  margin-right: -2px;
}
.row.gift .value.success svg {
  fill: #67C23A;
}

.row svg {
  width: 24px;
  height: 24px;
  fill: var(--card-text);
  flex-shrink: 0;
  transform: translateY(2px);
  margin: 0 4px;
}

.text {
  font-size: 18px;
  color: var(--card-text-hover);
  white-space: nowrap;
}

.value {
  font-size: 18px;
  font-weight: bold;
  color: var(--card-text);
  margin-right: 6px;
  margin-left: auto;
  white-space: nowrap;
}

.value.money::after {
  content: "¥";
  margin-left: 2px;
  font-size: 12px;
  color: #eee;
}

.value.time::after {
  content: "次";
  margin-left: 2px;
  font-size: 12px;
  color: #eee;
}

.action {
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
  transition: .5s;
  cursor: pointer;
  color: #fff;
  margin-right: -8px;
  margin-top: -4px;
  background: rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

@media (max-width: 460px) {
  .body {
    width: calc(100% - 32px);
    padding: 24px 16px;
  }

  .row {
    width: calc(100% - 42px);
    transform: translateX(-8px);
  }

  .buy-card {
    width: 100%;
  }

  .sale {
    align-items: normal;
    justify-content: center;
  }

  .sale svg {
    margin-right: 4px;
  }

  .buy-quota {
    gap: 0;
  }

  .buy-input {
    min-width: 0;
    text-align: center;
    margin: 6px 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .pay-info {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .buy-action {
    margin: 12px auto;
    min-width: 120px;
  }
}
</style>
