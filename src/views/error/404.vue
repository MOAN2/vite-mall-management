<script setup></script>

<template>
  <div class="flex-col-center page-box">
    <!-- <img src="@/assets/images/error/404.png" alt="" srcset="" /> -->
    <span class="f-s-b-16 m-t-24 m-b-8">SORRY，你的页面丢失了</span>
    <div class="flex-row">
      <span class="back-notice m-r-4">你可以立即</span>
      <el-button text @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.back-notice {
  font-size: 14px;
  color: #69718a;
}
.page-box {
  height: calc(100vh - 124px);
}
</style>
