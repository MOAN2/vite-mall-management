<template>
  <div class="no-auth-container">
    <router-view />
  </div>
</template>

<script setup>
// 无权限页面组件，直接显示子路由内容
// 主要用于404、401等错误页面的展示
</script>

<style lang="scss" scoped>
.no-auth-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  overflow: hidden;
}
</style>
