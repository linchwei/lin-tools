<template>
  <div class="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 h-[500px] flex flex-col">
    <!-- 图表头部 -->
    <div class="mb-6">
      <h3 class="text-xl font-semibold text-white mb-2">🔧 系统状态分布</h3>
      <p class="text-white/60 text-sm">各系统状态实时统计</p>
    </div>

    <!-- 图表容器 -->
    <div class="relative flex-1 bg-black/20 rounded-xl overflow-hidden">
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

    <!-- 状态图例 -->
    <div class="mt-4 grid grid-cols-2 gap-3">
      <div v-for="(item, index) in statusData" :key="item.name"
        class="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
        <div class="w-4 h-4 rounded-full flex-shrink-0" :style="{ backgroundColor: getStatusColor(index) }"></div>
        <div class="flex-1">
          <div class="text-white text-sm font-medium">{{ item.name }}</div>
          <div class="text-white/60 text-xs">{{ item.value }}%</div>
        </div>
        <div class="text-white font-bold text-lg">{{ item.value }}</div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="mt-4 flex items-center justify-between text-sm">
      <div class="text-white/60">
        总计: {{ totalSystems }} 个系统
      </div>
      <div class="text-white/60">
        健康率: {{ healthRate }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { D3Visualizer } from '@/utils/d3Visualizer'

// 响应式数据
const chartRef = ref<HTMLElement>()
const isLoading = ref(true)

// 状态数据 - 从原文件复制
const statusData = ref([
  { name: '正常', value: 65 },
  { name: '警告', value: 20 },
  { name: '错误', value: 10 },
  { name: '离线', value: 5 }
])

// D3图表实例
let pieChart: D3Visualizer | null = null
let updateTimer: number | null = null

// 计算属性
const totalSystems = computed(() => {
  return statusData.value.reduce((sum, item) => sum + item.value, 0)
})

const healthRate = computed(() => {
  const normalSystems = statusData.value.find(item => item.name === '正常')?.value || 0
  return Math.round((normalSystems / totalSystems.value) * 100)
})

// 方法
const getStatusColor = (index: number): string => {
  const colors = ['#4facfe', '#43e97b', '#ffa502', '#ff4757']
  return colors[index] || '#8892b0'
}

const initChart = async () => {
  if (!chartRef.value) {
    console.warn('饼图容器未找到')
    isLoading.value = false
    return
  }

  try {
    // 确保容器有尺寸
    const width = chartRef.value.clientWidth || 400
    const height = chartRef.value.clientHeight || 300

    // 从原文件复制的图表初始化
    pieChart = new D3Visualizer(chartRef.value, {
      width,
      height,
      colors: ['#4facfe', '#43e97b', '#ffa502', '#ff4757']
    })

    isLoading.value = false
    updateChart()
  } catch (error) {
    console.error('饼图初始化失败:', error)
    isLoading.value = false
  }
}

const updateChart = () => {
  // 从原文件复制的饼图更新方法
  if (!pieChart) return

  pieChart.renderPieChart(statusData.value, {
    valueKey: 'value',
    labelKey: 'name'
  })
}

const generateRandomData = () => {
  // 生成随机状态数据，保持总和为100
  const total = 100
  const normal = Math.floor(Math.random() * 40) + 50 // 50-90%
  const warning = Math.floor(Math.random() * 20) + 5 // 5-25%
  const remaining = total - normal - warning
  const error = Math.floor(Math.random() * remaining) + 1
  const offline = remaining - error

  statusData.value = [
    { name: '正常', value: normal },
    { name: '警告', value: warning },
    { name: '错误', value: error },
    { name: '离线', value: offline }
  ]

  updateChart()
}

const startDataUpdate = () => {
  // 定时更新数据
  updateTimer = window.setInterval(generateRandomData, 5000)
}

const stopDataUpdate = () => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

// 生命周期
onMounted(async () => {
  await nextTick()
  await initChart()
  startDataUpdate()
})

onUnmounted(() => {
  stopDataUpdate()
  if (pieChart) {
    pieChart.clear()
  }
})
</script>

<style lang="scss" scoped>
// 只保留必要的自定义样式</style>
