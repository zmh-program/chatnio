import {createRouter, createWebHistory} from "vue-router";
import HomeView from "../src/views/HomeView.vue";
import {auth, awaitUtilSetup} from "../src/assets/script/auth";

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

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title as string;
  await awaitUtilSetup();
  if (to.name === "login" && auth.value) {
    next({ name: "index" });
    return;
  }
  next();
});

export default router;
