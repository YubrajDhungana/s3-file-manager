// stores/auth.js
import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import api from "@/utils/api";
import { useToast } from "vue-toastification";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(null);
  const user = ref(null);
  const error = ref(null);
  const initialized = ref(false);
  const router = useRouter();
  const toast = useToast();

  const isAuthenticated = computed(() => !!token.value);
  const isSuperAdmin = computed(() => user.value?.user_type === "superadmin");

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  async function initializeAuth() {
    if (initialized.value) {
      return isAuthenticated.value;
    }

    try {
      const cookieToken = getCookie("token");
      if (cookieToken) {
        token.value = cookieToken;

        const response = await api.get("/auth/check-auth");
        if (response.data.authenticated) {
          user.value = response.data;
          initialized.value = true;
          return true;
        }
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      token.value = null;
    }

    initialized.value = true;
    return false;
  }

  async function login(credentials) {
    error.value = null;

    try {
      const response = await api.post("/auth/login", credentials);
      
      const cookieToken = getCookie("token");
      if (cookieToken) {
        token.value = cookieToken;

        const authCheck = await api.get("/auth/check-auth");
        if (authCheck.data.authenticated) {
          user.value = authCheck.data;
        }

        toast.success(response.data?.message || "Logged in successfully!");
        return true;
      }

      throw new Error("Login token not received in cookie");
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      toast.error(error.value);
      throw err;
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      user.value = null;
      token.value = null;
      initialized.value = false; // Reset initialization state
      toast.success("Logged out successfully");
      router.push("/");
    }
  }

  return {
    token,
    user,
    error,
    initialized,
    isAuthenticated,
    isSuperAdmin,
    initializeAuth,
    login,
    logout,
  };
});
