<template>
  <div class="chart-wrapper">
    <svg ref="chartRef" class="views-chart"></svg>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';

export default {
  name: 'SimpleViewsChart',
  props: {
    data: {
      type: Array,
      required: true
    },
    height: {
      type: Number,
      default: 200
    },
    lineColor: {
      type: String,
      default: '#EA4335' // Красный цвет для отличия от графика подписчиков
    },
    areaColor: {
      type: String,
      default: 'rgba(234, 67, 53, 0.1)' // Полупрозрачный красный
    }
  },
  setup(props) {
    const chartRef = ref(null);
    
    const createChart = () => {
      if (!props.data || props.data.length === 0 || !chartRef.value) return;
      
      const svg = chartRef.value;
      svg.innerHTML = '';
      
      // Устанавливаем размеры графика
      const width = svg.clientWidth;
      const height = props.height;
      const padding = { top: 20, right: 15, bottom: 20, left: 40 };
      
      // Определяем максимальное значение для шкалы Y
      const maxValue = Math.max(...props.data.map(d => d.value)) * 1.1; // +10% для отступа сверху
      
      // Функции масштабирования
      const xScale = index => (width - padding.left - padding.right) * (index / (props.data.length - 1)) + padding.left;
      const yScale = value => height - padding.bottom - (height - padding.top - padding.bottom) * (value / maxValue);
      
      // Создаем линию графика
      let pathD = '';
      props.data.forEach((point, index) => {
        const x = xScale(index);
        const y = yScale(point.value);
        
        if (index === 0) {
          pathD += `M ${x},${y}`;
        } else {
          pathD += ` L ${x},${y}`;
        }
      });
      
      // Создаем область под линией
      let areaD = pathD;
      areaD += ` L ${xScale(props.data.length - 1)},${height - padding.bottom} L ${xScale(0)},${height - padding.bottom} Z`;
      
      // Создаем элементы SVG
      // Область под линией
      const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      area.setAttribute('d', areaD);
      area.setAttribute('fill', props.areaColor);
      area.setAttribute('stroke', 'none');
      svg.appendChild(area);
      
      // Линия графика
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', props.lineColor);
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
      
      // Добавляем точки данных
      props.data.forEach((point, index) => {
        const x = xScale(index);
        const y = yScale(point.value);
        
        // Создаем точку
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 3);
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('stroke', props.lineColor);
        circle.setAttribute('stroke-width', '1.5');
        svg.appendChild(circle);
        
        // Создаем текст подсказки
        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        tooltip.textContent = `${point.date}: ${new Intl.NumberFormat('ru-RU').format(point.value)}`;
        circle.appendChild(tooltip);
      });
      
      // Добавляем ось Y (только линии-метки)
      const yTickCount = 5;
      for (let i = 0; i < yTickCount; i++) {
        const value = maxValue * (i / (yTickCount - 1));
        const y = yScale(value);
        
        // Горизонтальная линия сетки
        const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', padding.left);
        gridLine.setAttribute('y1', y);
        gridLine.setAttribute('x2', width - padding.right);
        gridLine.setAttribute('y2', y);
        gridLine.setAttribute('stroke', '#E4E7F0');
        gridLine.setAttribute('stroke-width', '1');
        gridLine.setAttribute('stroke-dasharray', '3,3');
        svg.insertBefore(gridLine, svg.firstChild); // Добавляем в начало, чтобы сетка была позади графика
        
        // Метка значения на оси Y
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', padding.left - 5);
        label.setAttribute('y', y + 4); // +4 для вертикального центрирования текста
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('font-size', '10');
        label.setAttribute('fill', '#8B95B0');
        
        // Форматируем число для отображения (сокращаем большие числа)
        let formattedValue;
        if (value >= 1000000) {
          formattedValue = (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
          formattedValue = (value / 1000).toFixed(0) + 'K';
        } else {
          formattedValue = value.toFixed(0);
        }
        
        label.textContent = formattedValue;
        svg.appendChild(label);
      }
      
      // Добавляем метки для оси X (первая, средняя и последняя точки)
      [0, Math.floor(props.data.length / 2), props.data.length - 1].forEach(index => {
        if (index < props.data.length) {
          const x = xScale(index);
          const point = props.data[index];
          
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('x', x);
          label.setAttribute('y', height - 5);
          label.setAttribute('text-anchor', 'middle');
          label.setAttribute('font-size', '10');
          label.setAttribute('fill', '#8B95B0');
          
          // Сокращаем имя месяца до 3 букв
          const shortDate = point.date.substring(0, 3);
          label.textContent = shortDate;
          svg.appendChild(label);
        }
      });
    };
    
    onMounted(() => {
      createChart();
      
      // Добавляем обработчик изменения размера окна
      window.addEventListener('resize', createChart);
    });
    
    // Обновляем график при изменении данных
    watch(() => props.data, createChart, { deep: true });
    
    return {
      chartRef
    };
  }
};
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
}

.views-chart {
  width: 100%;
  display: block;
}
</style>