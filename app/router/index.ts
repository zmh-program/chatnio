import {createRouter, createWebHistory} from "vue-router";
import HomeView from "../src/views/HomeView.vue";

const router = createRouter({  //@ts-ignore
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "index",
      component: HomeView,
      meta: {
        title: "Chat Nio",
      },
    }, {
      path: "/login",
      name: "login",
      component: () => import("../src/views/LoginView.vue"),
      meta: {
        title: "Login | Chat Nio",
      }
    }
  ],
});

export default router;
