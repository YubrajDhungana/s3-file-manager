import { createWebHistory, createRouter } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";

const isAuthenticated =()=>{
    const token= localStorage.getItem('token');
    return !!token;
}

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
    history:createWebHistory(),
    routes
})

router.beforeEach((to,from,next)=>{
    if(to.name !== 'Login' && !isAuthenticated()){
        next({ name: 'Login' });
    } else {
        next();
    }
})

export default router;