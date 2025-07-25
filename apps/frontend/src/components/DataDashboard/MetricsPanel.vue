<template>
  <div class="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 h-[500px] flex flex-col">
    <!-- 面板头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold text-white mb-2">📊 关键指标</h3>
        <p class="text-white/60 text-sm">系统核心性能监控</p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-white/60 text-sm">系统状态</span>
        <el-tag :type="getSystemStatusType()" size="small">{{ getSystemStatus() }}</el-tag>
      </div>
    </div>

    <!-- 指标网格 -->
    <div class="flex-1 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      <!-- CPU 指标 -->
      <div class="metric-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span class="text-xl">🖥️</span>
            </div>
            <div>
              <h4 class="text-white font-medium">CPU 使用率</h4>
              <div class="text-2xl font-bold text-white">{{ currentMetrics.cpu.toFixed(2) }}%</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :class="getMetricStatusClass(currentMetrics.cpu)"></div>
            <div ref="cpuGaugeRef" class="w-16 h-16"></div>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2 text-white/60">
            <span>{{ getCpuTrendIcon() }}</span>
            <span>{{ getCpuTrendText() }}</span>
          </div>
          <div class="text-white/60">
            核心: {{ getCpuCores() }}
          </div>
        </div>
      </div>

      <!-- 内存指标 -->
      <div class="metric-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span class="text-xl">💾</span>
            </div>
            <div>
              <h4 class="text-white font-medium">内存使用率</h4>
              <div class="text-2xl font-bold text-white">{{ currentMetrics.memory.toFixed(2) }}%</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :class="getMetricStatusClass(currentMetrics.memory)"></div>
            <div ref="memoryGaugeRef" class="w-16 h-16"></div>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2 text-white/60">
            <span>{{ getMemoryTrendIcon() }}</span>
            <span>{{ getMemoryTrendText() }}</span>
          </div>
          <div class="text-white/60">
            {{ getMemoryUsage() }}
          </div>
        </div>
      </div>

      <!-- 磁盘指标 -->
      <div class="metric-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span class="text-xl">💿</span>
            </div>
            <div>
              <h4 class="text-white font-medium">磁盘使用率</h4>
              <div class="text-2xl font-bold text-white">{{ currentMetrics.disk.toFixed(2) }}%</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :class="getMetricStatusClass(currentMetrics.disk)"></div>
            <div ref="diskGaugeRef" class="w-16 h-16"></div>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2 text-white/60">
            <span>{{ getDiskTrendIcon() }}</span>
            <span>{{ getDiskTrendText() }}</span>
          </div>
          <div class="text-white/60">
            {{ getDiskUsage() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { D3Visualizer } from '@/utils/d3Visualizer'

// 响应式数据
const cpuGaugeRef = ref<HTMLElement>()
const memoryGaugeRef = ref<HTMLElement>()
const diskGaugeRef = ref<HTMLElement>()

// 当前指标数据 - 从原文件复制
const currentMetrics = ref({
  cpu: 45,
  memory: 68,
  disk: 32
})

// 历史指标数据用于趋势分析 - 从原文件复制
const previousMetrics = ref({
  cpu: 42,
  memory: 65,
  disk: 35
})

// D3仪表盘实例
let cpuGauge: D3Visualizer | null = null
let memoryGauge: D3Visualizer | null = null
let diskGauge: D3Visualizer | null = null
let updateTimer: number | null = null

// 系统状态相关方法 - 从原文件复制
const getSystemStatus = () => {
  const avgUsage = (currentMetrics.value.cpu + currentMetrics.value.memory + currentMetrics.value.disk) / 3
  if (avgUsage < 50) return '正常'
  if (avgUsage < 80) return '警告'
  return '危险'
}

const getSystemStatusType = (): 'success' | 'warning' | 'danger' => {
  const status = getSystemStatus()
  if (status === '正常') return 'success'
  if (status === '警告') return 'warning'
  return 'danger'
}

// 指标状态样式 - 从原文件复制
const getMetricStatusClass = (value: number) => {
  if (value < 50) return 'bg-green-400'
  if (value < 80) return 'bg-yellow-400'
  return 'bg-red-400'
}

// CPU 相关方法 - 从原文件复制
const getCpuTrend = () => {
  const diff = currentMetrics.value.cpu - previousMetrics.value.cpu
  if (diff > 2) return 'trend-up'
  if (diff < -2) return 'trend-down'
  return 'trend-stable'
}

const getCpuTrendIcon = () => {
  const trend = getCpuTrend()
  if (trend === 'trend-up') return '↗️'
  if (trend === 'trend-down') return '↘️'
  return '➡️'
}

const getCpuTrendText = () => {
  const diff = Math.abs(currentMetrics.value.cpu - previousMetrics.value.cpu)
  const trend = getCpuTrend()
  if (trend === 'trend-up') return `上升 ${diff.toFixed(2)}%`
  if (trend === 'trend-down') return `下降 ${diff.toFixed(2)}%`
  return '稳定'
}

const getCpuCores = () => {
  return '8核心'
}

// 内存相关方法 - 从原文件复制
const getMemoryTrend = () => {
  const diff = currentMetrics.value.memory - previousMetrics.value.memory
  if (diff > 2) return 'trend-up'
  if (diff < -2) return 'trend-down'
  return 'trend-stable'
}

const getMemoryTrendIcon = () => {
  const trend = getMemoryTrend()
  if (trend === 'trend-up') return '↗️'
  if (trend === 'trend-down') return '↘️'
  return '➡️'
}

const getMemoryTrendText = () => {
  const diff = Math.abs(currentMetrics.value.memory - previousMetrics.value.memory)
  const trend = getMemoryTrend()
  if (trend === 'trend-up') return `上升 ${diff.toFixed(2)}%`
  if (trend === 'trend-down') return `下降 ${diff.toFixed(2)}%`
  return '稳定'
}

const getMemoryUsage = () => {
  const used = (currentMetrics.value.memory / 100 * 16).toFixed(1)
  return `${used}GB / 16GB`
}

// 磁盘相关方法 - 从原文件复制
const getDiskTrend = () => {
  const diff = currentMetrics.value.disk - previousMetrics.value.disk
  if (diff > 2) return 'trend-up'
  if (diff < -2) return 'trend-down'
  return 'trend-stable'
}

const getDiskTrendIcon = () => {
  const trend = getDiskTrend()
  if (trend === 'trend-up') return '↗️'
  if (trend === 'trend-down') return '↘️'
  return '➡️'
}

const getDiskTrendText = () => {
  const diff = Math.abs(currentMetrics.value.disk - previousMetrics.value.disk)
  const trend = getDiskTrend()
  if (trend === 'trend-up') return `上升 ${diff.toFixed(2)}%`
  if (trend === 'trend-down') return `下降 ${diff.toFixed(2)}%`
  return '稳定'
}

const getDiskUsage = () => {
  const used = (currentMetrics.value.disk / 100 * 500).toFixed(0)
  return `${used}GB / 500GB`
}

// 初始化仪表盘
const initGauges = async () => {
  if (!cpuGaugeRef.value || !memoryGaugeRef.value || !diskGaugeRef.value) {
    console.warn('仪表盘容器未找到')
    return
  }

  try {
    cpuGauge = new D3Visualizer(cpuGaugeRef.value, {
      width: 64,
      height: 64,
      colors: ['#4facfe']
    })

    memoryGauge = new D3Visualizer(memoryGaugeRef.value, {
      width: 64,
      height: 64,
      colors: ['#43e97b']
    })

    diskGauge = new D3Visualizer(diskGaugeRef.value, {
      width: 64,
      height: 64,
      colors: ['#a855f7']
    })

    updateGauges()
  } catch (error) {
    console.error('仪表盘初始化失败:', error)
  }
}

const updateGauges = () => {
  cpuGauge?.renderGauge(currentMetrics.value.cpu, { title: 'CPU', unit: '%' })
  memoryGauge?.renderGauge(currentMetrics.value.memory, { title: '内存', unit: '%' })
  diskGauge?.renderGauge(currentMetrics.value.disk, { title: '磁盘', unit: '%' })
}

// 更新指标数据 - 从原文件复制
const updateMetrics = () => {
  // 保存之前的数据用于趋势分析
  previousMetrics.value = { ...currentMetrics.value }

  // 模拟数据变化
  currentMetrics.value.cpu = Math.max(0, Math.min(100, currentMetrics.value.cpu + (Math.random() - 0.5) * 10))
  currentMetrics.value.memory = Math.max(0, Math.min(100, currentMetrics.value.memory + (Math.random() - 0.5) * 8))
  currentMetrics.value.disk = Math.max(0, Math.min(100, currentMetrics.value.disk + (Math.random() - 0.5) * 3))

  updateGauges()
}

const startDataUpdate = () => {
  updateTimer = window.setInterval(updateMetrics, 2000)
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
  await initGauges()
  startDataUpdate()
})

onUnmounted(() => {
  stopDataUpdate()
  if (cpuGauge) cpuGauge.clear()
  if (memoryGauge) memoryGauge.clear()
  if (diskGauge) diskGauge.clear()
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

<style lang="scss" scoped>
.metric-card {
  @apply p-4 bg-black/20 rounded-xl border border-white/10;
}
</style>
