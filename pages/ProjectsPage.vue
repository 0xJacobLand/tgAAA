<template>
  <div class="content-row">
    <!-- График проектов справа -->
    <ProjectsChart />
  </div>
</template>

<script>
import ProjectsChart from '../components/HeatmapChart.vue'

export default {
  name: 'ProjectsContent',
  components: {
    ProjectsChart
  }
}
</script>

<style scoped>
.content-row {
  display: flex;
  gap: 20px;
  padding: 20px;
}

/* Адаптивная верстка */
@media (max-width: 1200px) {
  .content-row {
    flex-direction: column;
  }
}
</style>