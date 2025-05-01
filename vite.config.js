import { defineConfig } from "vite";
import path from 'path'
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import ElementPlus from 'unplugin-element-plus/vite'

const pathSrc = path.resolve(__dirname, 'src')
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ElementPlus(),
    AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ['vue'],
        // 自动导入 ElementPlus 组件
        resolvers: [
          ElementPlusResolver(),
          // 自动导入图标组件
          IconsResolver({
            prefix: 'Icon'
          })
        ]
    }),
    Components({
      dirs: ['src/components'],
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ['ep']
        }),
        // 自动导入 Element Plus 组件
        ElementPlusResolver()
      ]
    }),
    Icons({
      autoInstall: true
    }),
  ],
  resolve: {
    alias: {
      '@': pathSrc
    }
  },
     // 引用全局 scss 变量
     css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/styles/index.scss" as *;
          `
        }
      }
    },
    // 本地代理调试
    server: {
      host: '0.0.0.0' /* 设置为0.0.0.0则所有的地址均能访问 */,
      port: 5173 /* 设置端口 */,
      proxy: {
        '/api': {
          target: 'http://119.27.183.153:8080', // 后台服务器地址
          changeOrigin: true /* 允许跨域 */,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
});
