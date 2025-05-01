import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 导入Element Plus中文语言包
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
 
// 创建pinia实例
const pinia = createPinia()
// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
 
// 配置Element Plus为中文
app.use(ElementPlus, {
  locale: zhCn
})
    
// 挂载pinia
app.use(pinia)
// 挂载路由
app.use(router)

// 挂载应用
app.mount('#app')
