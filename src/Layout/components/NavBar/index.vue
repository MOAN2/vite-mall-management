<template>
  <div class="navbar">
    <!-- 左侧 Logo 区域 -->
    <div class="navbar-left">
      <div class="logo-container">
        <img class="logo" src="@/assets/logo.png" alt="Logo" />
        <h1 class="title">轻洁家政服务管理系统</h1>
      </div>
    </div>

    <!-- 右侧用户信息 -->
    <div class="navbar-right">
      <!-- 消息通知 -->
      <!-- <div class="notification">
        <el-badge :value="3" class="badge-item">
          <el-icon class="icon-item"><icon-ep-bell /></el-icon>
        </el-badge>
      </div> -->
      
      <!-- 全屏按钮 -->
      <div class="fullscreen" @click="toggleFullScreen">
        <el-tooltip content="全屏" placement="bottom">
          <el-icon class="icon-item"><i-ep-full-screen /></el-icon>
        </el-tooltip>
      </div>
      
      <!-- 用户信息下拉菜单 -->
      <el-dropdown trigger="click" class="user-dropdown">
        <div class="user-info">
          <el-avatar :size="32" :src="userInfo.avatar" class="user-avatar" />
          <div class="user-name">{{ userInfo.username }}</div>
          <el-icon class="dropdown-icon"><icon-ep-arrow-down /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleEditProfile">
              <el-icon><i-ep-user /></el-icon>
              <span>个人信息</span>
            </el-dropdown-item>
            <!-- <el-dropdown-item @click="handleSetting">
              <el-icon><i-ep-setting /></el-icon>
              <span>系统设置</span>
            </el-dropdown-item> -->
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><i-ep-switch-button /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 获取用户信息
const userInfo = computed(() => userStore.fetchUserInfo())

// 全屏切换
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

// 处理个人信息
const handleEditProfile = () => {
  ElMessage.info('跳转到个人信息页')
  router.push('/user/index')

}

// 处理系统设置
const handleSetting = () => {
  ElMessage.info('打开系统设置')
}

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout().then(() => {
      ElMessage.success('退出登录成功')
      router.push('/login')
    })
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 10;

  .navbar-left {
    display: flex;
    align-items: center;
    
    .logo-container {
      display: flex;
      align-items: center;
      
      .logo {
        height: 32px;
        margin-right: 12px;
      }
      
      .title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 0;
        white-space: nowrap;
      }
    }
  }

  .navbar-right {
    display: flex;
    align-items: center;
    
    .icon-item {
      font-size: 20px;
      color: #606266;
      cursor: pointer;
      padding: 0 12px;
      transition: color 0.3s;
      
      &:hover {
        color: #409EFF;
      }
    }
    
    .notification, .fullscreen {
      display: flex;
      align-items: center;
      margin-right: 10px;
    }
    
    .user-dropdown {
      margin-left: 10px;
      cursor: pointer;
      
      .user-info {
        display: flex;
        align-items: center;
        padding: 0 8px;
        height: 50px;
        border-radius: 4px;
        transition: background-color 0.3s;
        
        &:hover {
          background-color: #f5f7fa;
        }
        
        .user-avatar {
          margin-right: 8px;
          border: 1px solid #eee;
        }
        
        .user-name {
          font-size: 14px;
          color: #303133;
          margin-right: 4px;
        }
        
        .dropdown-icon {
          font-size: 12px;
          color: #909399;
          margin-left: 2px;
        }
      }
    }
  }
}
</style>