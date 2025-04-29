<template>
  <div class="chart-container">
    <canvas ref="chartCanvas" class="chart-canvas"></canvas>
    <div v-if="activePoint" class="tooltip" :style="tooltipStyle">
      <div class="tooltip-date">{{ activePoint.date }}</div>
      <div class="tooltip-value">{{ formatNumber(activePoint.value) }} подписчиков</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';

export default {
  name: 'SimpleSubscribersChart',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    console.log('------------------------');
    console.log('SimpleSubscribersChart received data:', props.data);
    if (props.data && props.data.length > 0) {
      console.log('First data point:', props.data[0]);
      console.log('Last data point:', props.data[props.data.length - 1]);
      
      // Check the years in the data
      const years = new Set();
      props.data.forEach(item => {
        if (item.date) {
          const dateParts = item.date.split(' ');
          const year = dateParts[dateParts.length - 1];
          years.add(year);
        }
      });
      console.log('Years in the data:', Array.from(years).sort());
    }
    console.log('------------------------');
    
    const chartCanvas = ref(null);
    const activePoint = ref(null);
    const mousePosition = ref({ x: 0, y: 0 });
    const points = ref([]);
    
    const tooltipStyle = computed(() => {
      return {
        left: `${mousePosition.value.x + 10}px`,
        top: `${mousePosition.value.y + 10}px`
      };
    });
    
    const formatNumber = (num) => {
      return new Intl.NumberFormat('ru-RU').format(num);
    };
    
    const drawChart = () => {
      const canvas = chartCanvas.value;
      if (!canvas || props.data.length === 0) return;
      
      const ctx = canvas.getContext('2d');
      const data = props.data;
      
      // Получаем размеры canvas в соответствии с размерами контейнера
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Отступы
      const padding = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
      };
      
      // Область графика
      const chartArea = {
        x: padding.left,
        y: padding.top,
        width: canvas.width - padding.left - padding.right,
        height: canvas.height - padding.top - padding.bottom
      };
      
      // Находим минимальное и максимальное значение для оси Y
      const values = data.map(item => item.value);
      const minValue = Math.min(...values) * 0.9;
      const maxValue = Math.max(...values) * 1.05;
      
      // Рисуем осевые линии
      ctx.beginPath();
      ctx.strokeStyle = '#e0e0e0';
      ctx.moveTo(chartArea.x, chartArea.y);
      ctx.lineTo(chartArea.x, chartArea.y + chartArea.height);
      ctx.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
      ctx.stroke();
      
      // Рисуем горизонтальные линии сетки
      const ySteps = 5;
      ctx.beginPath();
      ctx.strokeStyle = '#f0f0f0';
      ctx.setLineDash([2, 2]);
      for (let i = 0; i < ySteps; i++) {
        const y = chartArea.y + (chartArea.height / ySteps) * i;
        ctx.moveTo(chartArea.x, y);
        ctx.lineTo(chartArea.x + chartArea.width, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Рисуем метки осей Y с красивыми округленными значениями
      ctx.fillStyle = '#8b95b0';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      
      // Находим красивые округленные значения для оси Y
      const valueRange = maxValue - minValue;
      const step = valueRange / ySteps;
      
      // Определяем шаг округления в зависимости от диапазона
      let roundingFactor;
      if (step > 100000) roundingFactor = 10000;
      else if (step > 10000) roundingFactor = 5000;
      else if (step > 5000) roundingFactor = 1000;
      else if (step > 1000) roundingFactor = 500;
      else roundingFactor = 100;
      
      for (let i = 0; i <= ySteps; i++) {
        // Вычисляем значение
        let value = maxValue - ((maxValue - minValue) / ySteps) * i;
        // Округляем до ближайшего красивого числа
        value = Math.round(value / roundingFactor) * roundingFactor;
        
        // Рисуем значение на оси Y
        const y = chartArea.y + (chartArea.height / ySteps) * i;
        
        // Форматируем значение компактно (например, 70K вместо 70,000)
        let formattedValue;
        if (value >= 1000) {
          formattedValue = (value / 1000).toFixed(0) + 'K';
        } else {
          formattedValue = value.toString();
        }
        
        ctx.fillText(formattedValue, chartArea.x - 5, y + 3);
      }
      
      // Рисуем линию графика с градиентом и заливкой
      const pointsArray = [];
      
      // Создаем градиент для заливки под линией
      const gradient = ctx.createLinearGradient(0, chartArea.y, 0, chartArea.y + chartArea.height);
      gradient.addColorStop(0, 'rgba(66, 133, 244, 0.2)');
      gradient.addColorStop(1, 'rgba(66, 133, 244, 0.0)');
      
      // Начинаем путь для заливки
      ctx.beginPath();
      ctx.moveTo(chartArea.x, chartArea.y + chartArea.height);
      
      // Собираем точки для контура
      data.forEach((item, index) => {
        const x = chartArea.x + (index / (data.length - 1)) * chartArea.width;
        const yRatio = (item.value - minValue) / (maxValue - minValue);
        const y = chartArea.y + chartArea.height - (yRatio * chartArea.height);
        
        ctx.lineTo(x, y);
        
        // Сохраняем координаты точек для интерактивности
        pointsArray.push({
          x,
          y,
          date: item.date,
          value: item.value
        });
      });
      
      // Замыкаем путь для заливки
      ctx.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
      ctx.closePath();
      
      // Заливаем область под графиком
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Рисуем саму линию графика
      ctx.beginPath();
      data.forEach((item, index) => {
        const point = pointsArray[index];
        
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      
      ctx.strokeStyle = '#4285f4';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Рисуем точки с обводкой
      pointsArray.forEach((point) => {
        ctx.beginPath();
        // Рисуем обводку (внешний круг)
        ctx.fillStyle = '#ffffff';
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Рисуем внутренний круг
        ctx.beginPath();
        ctx.fillStyle = '#4285f4';
        ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Сохраняем точки для интерактивности
      points.value = pointsArray;
      
      // Рисуем метки по оси X (только годы)
      ctx.fillStyle = '#8b95b0';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      // Группируем точки по годам
      const yearGroups = {};
      
      data.forEach((item, index) => {
        const dateParts = item.date.split(' ');
        const year = dateParts[dateParts.length - 1]; // Последняя часть - год
        
        if (!yearGroups[year]) {
          yearGroups[year] = [];
        }
        
        yearGroups[year].push({
          index,
          point: pointsArray[index]
        });
      });
      
      // Определяем средние точки для каждого года
      Object.keys(yearGroups).forEach(year => {
        const yearPoints = yearGroups[year];
        const middlePointIndex = Math.floor(yearPoints.length / 2);
        const pointForYear = yearPoints[middlePointIndex].point;
        
        // Рисуем год
        ctx.fillText(year, pointForYear.x, chartArea.y + chartArea.height + 15);
        
        // Добавляем вертикальную линию для визуального разделения годов (кроме первого)
        if (year !== Object.keys(yearGroups)[0]) {
          const firstPointOfYear = yearGroups[year][0].point;
          ctx.beginPath();
          ctx.strokeStyle = '#e0e0e0';
          ctx.setLineDash([2, 2]);
          ctx.moveTo(firstPointOfYear.x, chartArea.y);
          ctx.lineTo(firstPointOfYear.x, chartArea.y + chartArea.height);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    };
    
    const handleMouseMove = (event) => {
      const canvas = chartCanvas.value;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      mousePosition.value = { x, y };
      
      // Проверяем, находится ли курсор рядом с какой-либо точкой
      const closestPoint = findClosestPoint(x, y);
      activePoint.value = closestPoint;
    };
    
    const handleMouseLeave = () => {
      activePoint.value = null;
    };
    
    const findClosestPoint = (x, y) => {
      if (points.value.length === 0) return null;
      
      let closestPoint = null;
      let minDistance = Infinity;
      
      points.value.forEach(point => {
        const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      });
      
      // Только если курсор находится достаточно близко к точке (20 пикселей)
      return minDistance < 20 ? closestPoint : null;
    };
    
    onMounted(() => {
      drawChart();
      
      window.addEventListener('resize', drawChart);
      
      if (chartCanvas.value) {
        chartCanvas.value.addEventListener('mousemove', handleMouseMove);
        chartCanvas.value.addEventListener('mouseleave', handleMouseLeave);
      }
    });
    
    watch(() => props.data, () => {
      drawChart();
    }, { deep: true });
    
    return {
      chartCanvas,
      activePoint,
      tooltipStyle,
      formatNumber
    };
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 180px;
  position: relative;
  border-radius: 8px;
  background-color: #fafcff;
  padding: 10px;
  box-sizing: border-box;
}

.chart-canvas {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.tooltip {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
  pointer-events: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.tooltip-date {
  font-size: 12px;
  color: #8b95b0;
  margin-bottom: 5px;
}

.tooltip-value {
  font-size: 14px;
  font-weight: 600;
  color: #4285f4;
}
</style>