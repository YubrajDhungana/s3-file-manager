import axios from "axios";
const api = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  withCredentials: true,
});
console.log("API Base URL:", process.env.VUE_APP_BASE_URL);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
export default api;
