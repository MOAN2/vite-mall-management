<script setup>
import NavBar from './components/NavBar/index.vue'
import SidebarMenu from './components/Sidebar/SidebarMenu.vue'
import AppMain from './components/AppMain.vue'
import { useAppStore } from '@/stores/app'
import { computed } from 'vue'

// 获取侧边栏折叠状态
const appStore = useAppStore()
const isCollapsed = computed(() => appStore.sidebarCollapsed)
</script>

<template>
  <div class="app-wrapper">
    <!-- 顶部导航栏 -->
    <nav-bar class="navbar" />
    
    <!-- 左侧侧边栏 -->
    <div class="main-container" :class="{ 'is-collapsed': isCollapsed }">
      <sidebar-menu class="sidebar-container" />
      
      <!-- 右侧主体内容区 -->
      <div class="main-content">
        <app-main />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.main-container {
  position: absolute;
  top: 56px; // 导航栏高度
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  transition: padding-left 0.3s;
  padding-left: 240px; // 侧边栏宽度
  
  &.is-collapsed {
    padding-left: 64px; // 折叠后的侧边栏宽度
  }
}

.sidebar-container {
  position: fixed;
  left: 0;
  top: 56px; // 导航栏高度
  bottom: 0;
  z-index: 998;
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 10px;
  box-sizing: border-box;
  background-color: #f5f7fa;
}
</style>