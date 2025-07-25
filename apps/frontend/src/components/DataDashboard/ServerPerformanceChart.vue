<template>
  <div class="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 h-[500px] flex flex-col">
    <!-- 图表头部 -->
    <div class="mb-6">
      <h3 class="text-xl font-semibold text-white mb-2">⚡ 服务器性能</h3>
      <p class="text-white/60 text-sm">各服务器实时性能监控</p>
    </div>

    <!-- 图表容器 -->
    <div class="relative h-48 bg-black/20 rounded-xl overflow-hidden">
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

    <!-- 服务器列表 -->
    <div
      class="mt-4 flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      <div v-for="(server, index) in serverData" :key="server.name"
        class="flex items-center justify-between p-3 bg-black/20 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getServerColor(index) }"></div>
          <div>
            <div class="text-white text-sm font-medium">{{ server.name }}</div>
            <div class="text-white/60 text-xs">{{ getServerStatus(server.value) }}</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- 性能条 -->
          <div class="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full transition-all duration-300 rounded-full" :style="{
              width: `${server.value}%`,
              backgroundColor: getPerformanceColor(server.value)
            }"></div>
          </div>

          <!-- 数值 -->
          <div class="text-white font-bold text-sm min-w-[3rem] text-right">
            {{ server.value.toFixed(2) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="mt-4 flex items-center justify-between text-sm">
      <div class="text-white/60">
        平均负载: {{ averageLoad }}%
      </div>
      <div class="text-white/60">
        最高负载: {{ maxLoad }}%
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

// 服务器数据 - 从原文件复制
const serverData = ref([
  { name: '服务器1', value: Math.random() * 100 },
  { name: '服务器2', value: Math.random() * 100 },
  { name: '服务器3', value: Math.random() * 100 },
  { name: '服务器4', value: Math.random() * 100 }
])

// D3图表实例
let barChart: D3Visualizer | null = null
let updateTimer: number | null = null

// 计算属性
const averageLoad = computed(() => {
  const total = serverData.value.reduce((sum, server) => sum + server.value, 0)
  return (total / serverData.value.length).toFixed(2)
})

const maxLoad = computed(() => {
  return Math.max(...serverData.value.map(server => server.value)).toFixed(2)
})

// 方法
const getServerColor = (index: number): string => {
  const colors = ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7']
  return colors[index] || '#8892b0'
}

const getPerformanceColor = (value: number): string => {
  if (value >= 80) return '#ff4757' // 红色 - 高负载
  if (value >= 60) return '#ffa502' // 橙色 - 中等负载
  return '#43e97b' // 绿色 - 低负载
}

const getServerStatus = (value: number): string => {
  if (value >= 80) return '高负载'
  if (value >= 60) return '中等负载'
  return '正常'
}

const initChart = async () => {
  if (!chartRef.value) {
    console.warn('柱状图容器未找到')
    isLoading.value = false
    return
  }

  try {
    // 确保容器有尺寸
    const width = chartRef.value.clientWidth || 400
    const height = chartRef.value.clientHeight || 300

    // 从原文件复制的图表初始化
    barChart = new D3Visualizer(chartRef.value, {
      width,
      height,
      colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7']
    })

    isLoading.value = false
    updateChart()
  } catch (error) {
    console.error('柱状图初始化失败:', error)
    isLoading.value = false
  }
}

const updateChart = () => {
  // 从原文件复制的柱状图更新方法
  if (!barChart) return

  barChart.renderBarChart(serverData.value, {
    xKey: 'name',
    yKey: 'value'
  })
}

const generateRandomData = () => {
  // 生成随机服务器性能数据
  serverData.value = serverData.value.map(server => ({
    ...server,
    value: Number((Math.random() * 100).toFixed(2)) // 保留两位小数
  }))

  updateChart()
}

const startDataUpdate = () => {
  // 定时更新数据
  updateTimer = window.setInterval(generateRandomData, 3000)
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
  if (barChart) {
    barChart.clear()
  }
})
</script>

<style lang="scss" scoped>
// 优化的滚动条样式
.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(79, 172, 254, 0.6) 0%, rgba(0, 242, 254, 0.6) 100%);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(79, 172, 254, 0.8) 0%, rgba(0, 242, 254, 0.8) 100%);
  border-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.scrollbar-thin::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, rgba(79, 172, 254, 1) 0%, rgba(0, 242, 254, 1) 100%);
}

// Firefox 滚动条样式
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(79, 172, 254, 0.6) rgba(0, 0, 0, 0.1);
}
</style>
