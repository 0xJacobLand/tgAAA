.tooltip-err {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin: 4px 0;
  color: #9C27B0; /* Фиолетовый цвет для ERR */
}

.err-dot {
  background-color: #9C27B0;
}<template>
  <div class="chart-wrapper">
    <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`">
      <!-- Оси -->
      <g class="axis">
        <!-- Горизонтальная ось (ось X) -->
        <line :x1="padding" :y1="height - padding" :x2="width - rightPadding" :y2="height - padding" stroke="#B0BEC5" stroke-width="1"/>
        
        <!-- Вертикальная ось (ось Y для подписчиков - левая) -->
        <line :x1="padding" :y1="padding" :x2="padding" :y2="height - padding" stroke="#4285F4" stroke-width="1"/>
        
        <!-- Вертикальная ось (ось Y для просмотров - правая) -->
        <line :x1="width - rightPadding" :y1="padding" :x2="width - rightPadding" :y2="height - padding" stroke="#EA4335" stroke-width="1"/>
        
        <!-- Метки оси X (временные периоды) -->
        <template v-for="(point, index) in displayPoints" :key="`x-label-${index}`">
          <text
            :x="getX(index)"
            :y="height - padding + 20"
            font-size="10"
            text-anchor="middle"
            fill="#8B95B0"
            v-if="index % labelInterval === 0"
          >
            {{ formatDateLabel(point.label) }}
          </text>
        </template>
        
        <!-- Метки оси Y для подписчиков (левая) -->
        <template v-for="(tick, index) in subscriberYTicks" :key="`y-subscriber-${index}`">
          <line
            :x1="padding - 5"
            :y1="getSubscriberY(tick)"
            :x2="padding"
            :y2="getSubscriberY(tick)"
            stroke="#4285F4"
            stroke-width="1"
          />
          <text
            :x="padding - 10"
            :y="getSubscriberY(tick) + 4"
            font-size="10"
            text-anchor="end"
            fill="#4285F4"
          >
            {{ formatNumber(tick) }}
          </text>
        </template>
        
        <!-- Метки оси Y для просмотров (правая) -->
        <template v-for="(tick, index) in viewsYTicks" :key="`y-views-${index}`">
          <line
            :x1="width - rightPadding"
            :y1="getViewsY(tick)"
            :x2="width - rightPadding + 5"
            :y2="getViewsY(tick)"
            stroke="#EA4335"
            stroke-width="1"
          />
          <text
            :x="width - rightPadding + 10"
            :y="getViewsY(tick) + 4"
            font-size="10"
            text-anchor="start"
            fill="#EA4335"
          >
            {{ formatNumber(tick) }}
          </text>
        </template>
        
        <!-- Горизонтальные линии сетки для подписчиков -->
        <template v-for="(tick, index) in subscriberYTicks" :key="`grid-subscriber-${index}`">
          <line
            :x1="padding"
            :y1="getSubscriberY(tick)"
            :x2="width - rightPadding"
            :y2="getSubscriberY(tick)"
            stroke="#E0E0E0"
            stroke-width="1"
            stroke-dasharray="3,3"
          />
        </template>
      </g>
      
      <!-- Невидимые области для отслеживания наведения -->
      <g class="hover-areas">
        <template v-for="(point, index) in displayPoints" :key="`hover-area-${index}`">
          <rect
            :x="getX(index) - (getX(1) - getX(0)) / 2"
            :y="padding"
            :width="(getX(1) - getX(0))"
            :height="height - padding * 2"
            fill="transparent"
            @mouseover="showCombinedTooltip($event, point, index)"
            @mouseout="hideTooltip"
          />
        </template>
      </g>
      
      <!-- Линия графика подписчиков -->
      <g class="subscriber-line">
        <path
          :d="subscriberPath"
          fill="none"
          stroke="#4285F4"
          stroke-width="2"
          stroke-linejoin="round"
        />
        
        <!-- Точки на линии подписчиков -->
        <template v-for="(point, index) in displayPoints" :key="`subscriber-point-${index}`">
          <circle
            :cx="getX(index)"
            :cy="getSubscriberY(point.subscriberValue)"
            r="3"
            fill="#4285F4"
          />
        </template>
      </g>
      
      <!-- Линия графика просмотров (если доступна) -->
      <g class="views-line" v-if="hasViewsData">
        <path
          :d="viewsPath"
          fill="none"
          stroke="#EA4335"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-dasharray="3,3"
        />
        
        <!-- Точки на линии просмотров -->
        <template v-for="(point, index) in displayPoints" :key="`views-point-${index}`">
          <circle
            v-if="point.viewsValue !== undefined"
            :cx="getX(index)"
            :cy="getViewsY(point.viewsValue)"
            r="3"
            fill="#EA4335"
          />
        </template>
      </g>
      
      <!-- Вертикальная линия при наведении -->
      <line
        v-if="hoverLine.visible"
        :x1="hoverLine.x"
        :y1="padding"
        :x2="hoverLine.x"
        :y2="height - padding"
        stroke="#8B95B0"
        stroke-width="1"
        stroke-dasharray="3,3"
      />
      
      <!-- Легенда -->
      <g class="legend" transform="translate(70, 20)">
        <rect x="0" y="0" width="12" height="12" fill="#4285F4" />
        <text x="20" y="10" font-size="12" fill="#2C3D64">Followers</text>
        
        <g v-if="hasViewsData" transform="translate(110, 0)">
          <rect x="0" y="0" width="12" height="12" fill="#EA4335" />
          <text x="20" y="10" font-size="12" fill="#2C3D64">Views</text>
        </g>
      </g>
    </svg>
    
    <!-- Всплывающая подсказка -->
    <div
      v-if="tooltip.visible"
      class="chart-tooltip"
      :style="{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`
      }"
    >
      <div class="tooltip-date">{{ tooltip.date }}</div>
      <div class="tooltip-subscribers">
        <div class="tooltip-dot subscribers-dot"></div>
        {{ tooltip.subscribersValue }}
      </div>
      <div v-if="tooltip.viewsValue" class="tooltip-views">
        <div class="tooltip-dot views-dot"></div>
        {{ tooltip.viewsValue }}
      </div>
      <div v-if="tooltip.errValue" class="tooltip-err">
        <div class="tooltip-dot err-dot"></div>
        ERR: {{ tooltip.errValue }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'CombinedChart',
  props: {
    subscribersData: {
      type: Array,
      required: true
    },
    viewsData: {
      type: Array,
      default: () => []
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 300
    }
  },
  setup(props) {
    const padding = 50;
    const rightPadding = 70; // Увеличенный правый отступ для меток оси Y
    const tooltip = ref({
      visible: false,
      x: 0,
      y: 0,
      date: '',
      subscribersValue: '',
      viewsValue: '',
      errValue: ''
    });
    
    const hoverLine = ref({
      visible: false,
      x: 0
    });
    
    // Вычисляем интервал для меток на оси X
    const labelInterval = computed(() => {
      const count = props.subscribersData.length;
      if (count <= 12) return 1;
      if (count <= 24) return 2;
      if (count <= 36) return 3;
      return 4;
    });
    
    // Проверяем наличие данных по просмотрам
    const hasViewsData = computed(() => {
      return props.viewsData && props.viewsData.length > 0;
    });
    
    // Объединяем данные для отображения
    const displayPoints = computed(() => {
      // Создаем карту дат для данных просмотров
      const viewsMap = {};
      props.viewsData.forEach(item => {
        viewsMap[item.date] = item.value;
      });
      
      // Формируем объединенные данные
      return props.subscribersData.map(item => {
        return {
          label: item.date,
          subscriberValue: item.value,
          viewsValue: viewsMap[item.date]
        };
      });
    });
    
    // Находим максимальные и минимальные значения для осей Y
    const subscriberYRange = computed(() => {
      const values = props.subscribersData.map(d => d.value);
      const min = Math.floor(Math.min(...values) * 0.9);
      const max = Math.ceil(Math.max(...values) * 1.1);
      return { min, max };
    });
    
    const viewsYRange = computed(() => {
      if (!hasViewsData.value) {
        return { min: 0, max: 0 };
      }
      const values = props.viewsData.map(d => d.value);
      const min = Math.floor(Math.min(...values) * 0.9);
      const max = Math.ceil(Math.max(...values) * 1.1);
      return { min, max };
    });
    
    // Генерируем метки для оси Y
    const subscriberYTicks = computed(() => {
      const { min, max } = subscriberYRange.value;
      const range = max - min;
      const count = 5;
      const step = Math.ceil(range / count);
      const ticks = [];
      
      for (let i = 0; i <= count; i++) {
        ticks.push(min + step * i);
      }
      
      return ticks;
    });
    
    const viewsYTicks = computed(() => {
      if (!hasViewsData.value) {
        return [];
      }
      
      const { min, max } = viewsYRange.value;
      const range = max - min;
      const count = 5;
      const step = Math.ceil(range / count);
      const ticks = [];
      
      for (let i = 0; i <= count; i++) {
        ticks.push(min + step * i);
      }
      
      return ticks;
    });
    
    // Функции для расчета координат
    const getX = (index) => {
      const availableWidth = props.width - padding - rightPadding;
      const step = availableWidth / (displayPoints.value.length - 1);
      return padding + index * step;
    };
    
    const getSubscriberY = (value) => {
      const { min, max } = subscriberYRange.value;
      const availableHeight = props.height - padding * 2;
      return props.height - padding - ((value - min) / (max - min)) * availableHeight;
    };
    
    const getViewsY = (value) => {
      if (!hasViewsData.value) {
        return padding;
      }
      
      const { min, max } = viewsYRange.value;
      const availableHeight = props.height - padding * 2;
      return props.height - padding - ((value - min) / (max - min)) * availableHeight;
    };
    
    // Пути для линий графиков
    const subscriberPath = computed(() => {
      let path = '';
      
      displayPoints.value.forEach((point, index) => {
        const x = getX(index);
        const y = getSubscriberY(point.subscriberValue);
        
        if (index === 0) {
          path += `M ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      });
      
      return path;
    });
    
    const viewsPath = computed(() => {
      if (!hasViewsData.value) {
        return '';
      }
      
      let path = '';
      let started = false;
      
      displayPoints.value.forEach((point, index) => {
        if (point.viewsValue !== undefined) {
          const x = getX(index);
          const y = getViewsY(point.viewsValue);
          
          if (!started) {
            path += `M ${x} ${y}`;
            started = true;
          } else {
            path += ` L ${x} ${y}`;
          }
        }
      });
      
      return path;
    });
    
    // Форматирование чисел и дат
    const formatNumber = (num) => {
      return new Intl.NumberFormat('ru-RU').format(num);
    };
    
    const formatDateLabel = (dateStr) => {
      // Берем только месяц и год из строки даты
      const parts = dateStr.split(' ');
      if (parts.length >= 2) {
        // Сокращаем название месяца до 3 букв
        const month = parts[0].substring(0, 3);
        // Берем только последние 2 цифры года
        const year = parts[1].substring(2);
        return `${month}'${year}`;
      }
      return dateStr;
    };
    
    // Обработка наведения для показа комбинированной подсказки
    const showCombinedTooltip = (event, point, index) => {
      const rect = event.target.getBoundingClientRect();
      const chartRect = event.target.closest('.chart-wrapper').getBoundingClientRect();
      
      const tipX = rect.left - chartRect.left + rect.width / 2;
      const tipY = padding; // Размещаем подсказку у верхнего края графика
      
      const x = getX(index);
      
      // Расчет ERR, если доступны оба значения
      let errValue = null;
      if (point.viewsValue !== undefined && point.subscriberValue) {
        const err = (point.viewsValue / point.subscriberValue) * 100;
        errValue = err.toFixed(2) + '%';
      }
      
      tooltip.value = {
        visible: true,
        x: tipX,
        y: tipY,
        date: point.label,
        subscribersValue: formatNumber(point.subscriberValue) + ' followers',
        viewsValue: point.viewsValue !== undefined ? formatNumber(point.viewsValue) + ' views' : null,
        errValue: errValue
      };
      
      hoverLine.value = {
        visible: true,
        x: x
      };
    };
    
    const hideTooltip = () => {
      tooltip.value.visible = false;
      hoverLine.value.visible = false;
    };
    
    return {
      padding,
      rightPadding,
      displayPoints,
      subscriberYTicks,
      viewsYTicks,
      labelInterval,
      hasViewsData,
      getX,
      getSubscriberY,
      getViewsY,
      subscriberPath,
      viewsPath,
      formatNumber,
      formatDateLabel,
      tooltip,
      hoverLine,
      showCombinedTooltip,
      hideTooltip
    };
  }
};
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
}

.chart-tooltip {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 12px;
  pointer-events: none;
  z-index: 100;
  white-space: nowrap;
}

.chart-tooltip .tooltip-date {
  font-weight: 500;
  margin-bottom: 8px;
  color: #2C3D64;
  border-bottom: 1px solid #E0E0E0;
  padding-bottom: 4px;
}

.tooltip-subscribers, .tooltip-views, .tooltip-err {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin: 4px 0;
}

.tooltip-subscribers {
  color: #4285F4;
}

.tooltip-views {
  color: #EA4335;
}

.tooltip-err {
  color: #FF9800; /* Оранжевый цвет для ERR */
}

.tooltip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.subscribers-dot {
  background-color: #4285F4;
}

.views-dot {
  background-color: #EA4335;
}

.err-dot {
  background-color: #FF9800; /* Оранжевый цвет для ERR */
}
</style>