<script setup>
</script>

<template>
  <div class="flex-col-center page-box">
    <!-- <img
      src="@/assets/images/error/401.png"
      alt=""
      srcset=""
    /> -->
    <span class="f-s-b-16 m-t-24 m-b-8">暂无访问权限</span>
    <div class="flex-row">
      <span class="back-notice m-r-4">你可以联系管理员认证并开通访问权限</span>
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
