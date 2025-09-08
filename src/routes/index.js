import { createWebHistory, createRouter } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
// import api from "@/utils/api";
// import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/auth";
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
  const authStore = useAuthStore();
  if (!authStore.initialized) {
    await authStore.initializeAuth();
  }

  if (to.name === "Login" && authStore.isAuthenticated) {
    return next({ name: "Home" });
  }

  // if (to.name === "Login") {
  //   try {
  //     const response = await api.get("/auth/check-auth");
  //     if (response.data.authenticated) {
  //       return next({ name: "Home" });
  //     }
  //     return next();
  //   } catch (error) {
  //     console.error("Authentication check failed:", error);
  //     next();
  //   }
  // }

  if (to.name === "Home" && !authStore.isAuthenticated) {
    return next({ name: "Login" });
  }

  // if (to.name === "Home") {
  //   const toast = useToast();
  //   try {
  //     const response = await api.get("/auth/check-auth");
  //     if (response.data.authenticated) {
  //       //passing user data to home component via route meta
  //       to.meta.user = response.data;
  //       return next();
  //     }
  //     return next({ name: "Login" });
  //   } catch (error) {
  //     toast.error(error.response?.data?.message);
  //     console.error("Authentication check failed:", error);
  //     return next({ name: "Login" });
  //   }
  // }
  next();
});

export default router;
