<template>
  <div class="projects-chart">
    <h2>Статистика по проектам</h2>
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="chart-container">
      <div v-for="project in projects" :key="project.name" class="project-item">
        <div class="project-name">{{ project.name }}</div>
        <div class="project-count">{{ project.post_count }} постов</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectsChart',
  data() {
    return {
      projects: [],
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      const response = await fetch('http://localhost:8000/stats/projects')
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных')
      }
      this.projects = await response.json()
    } catch (err) {
      this.error = err.message
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.projects-chart {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.chart-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.project-item {
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
  text-align: center;
}

.project-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #2c3e50;
}

.project-count {
  color: #666;
  font-size: 0.9em;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #e74c3c;
}
</style> 