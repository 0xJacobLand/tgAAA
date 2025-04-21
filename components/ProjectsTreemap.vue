<template>
  <div class="chart-container">
    <!-- Если данные ещё не загружены, показываем сообщение -->
    <div v-if="projects.length === 0">Загрузка данных...</div>
    <!-- Если данные есть, отрисовываем столбчатую диаграмму -->
    <v-chart
      v-else
      :options="chartOptions"
      style="width: 100%; height: 600px;"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import VChart from 'vue-echarts'

// Импорт необходимых модулей из ECharts
import { use } from 'echarts/core'
import { Title, Tooltip, Legend, CategoryScale, LinearScale } from 'echarts/components'
import { BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

// Регистрируем модули для отрисовки диаграммы
use([CanvasRenderer, Title, Tooltip, Legend, CategoryScale, LinearScale, BarChart])

// Реактивная переменная для хранения данных из API
const projects = ref([])

// Загружаем данные с API при монтировании компонента
onMounted(async () => {
  try {
    const response = await fetch('/api/projects')
    if (!response.ok) throw new Error('Ошибка загрузки данных')
    projects.value = await response.json()
    console.log('Полученные данные:', projects.value)
  } catch (error) {
    console.error('Ошибка получения данных:', error)
  }
})

// Вычисляемое свойство для построения опций столбчатой диаграммы
const chartOptions = computed(() => ({
  title: {
    text: 'Статистика проектов (Bar Chart)',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  xAxis: {
    type: 'category',
    data: projects.value.map(item => item.name),
    axisLabel: {
      rotate: 45,
      interval: 0
    }
  },
  yAxis: {
    type: 'value',
    min: 0
  },
  series: [
    {
      name: 'Упоминания',
      type: 'bar',
      data: projects.value.map(item => item.mentions),
      itemStyle: {
        color: '#409EFF'
      }
    }
  ]
}))
</script>

<style scoped>
.chart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
