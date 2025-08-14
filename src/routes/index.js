import { createWebHistory, createRouter } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import api from "@/utils/api";

const routes = [
  {
    name: "Home",
    path: "/home",
    component: Home,
  },
  {
    name: "Login",
    path: "/",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.name === "Login" && from.name === "Home") {
    return next();
  }

  try {
    const response = await api.get("/auth/check-auth");
    const isAuthenticated = response.data.authenticated;

    if (to.name === "Login") {
      if (isAuthenticated) {
        return next({ name: "Home" });
      }

      return next();
    }

    if (to.name === "Home") {
      if (!isAuthenticated) {
        return next({ name: "Login" });
      }

      return next();
    }
    next();
  } catch (error) {
    console.error("Authentication check failed:", error);

    if (to.name === "Home") {
      return next({ name: "Login" });
    }
    next();
  }

  // if (to.name === "Login") {
  //   try {
  //     const response = await api.get("/auth/check-auth");
  //     if (response.data.authenticated) {
  //       return next({ name: "Home" });
  //     }
  //   } catch (error) {
  //     console.error("Authentication check failed:", error);
  //     next();
  //   }
  // }else if (to.name === "Home") {
  //   try {
  //     const response = await api.get("/auth/check-auth");
  //     if (!response.data.authenticated) {
  //       return next({ name: "Login" });
  //     }
  //   } catch (error) {
  //     console.error("Authentication check failed:", error);
  //     return next({ name: "Login" });
  //   }
  // }
  // next();
});

export default router;
