import { createApp } from 'vue'
import './assets/style/base.css'
import App from './App.vue'
import router from "../router";
import "./assets/script/conf"

createApp(App).use(router).mount('#app')
