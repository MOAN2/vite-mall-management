<script setup>
import NavBar from './components/NavBar/index.vue'
import AppMain from './components/AppMain.vue'
 
</script>

<template>
  <div class="app-wrapper">
    <nav-bar>
       
    </nav-bar>
    <div   class="sidebar-main-container page-main">
      <app-main />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
 
  position: relative;
  height: 100%;
  width: 100%;
}

.page-main {
  height: calc(100vh - 88px) !important;
  margin-left: 144px !important;
  padding-right: 144px !important;
}
</style>
