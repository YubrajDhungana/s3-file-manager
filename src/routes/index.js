import { createWebHistory, createRouter } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import api from "@/utils/api";

// const isAuthenticated = () => {
//   const token = localStorage.getItem("token");
//   return !!token;
// };

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
  if (to.name === "Login") {
    try {
      const response = await api.get("/auth/check-auth");
      if (response.data.authenticated) {
        return next({ name: "Home" });
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      next();
    }
  }
  next();
});

export default router;
