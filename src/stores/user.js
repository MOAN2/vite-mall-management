import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // 状态
  state: () => ({
    token: '',
    userInfo: {
      username: '',
      avatar: '',
      roles: []
    }
  }),
  
  // getters
  getters: {
    // 是否登录
    isLoggedIn: (state) => !!state.token,
    // 获取用户角色
    roles: (state) => state.userInfo.roles || [],
    // 获取用户信息
    getUserInfo: (state) => state.userInfo
  },
  
  // actions
  actions: {
    // 设置token
    setToken(token) {
      this.token = token
    },
    
    // 清除token
    clearToken() {
      this.token = ''
    },
    
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    
    // 登录
    login(loginData) {
      return new Promise((resolve, reject) => {
        // 这里应该调用真实的登录API
        // 模拟登录成功的响应
        const mockResponse = {
          token: 'mock_token_' + Date.now(),
          userInfo: {
            username: loginData.username,
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            roles: ['admin']
          }
        }
        
        // 保存token和用户信息
        this.setToken(mockResponse.token)
        this.setUserInfo(mockResponse.userInfo)
        resolve(mockResponse)
      })
    },
    
    // 登出
    logout() {
      return new Promise((resolve) => {
        // 这里应该调用真实的登出API
        // 清除用户状态
        this.clearToken()
        this.setUserInfo({
          username: '',
          avatar: '',
          roles: []
        })
        resolve()
      })
    },
    
    // 获取用户信息
    fetchUserInfo() {
      return new Promise((resolve, reject) => {
        // 这里应该调用真实的获取用户信息API
        // 模拟获取用户信息成功的响应
        if (!this.token) {
          reject(new Error('没有token，请先登录'))
          return
        }
        
        const mockUserInfo = {
          username: 'admin',
          avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roles: ['admin']
        }
        
        this.setUserInfo(mockUserInfo)
        resolve(mockUserInfo)
      })
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
        key: 'user',
        // 存储的位置，可选值：localStorage、sessionStorage、cookieStorage等
        storage: localStorage,
        // 指定要持久化的字段，不写则持久化所有状态
        paths: ['token', 'userInfo']
      }
    ]
  }
}) 