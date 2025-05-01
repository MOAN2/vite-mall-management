<script setup>
import AppTitle from './MainContent/AppTitle.vue'
import AppSection from './MainContent/AppSection.vue'
 
</script>

<template>
  <div
 
    class="breadcrumb-main"
  
  >
    <!-- <app-title /> -->
    <app-section />
  </div>
 
</template>

<style lang="scss" scoped>
.default-main,
.breadcrumb-main {
  width: 100%;
  height: 100%;
  overflow: auto;
  // padding: 20px 24px;
  box-sizing: border-box;
  padding-top: 0;
  border-radius: 6px;
  position: relative;
  background-color: #fff;
  &-custom_main {
    background-color: transparent;
  }
}

.app-main {
  // margin: 20px 24px;
  height: calc(100% - 70px);
  background-color: #ffffff;
  border-radius: 4px;
  padding: 0 20px;
  &-custom {
    padding: 0;
    height: 100%;
  }
  div:first-child {
    box-sizing: border-box;
    overflow-y: scroll;
  }
}
</style>
