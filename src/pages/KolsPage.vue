<!-- src/pages/KolsPage.vue -->
<template>
  <div class="kols-page">
    <h1>Gm, you can click on idoresearch or defigen</h1>
    <!-- Список проектов -->
    <ProjectsList />
  </div>
</template>

<script>
import ProjectsList from '../components/ProjectsList.vue'

export default {
  name: 'KolsPage',
  components: {
    ProjectsList
  }
}
</script>

<style scoped>
.kols-page {
  padding: 20px;
}
</style>