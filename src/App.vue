<template>
  <RouterView />
</template>

<script setup lang="ts">
// const {language} = useLanguage()
</script>

<style lang="scss">
html,
body {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

#app {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
