import { defineStore } from "pinia";
import { getUserInfoApi,logoutApi } from "@/api/login.js";
export const useUserStore = defineStore("user", {
  // 状态
  state: () => ({
    token: "",
    userInfo: {
      nickname: "",
      avatar: "",
      id: 0,
    },
  }),

  // getters
  getters: {
    // 是否登录
    isLoggedIn: (state) => !!state.token,
    // 获取用户角色
    roles: (state) => state.userInfo.roles || [],
    // 获取用户信息
    getUserInfo: (state) => state.userInfo,
  },

  // actions
  actions: {
    // 设置token
    setToken(token) {
      this.token = token;
    },

    // 清除token
    clearToken() {
      this.token = "";
    },

    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
    },
    // 登出
    async logout() {
      try {
        await logoutApi();
        // 清除用户状态
        this.clearToken();
        this.setUserInfo({
          nickname: "",
          avatar: "",
          id: 0,
        });
      } catch (error) {
        console.error("退出失败", error);
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      if (this.userInfo.id) {
        return this.userInfo;
      }
      try {
        // 调用API获取用户信息
        const { data } = await getUserInfoApi();
        this.setUserInfo(data);
        // 返回用户信息
        return this.userInfo;
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    },
  },

  // 持久化配置
  persist: {
    // 启用持久化
    enabled: true,
    // 持久化策略
    strategies: [
      {
        // 存储的键名
        key: "user",
        // 存储的位置，可选值：localStorage、sessionStorage、cookieStorage等
        storage: localStorage,
        // 指定要持久化的字段，不写则持久化所有状态
        paths: ["token", "userInfo"],
      },
    ],
  },
});
