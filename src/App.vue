<script setup>
  import ThemeToggle from "./components/ThemeToggle.vue"
</script>

<template>
  <div id="app">
    <router-view />
    <ThemeToggle />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
}
</style>
