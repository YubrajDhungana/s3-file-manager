import axios from "axios";
import { useToast } from "vue-toastification";
const api = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  withCredentials: true,
});
console.log("API Base URL:", process.env.VUE_APP_BASE_URL);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status !== 401) {
      const toast = useToast();
      let errorMessage = "An error occurred.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    }
    return Promise.reject(error);
  }
);
export default api;
