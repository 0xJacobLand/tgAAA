<template>
  <div class="chart-wrapper">
    <div class="chart-container">
      <div class="chart-title" v-if="!projects.length">Загрузка данных...</div>
      <div class="chart-title" v-else>Projects Heatmap</div>
      <div class="chart-content" ref="chartContainer">
        <Chart
          v-if="projects.length > 0"
          ref="chartRef"
          type="treemap"
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Tooltip,
  Title,
  Legend,
  LinearScale,
  CategoryScale
} from 'chart.js'
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap'

// Регистрируем необходимые модули
ChartJS.register(
  LinearScale,
  CategoryScale,
  Tooltip,
  Title,
  Legend,
  TreemapController,
  TreemapElement
)

const projects = ref([])
const hoveredProject = ref(null)
const chartRef = ref(null)
const chartContainer = ref(null)

const chartData = ref({
  datasets: [
    {
      label: 'Проекты',
      tree: [],
      key: 'mentions',
      backgroundColor: (ctx) => {
        const value = ctx.raw?.v || 0
        const max = projects.value.length
          ? Math.max(...projects.value.map(p => p.mentions))
          : 1
        const intensity = value / max
        
        // Постоянный цвет без изменения при наведении
        return `rgba(66, 133, 244, ${0.5 + intensity * 0.5})`
      },
      borderWidth: 1,
      borderColor: 'white',
      spacing: 1,
      treeLeafLabels: false,
      groups: ['name'],
      captions: {
        display: false
      }
    }
  ]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: false,
    },
    legend: { display: false },
    tooltip: { 
      enabled: false // Отключаем встроенный тултип
    }
  },
  layout: {
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    }
  },
  // Добавляем опцию для взаимодействия с мышью
  events: ['mousemove', 'mouseout', 'click'],
  // Меняем только курсор при наведении (без изменения цвета)
  onHover: (event, elements) => {
    const canvas = event.chart.canvas;
    if (elements && elements.length) {
      canvas.style.cursor = 'pointer';
      // Больше не устанавливаем hoveredProject, чтобы блок не менял цвет
    } else {
      canvas.style.cursor = 'default';
    }
  }
}

// Обработка кликов по канвасу напрямую
const setupClickHandler = () => {
  if (!chartRef.value || !chartRef.value.chart || !chartRef.value.chart.canvas) {
    console.error('Chart canvas not found');
    return;
  }
  
  // Получаем канвас
  const canvas = chartRef.value.chart.canvas;
  
  // Добавляем прямой обработчик клика
  canvas.addEventListener('click', (e) => {
    const chart = chartRef.value.chart;
    
    // Получаем элементы под курсором
    const elements = chart.getElementsAtEventForMode(
      e,
      'nearest',
      { intersect: true },
      false
    );
    
    if (elements.length > 0) {
      const index = elements[0].index;
      const dataset = chart.data.datasets[0];
      const projectName = dataset.tree[index]?.name;
      
      console.log('Клик по проекту:', projectName);
      
      if (projectName) {
        // Формируем URL и перенаправляем
        const url = `/projects/${projectName.toLowerCase()}`;
        console.log('Переход по ссылке:', url);
        window.location.href = url;
      }
    }
  });
}

// Загрузка проектов
onMounted(async () => {
  try {
    const response = await fetch('/api/projects')
    if (!response.ok) throw new Error('Ошибка загрузки данных')
    projects.value = await response.json()
  } catch (err) {
    console.error(err)
    // Заглушка с большим количеством проектов
    projects.value = [
      { name: 'Kaito', mentions: 3 },
      { name: 'IQ', mentions: 2 },
      { name: 'Berachain', mentions: 1 },
      { name: 'Eclipse', mentions: 1 },
      { name: 'Initia', mentions: 1 },
      { name: 'Monad', mentions: 1 },
      { name: 'Multipli', mentions: 1 },
      { name: 'OG', mentions: 1 },
      { name: 'Sui', mentions: 1 },
      { name: 'ZKsync', mentions: 1 },
      { name: 'Linea', mentions: 1 },
      { name: 'Starknet', mentions: 1 },
      { name: 'Blast', mentions: 1 },
      { name: 'Polygon', mentions: 1 },
      { name: 'Scroll', mentions: 1 },
      { name: 'Base', mentions: 1 }
    ]
  }
  
  // После загрузки данных и рендеринга графика настраиваем обработчик кликов
  // Используем setTimeout для уверенности, что graf уже отрендерился
  setTimeout(() => {
    setupClickHandler()
  }, 500)
})

// Формируем дерево и сортируем
watch(projects, (newProjects) => {
  // Сортируем проекты по количеству упоминаний (по убыванию)
  const sortedProjects = [...newProjects].sort((a, b) => b.mentions - a.mentions)
  
  // Обновляем данные для treemap с отсортированными проектами
  chartData.value.datasets[0].tree = sortedProjects.map(p => ({
    name: p.name,
    mentions: p.mentions,
    v: p.mentions
  }))
})

// Оптимизированный плагин для отрисовки лейблов
const labelPlugin = {
  id: 'treeMapLabels',
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    
    meta.data.forEach((item, index) => {
      const dataset = chart.data.datasets[0];
      if (!dataset.tree || !dataset.tree[index]) return;
      
      const raw = dataset.tree[index];
      
      // Получаем размеры и координаты блока
      const { x, y, width, height } = item;
      
      // Пропускаем слишком маленькие блоки
      if (width < 25 || height < 25) return;
      
      // Супер-адаптивный размер шрифта для маленьких блоков
      const fontSize = Math.max(8, Math.min(width / 15, height / 6));
      
      // Настраиваем стиль текста
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Определяем что показывать
      const name = raw.name;
      const mentions = raw.mentions || raw.v;
      
      // Выделяем блок, если на него наведен курсор
      const isHovered = hoveredProject.value === name;
      
      // Адаптивное отображение в зависимости от размера
      if (width < 60 || height < 40) {
        // Компактный режим - только имя в одну строку
        const displayName = width < 50 ? name.substring(0, 6) + (name.length > 6 ? '..' : '') : name;
        
        // Фон для текста - НЕ меняем при наведении, чтобы не было эффекта подсказки
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const textWidth = ctx.measureText(displayName).width;
        const padding = 3;
        
        ctx.fillRect(
          x + width / 2 - textWidth / 2 - padding,
          y + height / 2 - fontSize / 2 - padding,
          textWidth + padding * 2,
          fontSize + padding * 2
        );
        
        // Текст
        ctx.fillStyle = 'white';
        ctx.fillText(displayName, x + width / 2, y + height / 2);
      } else {
        // Стандартный режим - имя и упоминания
        // Определяем содержимое
        const displayName = name;
        const mentionsText = `${mentions}`;
        
        // Фон - НЕ меняем при наведении
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const nameWidth = ctx.measureText(displayName).width;
        const mentionsWidth = ctx.measureText(mentionsText).width;
        const maxWidth = Math.max(nameWidth, mentionsWidth);
        const padding = 4;
        
        const bgHeight = fontSize * 2.2;
        ctx.fillRect(
          x + width / 2 - maxWidth / 2 - padding,
          y + height / 2 - bgHeight / 2,
          maxWidth + padding * 2,
          bgHeight
        );
        
        // Текст
        ctx.fillStyle = 'white';
        ctx.fillText(displayName, x + width / 2, y + height / 2 - fontSize * 0.5);
        ctx.fillText(mentionsText, x + width / 2, y + height / 2 + fontSize * 0.5);
      }
    });
  }
};

// Регистрируем плагин
ChartJS.register(labelPlugin);
</script>
<style scoped>
/* Обертка для правильного позиционирования */
.chart-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
  box-sizing: border-box;
}

.chart-container {
  width: 80%;
  max-width: 960px;
  height: 600px;
  padding: 16px;
  background-color: #e4e7f0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  box-sizing: border-box;
  overflow: hidden; /* Предотвращает выход контента за пределы */
}

.chart-title {
  color: #000000;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding: 0;
  text-align: left;
  width: 100%;
}

.chart-content {
  width: 100%;
  height: calc(100% - 40px); /* Вычитаем высоту заголовка и отступы */
  position: relative;
  overflow: hidden; /* Предотвращает выход графика за пределы */
}

@media (max-width: 1200px) {
  .chart-container {
    width: 90%;
  }
  
  .chart-wrapper {
    padding-right: 10px;
  }
}
</style>