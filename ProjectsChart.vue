<template>
  <div class="chart-container">
    <!-- Если ещё нет проектов, показываем сообщение -->
    <div v-if="projects.length === 0">Загрузка данных...</div>
    <!-- Иначе отрисовываем столбчатую диаграмму -->
    <Bar v-else :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Filler
} from 'chart.js'

// Регистрируем необходимые модули Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Filler)

// Реактивная переменная для списка проектов
const projects = ref([])

// Реактивный объект для данных графика
const chartData = ref({
  labels: [],
  datasets: []
})

// Загрузка данных при монтировании компонента
onMounted(async () => {
  try {
    const response = await fetch('/api/projects')
    if (!response.ok) {
      throw new Error('Ошибка загрузки данных')
    }
    projects.value = await response.json()
    console.log('Полученные данные:', projects.value)
  } catch (error) {
    console.error('Ошибка получения данных:', error)
  }
})

// Наблюдаем за изменениями в "projects" и перестраиваем chartData
watch(projects, (newProjects) => {
  if (newProjects && newProjects.length > 0) {
    chartData.value = {
      labels: newProjects.map(item => item.name),
      datasets: [
        {
          label: 'Упоминания',
          backgroundColor: '#409EFF',
          data: newProjects.map(item => item.mentions)
        }
      ]
    }
  } else {
    // Если нет данных, делаем структуру пустой, чтобы избежать ошибок
    chartData.value = {
      labels: [],
      datasets: []
    }
  }
})

// Опции для диаграммы
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Статистика проектов'
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Проекты'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Количество упоминаний'
      },
      beginAtZero: true
    }
  }
}
</script>

<style scoped>
.chart-container {
  max-width: 1200px;
  height: 600px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
