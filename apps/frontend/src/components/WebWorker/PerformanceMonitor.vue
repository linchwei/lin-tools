<template>
  <div class="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 
              rounded-2xl p-8 shadow-2xl border border-gray-700/50 
              backdrop-blur-sm">
    <h3 class="text-3xl font-bold text-white mb-8 flex items-center gap-3">
      📊 性能监控
    </h3>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 内存使用 -->
      <div class="monitor-card">
        <h4 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          💾 内存使用
        </h4>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-300">已使用:</span>
            <span class="text-white font-semibold">{{ formatBytes(memoryUsage.used) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">总计:</span>
            <span class="text-white font-semibold">{{ formatBytes(memoryUsage.total) }}</span>
          </div>
          <div class="mt-4">
            <el-progress 
              :percentage="memoryUsage.percentage" 
              :color="getMemoryColor(memoryUsage.percentage)"
              :stroke-width="8"
              class="memory-progress"
            />
          </div>
        </div>
      </div>

      <!-- Worker状态 -->
      <div class="monitor-card">
        <h4 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          ⚡ Worker状态
        </h4>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-300">活跃Worker:</span>
            <span class="text-white font-semibold">{{ totalActiveWorkers }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">总任务数:</span>
            <span class="text-white font-semibold">{{ totalTasks }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">完成任务:</span>
            <span class="text-white font-semibold">{{ completedTasks }}</span>
          </div>
        </div>
      </div>

      <!-- 性能指标 -->
      <div class="monitor-card">
        <h4 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          🚀 性能指标
        </h4>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-300">平均延迟:</span>
            <span class="text-white font-semibold">{{ averageLatency }}ms</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">吞吐量:</span>
            <span class="text-white font-semibold">{{ throughput }}/s</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">错误率:</span>
            <span class="text-white font-semibold">{{ errorRate }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElProgress } from 'element-plus'

interface Props {
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  totalActiveWorkers: number
  totalTasks: number
  completedTasks: number
  averageLatency: number
  throughput: number
  errorRate: number
}

const props = withDefaults(defineProps<Props>(), {
  memoryUsage: () => ({ used: 0, total: 0, percentage: 0 }),
  totalActiveWorkers: 0,
  totalTasks: 0,
  completedTasks: 0,
  averageLatency: 0,
  throughput: 0,
  errorRate: 0
})

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getMemoryColor = (percentage: number): string => {
  if (percentage < 50) return '#10b981'
  if (percentage < 80) return '#f59e0b'
  return '#ef4444'
}
</script>

<style lang="scss" scoped>
.monitor-card {
  @apply bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 
         hover:bg-white/15 transition-all duration-300;
}

.memory-progress {
  :deep(.el-progress-bar__outer) {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
