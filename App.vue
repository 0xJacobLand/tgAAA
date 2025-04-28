<!-- src/App.vue -->
<template>
  <div id="app">
    <header>
      <h1>Telegram Analytics</h1>
    </header>
    <main>
      <ProjectsChart />
    </main>
  </div>
</template>

<script>
import ProjectsChart from './components/ProjectsChart.vue'

export default {
  name: 'App',
  components: {
    ProjectsChart
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

h1 {
  color: #2c3e50;
}

main {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}
</style>
