import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  // 状态
  state: () => ({
    // 侧边栏折叠状态
    sidebarCollapsed: false,
    // 主题色
    themeColor: '#64b36e',
    // 语言
    language: 'zh_CN',
    // 尺寸
    size: 'default'
  }),
  
  // getters
  getters: {
    // 是否折叠侧边栏
    isSidebarCollapsed: (state) => state.sidebarCollapsed,
    // 获取主题色
    getThemeColor: (state) => state.themeColor,
    // 获取语言
    getLanguage: (state) => state.language,
    // 获取尺寸
    getSize: (state) => state.size
  },
  
  // actions
  actions: {
    // 切换侧边栏折叠状态
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    // 设置侧边栏折叠状态
    setSidebarCollapsed(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    // 设置主题色
    setThemeColor(color) {
      this.themeColor = color
    },
    
    // 设置语言
    setLanguage(language) {
      this.language = language
    },
    
    // 设置尺寸
    setSize(size) {
      this.size = size
    }
  },
  
  // 持久化配置
  persist: {
    // 启用持久化
    enabled: true,
    // 持久化策略
    strategies: [
      {
        // 存储的键名
        key: 'app_settings',
        // 存储的位置，可选值：localStorage、sessionStorage、cookieStorage等
        storage: localStorage
      }
    ]
  }
})