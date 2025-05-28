import { createRouter, createWebHistory } from "vue-router";
import { baseRoutes } from "./baseRoutes.js";
import { asyncRoutes } from "./asyncRoutes.js";
import { useUserStore } from "@/stores/user";

// 基础路由应该放在异步路由后面，这样通配符路由才能正确捕获未匹配的路径
export const routes = [...asyncRoutes, ...baseRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 白名单路由（不需要登录就可以访问）
// router.beforeEach((to, from, next) => { console.log("路由跳转：", to.path); next(); })
const whiteList = ["/login", "/404", "/401"];

// 添加简单的路由守卫，仅在控制台输出，不阻止任何路由跳转
// router.beforeEach((to, from, next) => {
//   console.log('路由跳转：', to.path)
//   next()
// })

// 全局前置守卫，用于权限验证
router.beforeEach((to, from, next) => {
  // 获取用户store
  const userStore = useUserStore();
  // 获取token
  let token = localStorage.getItem("token");
  console.log("token:", token);
  // 判断是否有token
  if (!token && to.path !== "/login") {
    if (whiteList.includes(to.path)) {
      // 在免登录白名单中，直接进入
      next();
    } else {
      // 其他没有访问权限的页面，重定向到登录页面
      next(`/login?redirect=${to.path}`);
    }
  } else if (token && to.path == "/login") {
    next("/category/index");
  } else {
    next();
  }
});

export default router;
