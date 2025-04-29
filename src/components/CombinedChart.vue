.tooltip-err {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin: 4px 0;
  color: #9C27B0; /* Фиолетовый цвет для ERR */
}

.err-dot {
  background-color: #9C27B0;
}

<template>
  <div class="combined-chart" :style="{ width: width + 'px', height: height + 'px' }">
    <div v-if="!hasValidData" class="data-error-message">
      {{ dataErrorMessage }}
    </div>
    <svg v-else width="100%" height="100%" class="chart">
      <!-- Оси и линии сетки -->
      <line
        x1="0"
        :y1="padding"
        x2="0"
        :y2="height - padding"
        stroke="#E0E0E0"
        stroke-width="1"
      />
      <line
        x1="0"
        :y1="height - padding"
        :x2="width - rightPadding"
        :y2="height - padding"
        stroke="#E0E0E0"
        stroke-width="1"
      />
      
      <!-- Метки оси X -->
      <template v-for="(point, index) in displayPoints" :key="'xlabel-' + index">
        <template v-if="index % labelInterval === 0">
          <line
            :x1="getX(index)"
            :y1="height - padding"
            :x2="getX(index)"
            :y2="height - padding + 5"
            stroke="#E0E0E0"
            stroke-width="1"
          />
          <text
            :x="getX(index)"
            :y="height - padding + 15"
            text-anchor="middle"
            fill="#909399"
            font-size="10"
          >
            {{ formatDateLabel(point.label) }}
          </text>
        </template>
      </template>
      
      <!-- Метки оси Y слева (подписчики) -->
      <template v-for="tick in subscriberYTicks" :key="'subscriberTick-' + tick">
        <line
          v-if="!isNaN(getSubscriberY(tick))"
          x1="0"
          :y1="getSubscriberY(tick)"
          x2="5"
          :y2="getSubscriberY(tick)"
          stroke="#E0E0E0"
          stroke-width="1"
        />
        <!-- Добавляем горизонтальные линии сетки -->
        <line
          v-if="!isNaN(getSubscriberY(tick))"
          x1="0"
          :y1="getSubscriberY(tick)"
          :x2="width - rightPadding"
          :y2="getSubscriberY(tick)"
          class="chart-grid"
        />
        <text
          v-if="!isNaN(getSubscriberY(tick))"
          x="10"
          :y="getSubscriberY(tick) + 4"
          text-anchor="start"
          fill="#409EFF"
          font-size="10"
          class="subscriber-label"
        >
          {{ formatNumber(tick) }}
        </text>
      </template>
      
      <!-- Метки оси Y справа (просмотры) -->
      <template v-if="hasViewsData" v-for="tick in viewsYTicks" :key="'viewsTick-' + tick">
        <line
          v-if="!isNaN(getViewsY(tick))"
          :x1="width"
          :y1="getViewsY(tick)"
          :x2="width - 5"
          :y2="getViewsY(tick)"
          stroke="#E0E0E0"
          stroke-width="1"
        />
        <text
          v-if="!isNaN(getViewsY(tick))"
          :x="width - 10"
          :y="getViewsY(tick) + 4"
          text-anchor="end"
          fill="#67C23A"
          font-size="10"
          class="views-label"
        >
          {{ formatNumber(tick) }}
        </text>
      </template>
      
      <!-- Линии графиков -->
      <path
        v-if="subscriberPath && subscriberPath !== 'M 0 0'"
        :d="subscriberPath"
        fill="none"
        stroke="#409EFF"
        stroke-width="2"
        stroke-linejoin="round"
      />
      
      <path
        v-if="hasViewsData && viewsPath && viewsPath !== 'M 0 0'"
        :d="viewsPath"
        fill="none"
        stroke="#67C23A"
        stroke-width="2"
        stroke-linejoin="round"
      />
      
      <!-- Легенда -->
      <g class="legend" transform="translate(60, 15)">
        <rect width="12" height="2" fill="#409EFF" />
        <text x="16" y="5" font-size="10" fill="#909399">Subscribers</text>
        
        <g v-if="hasViewsData" transform="translate(90, 0)">
          <rect width="12" height="2" fill="#67C23A" />
          <text x="16" y="5" font-size="10" fill="#909399">Views</text>
        </g>
      </g>
      
      <!-- Точки на графике и тултипы -->
      <template v-for="(point, index) in displayPoints" :key="'point-' + index">
        <!-- Точки для подписчиков -->
        <circle
          v-if="typeof point.subscriberValue === 'number' && !isNaN(point.subscriberValue) && !isNaN(getSubscriberY(point.subscriberValue))"
          :cx="getX(index)"
          :cy="getSubscriberY(point.subscriberValue)"
          r="4"
          fill="#fff"
          stroke="#409EFF"
          stroke-width="2"
          @mouseenter="showCombinedTooltip($event, point, index)"
          @mouseleave="hideTooltip"
        />
        
        <!-- Точки для просмотров -->
        <circle
          v-if="hasViewsData && typeof point.viewsValue === 'number' && !isNaN(point.viewsValue) && !isNaN(getViewsY(point.viewsValue))"
          :cx="getX(index)"
          :cy="getViewsY(point.viewsValue)"
          r="4"
          fill="#fff"
          stroke="#67C23A"
          stroke-width="2"
          @mouseenter="showCombinedTooltip($event, point, index)"
          @mouseleave="hideTooltip"
        />
      </template>
    </svg>
    <div v-if="tooltipVisible" class="tooltip-container" :style="{
      position: 'absolute',
      left: `${tooltipX}px`,
      top: `${tooltipY}px`,
      transform: 'translate(-70px, -50px)',
      background: 'white',
      padding: '10px 15px',
      borderRadius: '4px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      border: '1px solid #DCDFE6',
      zIndex: 100,
      width: '140px',
      pointerEvents: 'none'
    }">
      <div style="font-weight: bold; font-size: 11px; margin-bottom: 5px;">{{ tooltipLabel }}</div>
      <div style="color: #409EFF; font-size: 11px; margin-bottom: 3px;">Subs: {{ tooltip.subscribersValue }}</div>
      <div v-if="hasViewsData" style="color: #67C23A; font-size: 11px; margin-bottom: 3px;">Views: {{ tooltip.viewsValue }}</div>
      <div v-if="tooltipErrorRate !== null" style="color: #666; font-size: 11px;">ER: {{ tooltipErrorRate }}% (Views/Subs)</div>
      <div v-if="tooltipErrorRate !== null" class="info-indicator" style="position: absolute; top: 10px; right: 10px;">
        <div style="background: #409EFF; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">i</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

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
    try {
      console.log('CombinedChart component mounted');
      console.log('subscribersData length:', props.subscribersData?.length);
      console.log('viewsData length:', props.viewsData?.length);
      
      const padding = 40;
      const rightPadding = 60;
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
        
        // Увеличиваем интервалы для длинных временных рядов
        if (count <= 12) return 1;
        if (count <= 24) return 2;
        if (count <= 36) return 3;
        if (count <= 48) return 4;
        if (count <= 60) return 6;
        return Math.ceil(count / 10); // Примерно 10 меток для очень длинных рядов
      });
      
      // Проверяем наличие данных по просмотрам
      const hasViewsData = computed(() => {
        return props.viewsData && props.viewsData.length > 0;
      });
      
      // Improved validation for data processing
      const hasValidData = computed(() => {
        console.log('Checking if data is valid for chart rendering');
        
        if (!props.subscribersData || props.subscribersData.length < 2) {
          console.warn('Not enough subscriber data points');
          return false;
        }

        // Count valid points
        let validPoints = 0;
        let invalidPoints = 0;
        let invalidDetails = [];
        
        for (let i = 0; i < props.subscribersData.length; i++) {
          const point = props.subscribersData[i];
          
          // Проверяем структуру и тип данных
          const validStructure = point && 
                                 typeof point === 'object' && 
                                 (('value' in point) || ('subscriberValue' in point)) &&
                                 (point.label !== undefined || point.date !== undefined);
          
          if (!validStructure) {
            console.error(`Invalid point structure at index ${i}:`, point);
            invalidPoints++;
            invalidDetails.push({
              index: i,
              point: point
            });
            continue;
          }
          
          // Get value regardless of which property is used
          let value = point.value !== undefined ? point.value : point.subscriberValue;
          
          // Принудительно преобразуем к числу, если это строка
          if (typeof value === 'string') {
            const numValue = parseFloat(value.replace(/,/g, ''));
            if (!isNaN(numValue)) {
              console.log(`Converting string "${value}" to number ${numValue}`);
              value = numValue;
            }
          }
          
          if (value !== undefined && !isNaN(value) && typeof value === 'number') {
            validPoints++;
          } else {
            invalidPoints++;
            invalidDetails.push({
              index: i,
              label: point.label || point.date,
              value: value
            });
          }
        }
        
        console.log(`Valid points: ${validPoints}, Invalid points: ${invalidPoints}`);
        if (invalidPoints > 0) {
          console.warn('Invalid points details:', invalidDetails);
        }
        
        return validPoints >= 2;
      });
      
      // Improved displayPoints to handle both data formats
      const displayPoints = computed(() => {
        console.log('Processing data points for chart display');
        
        // Transform data for display
        const points = props.subscribersData.map((item, index) => {
          // Extract the subscriber value - our API returns {date, value} format
          let subscriberValue = typeof item.value === 'number' && !isNaN(item.value) ? item.value : undefined;
          
          // Handle label/date correctly
          const label = item.date || item.label || '';
          
          // Get views from viewsData if available
          let viewsValue = undefined;
          if (props.viewsData && props.viewsData[index]) {
            const viewItem = props.viewsData[index];
            viewsValue = typeof viewItem.value === 'number' && !isNaN(viewItem.value) ? viewItem.value : undefined;
          }
          
          if (subscriberValue === undefined) {
            console.warn(`Invalid subscriber value at index ${index}:`, item.value);
          }
          if (viewsValue !== undefined && isNaN(viewsValue)) {
            console.warn(`Invalid views value at index ${index}:`, viewsValue);
          }
          
          return {
            label,
            subscriberValue,
            viewsValue
          };
        });
        
        console.log('Processed first 3 points:', points.slice(0, 3));
        return points;
      });
      
      // Находим максимальные и минимальные значения для осей Y
      const subscriberYRange = computed(() => {
        console.log('Calculating subscriber Y range');
        
        // Get only valid number values - checking both value and subscriberValue properties
        const validValues = props.subscribersData
          .map(d => {
            // Try to get value from either property
            const val = d.value !== undefined ? d.value : 
                      (d.subscriberValue !== undefined ? d.subscriberValue : undefined);
            
            // Convert to number if it's a string
            if (typeof val === 'string') {
              return parseFloat(val.replace(/,/g, ''));
            }
            return val;
          })
          .filter(val => val !== undefined && !isNaN(val) && typeof val === 'number');
        
        console.log('Valid subscriber values for range calc:', validValues);
        
        if (validValues.length === 0) {
          console.warn('No valid subscriber values found for Y range calculation');
          return { min: 0, max: 100 }; // Default range if no valid values
        }
        
        // Всегда начинать с 0
        const min = 0;
        // Add some padding to the max value (10%)
        const max = Math.ceil(Math.max(...validValues) * 1.1);
        
        console.log('Subscriber Y range calculated:', { min, max });
        return { min, max };
      });
      
      const viewsYRange = computed(() => {
        console.log('Calculating views Y range');
        
        if (!hasViewsData.value) {
          return { min: 0, max: 100 }; // Default range if no views data
        }
        
        // Get only valid number values - checking both value and viewsValue properties
        const validValues = props.viewsData
          .map(d => {
            // Try to get value from either property
            const val = d.value !== undefined ? d.value : 
                      (d.viewsValue !== undefined ? d.viewsValue : undefined);
            
            // Convert to number if it's a string
            if (typeof val === 'string') {
              return parseFloat(val.replace(/,/g, ''));
            }
            return val;
          })
          .filter(val => val !== undefined && !isNaN(val) && typeof val === 'number');
        
        console.log('Valid views values for range calc:', validValues);
        
        if (validValues.length === 0) {
          console.warn('No valid views values found for Y range calculation');
          return { min: 0, max: 100 }; // Default range if no valid values
        }
        
        // Всегда начинать с 0
        const min = 0;
        // Add some padding to the max value (10%)
        const max = Math.ceil(Math.max(...validValues) * 1.1);
        
        console.log('Views Y range calculated:', { min, max });
        return { min, max };
      });
      
      // Генерируем метки для оси Y
      const subscriberYTicks = computed(() => {
        const { min, max } = subscriberYRange.value;
        
        // Validate min and max
        if (typeof min !== 'number' || isNaN(min) || 
            typeof max !== 'number' || isNaN(max)) {
          console.warn('Invalid min/max for subscriber Y ticks:', min, max);
          return [0, 20, 40, 60, 80, 100]; // Default ticks
        }
        
        if (min === max) {
          // If min equals max, create a simple range around it
          const value = min || 0;
          return [
            0,
            Math.max(0, value - 10),
            value,
            value + 10,
            value + 20
          ];
        }
        
        // Always include 0 as the first tick
        const range = max - min;
        const count = 5;
        const step = Math.ceil(range / count);
        const ticks = [0]; // Start with zero
        
        for (let i = 1; i <= count; i++) {
          ticks.push(step * i);
        }
        
        return ticks;
      });
      
      const viewsYTicks = computed(() => {
        if (!hasViewsData.value) {
          return [];
        }
        
        const { min, max } = viewsYRange.value;
        
        // Validate min and max
        if (typeof min !== 'number' || isNaN(min) || 
            typeof max !== 'number' || isNaN(max)) {
          console.warn('Invalid min/max for views Y ticks:', min, max);
          return [0, 20, 40, 60, 80, 100]; // Default ticks
        }
        
        if (min === max) {
          // If min equals max, create a simple range around it
          const value = min || 0;
          return [
            0,
            Math.max(0, value - 10),
            value,
            value + 10,
            value + 20
          ];
        }
        
        // Always include 0 as the first tick
        const range = max - min;
        const count = 5;
        const step = Math.ceil(range / count);
        const ticks = [0]; // Start with zero
        
        for (let i = 1; i <= count; i++) {
          ticks.push(step * i);
        }
        
        return ticks;
      });
      
      // Функции для расчета координат
      const getX = (index) => {
        const availableWidth = props.width - padding - rightPadding;
        const step = availableWidth / (Math.max(1, displayPoints.value.length - 1));
        return padding + index * step;
      };
      
      // Enhanced getSubscriberY to handle invalid data
      const getSubscriberY = (value) => {
        if (typeof value !== 'number' || isNaN(value) || 
            typeof subscriberYRange.value.min !== 'number' || isNaN(subscriberYRange.value.min) ||
            typeof subscriberYRange.value.max !== 'number' || isNaN(subscriberYRange.value.max)) {
          console.warn('Invalid value or Y range for subscriber:', value, subscriberYRange.value.min, subscriberYRange.value.max);
          return props.height - padding;  // Return bottom of chart as fallback
        }
        
        if (subscriberYRange.value.max === subscriberYRange.value.min) {
          return padding;  // Top of chart if min and max are the same
        }
        
        const availableHeight = props.height - padding * 2;
        // Ensure 0 is at the bottom
        return props.height - padding - ((value - subscriberYRange.value.min) / (subscriberYRange.value.max - subscriberYRange.value.min)) * availableHeight;
      };
      
      // Enhanced getViewsY to handle invalid data
      const getViewsY = (value) => {
        if (!hasViewsData.value) {
          return props.height - padding; // If no views data exists, return bottom of chart
        }
        
        // Enhanced validation for views data
        if (value === undefined || typeof value !== 'number' || isNaN(value) ||
            typeof viewsYRange.value.min !== 'number' || isNaN(viewsYRange.value.min) ||
            typeof viewsYRange.value.max !== 'number' || isNaN(viewsYRange.value.max)) {
          console.warn('Invalid value or Y range for views:', value, viewsYRange.value);
          return props.height - padding;  // Return bottom of chart as fallback
        }
        
        if (viewsYRange.value.max === viewsYRange.value.min) {
          return padding;  // Top of chart if min and max are the same
        }
        
        const availableHeight = props.height - padding * 2;
        // Ensure 0 is at the bottom
        return props.height - padding - ((value - viewsYRange.value.min) / (viewsYRange.value.max - viewsYRange.value.min)) * availableHeight;
      };
      
      // Пути для линий графиков
      const subscriberPath = computed(() => {
        if (!hasValidData.value) {
          console.warn('Not enough valid data for subscriber path');
          return 'M 0 0';
        }
        
        let path = '';
        let validPointCount = 0;
        
        displayPoints.value.forEach((point, index) => {
          if (typeof point.subscriberValue === 'number' && !isNaN(point.subscriberValue)) {
            const x = getX(index);
            const y = getSubscriberY(point.subscriberValue);
            
            if (!isNaN(x) && !isNaN(y)) {
              if (validPointCount === 0) {
                path += `M ${x} ${y}`;
              } else {
                path += ` L ${x} ${y}`;
              }
              validPointCount++;
            }
          }
        });
        
        if (validPointCount < 2) {
          console.warn('Not enough valid points for subscriber path');
          return 'M 0 0';
        }
        
        return path;
      });
      
      const viewsPath = computed(() => {
        if (!hasViewsData.value || !hasValidData.value) {
          return 'M 0 0';
        }
        
        let path = '';
        let validPointCount = 0;
        
        displayPoints.value.forEach((point, index) => {
          if (point.viewsValue !== undefined && 
              typeof point.viewsValue === 'number' && 
              !isNaN(point.viewsValue)) {
            const x = getX(index);
            const y = getViewsY(point.viewsValue);
            
            if (!isNaN(x) && !isNaN(y)) {
              if (validPointCount === 0) {
                path += `M ${x} ${y}`;
              } else {
                path += ` L ${x} ${y}`;
              }
              validPointCount++;
            }
          }
        });
        
        if (validPointCount < 2) {
          console.warn('Not enough valid points for views path');
          return 'M 0 0';
        }
        
        return path;
      });
      
      // Форматирование чисел и дат
      const formatNumber = (num) => {
        if (num === undefined || num === null || isNaN(num)) return 'N/A';
        // Используем русскую локаль для разделения разрядов пробелами
        return new Intl.NumberFormat('ru-RU').format(num);
      };
      
      const formatDateLabel = (dateStr) => {
        if (!dateStr) return '';
        
        try {
          // Попробуем преобразовать строку в дату
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            // Use English locale for month names
            const month = date.toLocaleString('en', { month: 'short' });
            const year = date.getFullYear().toString().slice(2);
            
            // Всегда показываем и месяц и год для лучшей читаемости
            return `${month} '${year}`;
          }
        } catch (e) {
          console.warn('Error formatting date label:', e);
        }
        
        // Если не смогли обработать как дату, используем исходную логику
        const parts = dateStr.split(' ');
        if (parts.length >= 2) {
          const month = parts[0].substring(0, 3);
          const year = parts[1].substring(2);
          return `${month} '${year}`;
        }
        
        return dateStr;
      };
      
      // Add formatLabel function that was missing but referenced in the template
      const formatLabel = (label) => {
        return formatDateLabel(label);
      };
      
      // Обработка наведения для показа комбинированной подсказки
      const showCombinedTooltip = (event, point, index) => {
        // Position tooltip relative to the chart container
        const chartRect = event.target.closest('.combined-chart')?.getBoundingClientRect() || 
                         {left: 0, top: 0, width: 0, height: 0};
        
        // Get cursor position relative to the chart
        let tipX = event.clientX - chartRect.left;
        let tipY = event.clientY - chartRect.top - 10; // Slightly above cursor
        
        // Adjust position to prevent tooltip from being cut off at edges
        if (tipX < 70) {
          tipX = 70; // Ensure tooltip doesn't go off left edge
        } else if (tipX > chartRect.width - 70) {
          tipX = chartRect.width - 70; // Ensure tooltip doesn't go off right edge
        }
        
        if (tipY < 60) {
          tipY = 60; // Ensure tooltip doesn't go off top edge
        } else if (tipY > chartRect.height - 40) {
          tipY = chartRect.height - 40; // Ensure tooltip doesn't go off bottom edge
        }
        
        const x = getX(index);
        
        // Расчет ERR, если доступны оба значения
        let errValue = null;
        if (point.viewsValue !== undefined && point.subscriberValue) {
          const err = (point.viewsValue / point.subscriberValue) * 100;
          errValue = err.toFixed(1);
        }
        
        tooltip.value = {
          visible: true,
          x: tipX,
          y: tipY,
          date: point.label,
          subscribersValue: formatNumber(point.subscriberValue),
          viewsValue: formatNumber(point.viewsValue),
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
      
      // Добавим computed свойство для сообщения об ошибке
      const dataErrorMessage = computed(() => {
        if (props.subscribersData.length === 0) {
          return "No data available for this KOL";
        }
        
        if (props.subscribersData.length < 2) {
          return "Not enough data points to display the chart (minimum 2 required)";
        }
        
        // Count valid points
        let validPoints = 0;
        for (const point of props.subscribersData) {
          if (point.value !== undefined && !isNaN(point.value)) {
            validPoints++;
          }
        }
        
        if (validPoints < 2) {
          return `Only ${validPoints} valid data points found (minimum 2 required)`;
        }
        
        return "Not enough valid data to display the chart";
      });
      
      // Computed properties to access tooltip values
      const tooltipVisible = computed(() => tooltip.value.visible);
      const tooltipX = computed(() => tooltip.value.x);
      const tooltipY = computed(() => tooltip.value.y);
      const tooltipLabel = computed(() => tooltip.value.date);
      const tooltipSubscriberValue = computed(() => {
        if (tooltip.value.subscribersValue) {
          return Number(tooltip.value.subscribersValue.split(' ')[0].replace(/\s/g, '')); // Remove 'followers' text and spaces
        }
        return 0;
      });
      const tooltipViewsValue = computed(() => {
        if (tooltip.value.viewsValue) {
          return Number(tooltip.value.viewsValue.split(' ')[0].replace(/\s/g, '')); // Remove 'views' text and spaces
        }
        return 0;
      });
      const tooltipErrorRate = computed(() => {
        if (tooltip.value.errValue) {
          return parseFloat(tooltip.value.errValue);
        }
        return null;
      });
      
      // Computed properties for hoverLine
      const hoverLineVisible = computed(() => hoverLine.value.visible);
      const hoverLineX = computed(() => hoverLine.value.x);
      
      return {
        padding,
        rightPadding,
        displayPoints,
        subscriberYTicks,
        viewsYTicks,
        labelInterval,
        hasViewsData,
        hasValidData,
        dataErrorMessage,
        getX,
        getSubscriberY,
        getViewsY,
        subscriberPath,
        viewsPath,
        formatNumber,
        formatDateLabel,
        formatLabel,
        tooltip,
        hoverLine,
        hoverLineVisible,
        hoverLineX,
        showCombinedTooltip,
        hideTooltip,
        // Add the computed tooltip properties
        tooltipVisible,
        tooltipX,
        tooltipY,
        tooltipLabel,
        tooltipSubscriberValue,
        tooltipViewsValue,
        tooltipErrorRate
      };
    } catch (error) {
      console.error('Error in CombinedChart setup:', error);
      // Возвращаем минимальный набор данных и функций, чтобы компонент не сломался
      return {
        hasValidData: computed(() => false),
        dataErrorMessage: computed(() => `Ошибка обработки данных: ${error.message || 'Неизвестная ошибка'}`)
      };
    }
  }
};
</script>

<style scoped>
.combined-chart {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  margin-bottom: 0;
  padding-bottom: 0;
  box-sizing: border-box;
}

.data-error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 16px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px dashed #ccc;
}

/* Стили для меток оси */
.chart text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  font-size: 12px;
}

/* Выделяем метки для подписчиков */
.chart text.subscriber-label {
  fill: #409EFF;
  font-weight: 500;
}

/* Выделяем метки для просмотров */
.chart text.views-label {
  fill: #67C23A;
  font-weight: 500;
}

.tooltip-err {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin: 4px 0;
  color: #9C27B0; /* Фиолетовый цвет для ERR */
}

.err-dot {
  background-color: #9C27B0;
}

/* Заменим на более заметную сетку */
.chart-grid line {
  stroke: #D0D7E8;
  stroke-width: 1;
  stroke-dasharray: 3, 2;
}

.tooltip-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
}
</style>