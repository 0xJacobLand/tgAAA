<!-- src/App.vue -->
<template>
  <div id="app">
    <Header />
    <!-- Здесь будет отображаться контент в зависимости от маршрута -->
    <router-view />
  </div>
</template>

<script>
import Header from './components/Header.vue'

export default {
  name: 'App',
  components: {
    Header
  }
}
</script>

<style>
/* Глобальные стили для всего приложения, если нужны */
</style>
