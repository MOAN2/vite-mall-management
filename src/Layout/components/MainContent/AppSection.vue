<script setup>
 
</script>

<template>
  <section
    class="app-section"
   
  >
    <router-view v-slot="{ Component, route }">
      <transition :key="route.path" name="fade-transform" mode="out-in">
        <div class="app-content">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>
  </section>
</template>

<style lang="scss" scoped>
.app-section {
  // margin: 20px 24px;
  min-height: calc(100vh - 120px);
  background-color: #ffffff;
  border-radius: 4px;
  padding: 0 24px;
 
  div:first-child {
    box-sizing: border-box;
    overflow-y: scroll;
  }
  .app-content {
    height: 100%;
  }
}
</style>
