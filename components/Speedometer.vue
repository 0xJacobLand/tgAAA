<template>
  <div
    class="speedometer-container"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <svg
      class="speedometer-gauge"
      :width="size"
      :height="size / 2"
      :viewBox="`0 0 ${size} ${size / 2}`"
    >
      <!-- Цветные сегменты -->
      <g>
        <path
          v-for="(seg, i) in segments"
          :key="i"
          :d="describeArc(cx, cy, radius, seg.start, seg.end)"
          :stroke="seg.color"
          :stroke-width="segmentWidth"
          fill="none"
          stroke-linecap="butt"
        />
      </g>

      <!-- Штриховки -->
      <g class="ticks">
        <line
          v-for="(tick, i) in ticks"
          :key="i"
          :x1="tick.x1"
          :y1="tick.y1"
          :x2="tick.x2"
          :y2="tick.y2"
          stroke="#333"
          :stroke-width="tick.bold ? 2 : 1"
        />
      </g>

      <!-- Стрелка -->
      <g :transform="`rotate(${angle}, ${cx}, ${cy})`">
        <line
          :x1="cx"
          :y1="cy"
          :x2="cx"
          :y2="cy - pointerLength"
          class="pointer"
        />
        <circle
          :cx="cx"
          :cy="cy"
          :r="pointerBase"
          class="pointer-center"
        />
      </g>
    </svg>

    <!-- Подсказка -->
    <div v-if="showTooltip" class="speedometer-tooltip">
      <div class="tooltip-title">{{ tooltip.title }}</div>
      <div class="tooltip-level">{{ tooltip.level }}</div>
      <div v-if="tooltip.flags" class="tooltip-flags">
        <strong>Key Red Flags:</strong>
        <div class="flags-text">
          <div v-for="(flag, index) in tooltip.flagsList" :key="index">
            – {{ flag }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 50 },
  kolId: { type: String, required: true },
  size: { type: Number, default: 200 }
})

const showTooltip = ref(false)

const tooltipData = {
  idoresearch: {
    title: 'Organic Growth',
    level: 'Low — most likely indicates the attraction of "dead" accounts or bots',
    flags: 'Multiple spikes in subscriber count without proportional increase in views'
  },
  defigencapital: {
    title: 'Organic Growth',
    level: 'High — appears to be natural growth after a successful promotion',
    flags: ''
  },
  tradeparty1337: {
    title: 'Organic Growth',
    level: 'Low — repeated bot inflations and "purges," shrinking active audience',
    flags: `Two‑three extreme surges (Dec 2021, Mar 2022, Feb 2024)
31 out of 48 months show subscriber decline
Weak sub‑view correlation (≈ 0.31)
Engagement drops below 15% by the end`
  }
}

const tooltip = computed(() => {
  const baseTooltip = tooltipData[props.kolId?.toLowerCase()] || {
    title: 'Organic Growth',
    level: 'Medium',
    flags: 'Two‑three extreme surges'
  }
  
  return {
    ...baseTooltip,
    flagsList: baseTooltip.flags ? baseTooltip.flags.split('\n') : []
  }
})

const radius = props.size * 0.35
const segmentWidth = props.size * 0.07
const cx = props.size / 2
const cy = radius + segmentWidth / 2          // Сдвигаем центр вверх
const pointerLength = radius * 0.85
const pointerBase = props.size * 0.03

// Углы дуги: от 180° (лево) до 0° (право) — полукруг сверху
const startAngle = 180
const endAngle = 0
const sweep = endAngle - startAngle

// Цветные сегменты: красный слева, зелёный справа
const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336']
const segCount = colors.length
const segAngle = sweep / segCount
const segments = colors.map((color, i) => ({
  color,
  start: startAngle + segAngle * i,
  end:   startAngle + segAngle * (i + 1)
}))

// Угол поворота стрелки
const angle = computed(() => startAngle + (sweep * props.value) / 100 - 215)

// Штрихи по дуге
const ticks = Array.from({ length: 11 }, (_, i) => {
  const ang = startAngle + i * (sweep / 10)
  const outer = polarToCartesian(cx, cy, radius + segmentWidth / 2, ang)
  const inner = polarToCartesian(
    cx,
    cy,
    radius + segmentWidth / 2 - (i % 2 === 0 ? segmentWidth * 0.86 : segmentWidth * 0.57),
    ang
  )
  return { x1: outer.x, y1: outer.y, x2: inner.x, y2: inner.y, bold: i % 2 === 0 }
})

// Координаты точки на дуге
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) } // знак у sin отрицательный -> вверх
}

// SVG path для сегмента
function describeArc(cx, cy, r, startAng, endAng) {
  const start = polarToCartesian(cx, cy, r, endAng)
  const end = polarToCartesian(cx, cy, r, startAng)
  const largeArcFlag = Math.abs(endAng - startAng) <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}
</script>

<style scoped>
.speedometer-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  /* Удалены жесткие margin-top и margin-left */
}

.speedometer-gauge {
  overflow: visible;
}

.ticks line {
  stroke: #666;
}

.pointer {
  stroke: #333;
  stroke-width: 4;
  stroke-linecap: round;
}

.pointer-center {
  fill: #333;
}

.speedometer-tooltip {
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 12px;
  width: 260px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 12px;
  font-size: 13px;
  color: #333;
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 6px;
}

.tooltip-level {
  margin-bottom: 8px;
}

.tooltip-flags .flags-text {
  margin-top: 4px;
}
</style>