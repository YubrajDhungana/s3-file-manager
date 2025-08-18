import { createApp } from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";
import router from "./routes";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);

//createApp(App).use(router).mount('#app')
app.use(Toast, {
  position: "top-right",
  timeout: 1500,
  closeOnClick: true,
  pauseOnHover: false,
});

app.use(router).mount("#app");
