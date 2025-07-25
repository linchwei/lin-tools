<template>
  <div class="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
    <!-- 图表头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold text-white mb-2">📈 实时数据趋势</h3>
        <p class="text-white/60 text-sm">系统关键指标实时监控</p>
      </div>

      <div class="flex items-center gap-3">
        <el-select v-model="selectedMetric" size="small" @change="updateChart">
          <el-option label="CPU使用率" value="cpu" />
          <el-option label="内存使用率" value="memory" />
          <el-option label="网络流量" value="network" />
          <el-option label="磁盘IO" value="disk" />
        </el-select>

        <button @click="togglePause"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
          :class="isPaused
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-red-500/20 text-red-400 border-red-500/30'">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path v-if="isPaused" fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clip-rule="evenodd" />
            <path v-else fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
          {{ isPaused ? '继续' : '暂停' }}
        </button>
      </div>
    </div>

    <!-- 图表容器 -->
    <div class="relative h-80 bg-black/20 rounded-xl overflow-hidden">
      <div ref="chartRef" class="w-full h-full"></div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/50">
        <div class="text-center">
          <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2">
          </div>
          <p class="text-white/80 text-sm">加载图表中...</p>
        </div>
      </div>
    </div>

    <!-- 图表信息 -->
    <div class="mt-4 flex items-center justify-between text-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-blue-400"></div>
          <span class="text-white/80">{{ getMetricLabel(selectedMetric) }}</span>
        </div>
        <div class="text-white/60">
          数据点: {{ timeSeriesData.length }}
        </div>
      </div>

      <div class="text-white/60">
        更新频率: 2秒
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { D3Visualizer } from '@/utils/d3Visualizer'

// 响应式数据
const chartRef = ref<HTMLElement>()
const selectedMetric = ref('cpu')
const isPaused = ref(false)
const isLoading = ref(true)

// 时间序列数据 - 从原文件复制的数据结构
const timeSeriesData = ref<Array<{
  timestamp: number
  cpu: number
  memory: number
  network: number
  disk: number
}>>([])

// D3图表实例
let lineChart: D3Visualizer | null = null
let dataTimer: number | null = null

// 方法
const getMetricLabel = (metric: string): string => {
  const labels = {
    cpu: 'CPU使用率 (%)',
    memory: '内存使用率 (%)',
    network: '网络流量 (MB/s)',
    disk: '磁盘IO (%)'
  }
  return labels[metric as keyof typeof labels] || metric
}

const initChart = async () => {
  if (!chartRef.value) {
    console.warn('图表容器未找到')
    isLoading.value = false
    return
  }

  try {
    // 确保容器有尺寸
    const width = chartRef.value.clientWidth || 800
    const height = chartRef.value.clientHeight || 300

    // 从原文件复制的图表初始化
    lineChart = new D3Visualizer(chartRef.value, {
      width,
      height,
      colors: ['#4facfe', '#00f2fe']
    })

    isLoading.value = false
    updateChart()
  } catch (error) {
    console.error('图表初始化失败:', error)
    isLoading.value = false
  }
}

const updateChart = () => {
  // 从原文件复制的updateLineChart方法
  if (!lineChart || !timeSeriesData.value.length) return

  const chartData = timeSeriesData.value.map(item => ({
    timestamp: item.timestamp,
    value: item[selectedMetric.value as keyof typeof item] as number,
    name: selectedMetric.value
  }))

  lineChart.renderLineChart(chartData, { xKey: 'timestamp', yKey: 'value' })
}

const generateTimeSeriesData = () => {
  // 从原文件复制的数据生成方法
  if (isPaused.value) return

  const now = Date.now()
  const newData = {
    timestamp: now,
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    network: Math.random() * 500,
    disk: Math.random() * 100
  }

  timeSeriesData.value.push(newData)

  // 保持最近50个数据点
  if (timeSeriesData.value.length > 50) {
    timeSeriesData.value.shift()
  }

  updateChart()
}

const togglePause = () => {
  isPaused.value = !isPaused.value
}

const startDataGeneration = () => {
  // 生成初始数据
  for (let i = 0; i < 20; i++) {
    const timestamp = Date.now() - (20 - i) * 2000
    timeSeriesData.value.push({
      timestamp,
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 500,
      disk: Math.random() * 100
    })
  }

  // 定时生成新数据
  dataTimer = window.setInterval(generateTimeSeriesData, 2000)
}

const stopDataGeneration = () => {
  if (dataTimer) {
    clearInterval(dataTimer)
    dataTimer = null
  }
}

// 生命周期
onMounted(async () => {
  await nextTick()
  startDataGeneration()
  await initChart()
})

onUnmounted(() => {
  stopDataGeneration()
  if (lineChart) {
    lineChart.clear()
  }
})
</script>