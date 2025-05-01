<template>
  <div class="sidebar-container" :class="{ 'is-collapsed': isCollapsed }">
    <!-- <div class="sidebar-logo">
      <img src="@/assets/logo-title.png" alt="Logo" class="logo-img" />
    </div> -->
    <el-icon><icon-ep-user /></el-icon>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        router
        popper-effect="light"
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="true"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#64b36e"
        :unique-opened="true"
      >
        <template v-for="(route, index) in routerList" :key="index">
          <!-- 有子路由的菜单 -->
          <el-sub-menu v-if="route.children && route.children.length > 0" :index="route.path">
            <template #title>
              <el-icon v-if="route.meta && route.meta.icon">
                <component :is="getIconName(route.meta.icon)" />
              </el-icon>
 
              <el-icon v-else><i-ep-folder /></el-icon>
              <span>{{ route.meta?.title || '未命名菜单' }}</span>
            </template>
            
            <!-- 二级菜单 -->
            <template v-for="child in route.children" :key="child.path">
              <el-menu-item :index="child.path" class="sub-menu-item">
                <el-icon v-if="child.meta && child.meta.icon">
                  <component :is="getIconName(child.meta.icon)" />
                </el-icon>
                <el-icon v-else><i-ep-document /></el-icon>
                <template #title>{{ child.meta?.title || '未命名菜单' }}</template>
              </el-menu-item>
            </template>
          </el-sub-menu>
          
          <!-- 无子路由的菜单 -->
          <el-menu-item v-else :index="route.path">
            <el-icon v-if="route.meta && route.meta.icon">
              <component :is="getIconName(route.meta.icon)" />
            </el-icon>
            <el-icon v-else><i-ep-document /></el-icon>
            <template #title>{{ route.meta?.title || '未命名菜单' }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
    
    <div class="collapse-btn" @click="toggleSidebar">
      <el-icon :size="20">
        <i-ep-arrow-left v-if="!isCollapsed" />
        <i-ep-arrow-right v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { asyncRoutes } from '@/router/asyncRoutes'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const routerList = ref(asyncRoutes)
const appStore = useAppStore()

// 侧边栏折叠状态
const isCollapsed = computed(() => appStore.sidebarCollapsed)

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return meta.activeMenu
  }
  return path
})

// 处理图标名称，确保格式正确
const getIconName = (icon) => {
  if (!icon) return 'i-ep-document'
  
  // 如果已经是完整的图标名称（包含i-ep-前缀）
  if (icon.startsWith('i-ep-')) {
    return icon
  }
  
  // 如果是icon-ep-前缀
  if (icon.startsWith('icon-ep-')) {
    return icon.replace('icon-ep-', 'i-ep-')
  }
  
  // 处理只有图标名字的情况（如 List, Notebook 等）
  if (!icon.includes('-')) {
    return `i-ep-${icon.toLowerCase()}`
  }
  
  // 默认添加前缀
  return `i-ep-${icon}`
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 240px;
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  position: relative;
  
  &.is-collapsed {
    width: 64px;
    
    .logo-text {
      display: none;
    }
    
    .sidebar-logo {
      padding: 10px 0;
      justify-content: center;
    }
    
    .collapse-btn {
      margin-left: 18px;
    }
  }
  
  .sidebar-logo {
    height: 60px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    background-color: #263445;
    overflow: hidden;
    
    .logo-img {
      height: 100%;
      margin-right: 10px;
    }
    
    .logo-text {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
      margin-right: 10px;
    }
  }
  
  .collapse-btn {
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #1f2d3d;
    color: #bfcbd9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background-color: #409EFF;
      color: #fff;
    }
  }
}

.scrollbar-wrapper {
  flex: 1;
  overflow: hidden;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
  
  :deep {
    .el-sub-menu__title {
      &:hover {
        background-color: #263445 !important;
      }
    }
    
    .el-menu-item {
      &:hover {
        background-color: #263445 !important;
      }
      
      &.is-active {
        background-color: #263445 !important;
        
        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: #64b36e;
        }
      }
    }
    
    .sub-menu-item {
      padding-left: 50px !important;
    }
    
    .el-menu--collapse {
      width: 64px;
      
      .el-sub-menu__title span,
      .el-menu-item span {
        height: 0;
        width: 0;
        overflow: hidden;
        visibility: hidden;
        display: inline-block;
      }
    }
    
    .el-sub-menu__icon-arrow {
      right: 10px;
    }
  }
}
</style> 