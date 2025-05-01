<script setup>
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'

const route = useRoute()

// 计算当前路由的标题
const currentTitle = computed(() => {
  return route.meta?.title || '页面'
})
</script>

<template>
  <div class="app-title">
    <h1 class="title-text">{{ currentTitle }}</h1>
  </div>
</template>

<style lang="scss" scoped>
.app-title {
  padding: 16px 0;
  margin-bottom: 8px;
  
  .title-text {
    font-size: 20px;
    font-weight: 600;
    color: #353e49;
    margin: 0;
  }
}
</style>