<template>
  <div class="max-w-7xl mx-auto mt-12">
    <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white">
      <h2 class="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
        📊 系统状态总览
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="item in globalStatusItems" :key="item.title"
          class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:transform hover:scale-105">
          <div class="flex items-center gap-4">
            <div class="text-3xl">{{ item.icon }}</div>
            <div class="flex-1">
              <h3 class="font-semibold text-lg mb-1">{{ item.title }}</h3>
              <div class="font-bold text-xl" :class="{
                'text-green-400': item.status === 'success',
                'text-yellow-400': item.status === 'warning',
                'text-red-400': item.status === 'error',
                'text-blue-400': item.status === 'info'
              }">
                {{ item.value }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细统计 -->
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 性能指标 -->
        <div class="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
            ⚡ 性能指标
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="opacity-80">页面加载时间:</span>
              <span class="font-semibold text-green-400">{{ performanceMetrics.loadTime }}ms</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="opacity-80">首次内容绘制:</span>
              <span class="font-semibold text-blue-400">{{ performanceMetrics.fcp }}ms</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="opacity-80">最大内容绘制:</span>
              <span class="font-semibold text-yellow-400">{{ performanceMetrics.lcp }}ms</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="opacity-80">累积布局偏移:</span>
              <span class="font-semibold text-purple-400">{{ performanceMetrics.cls }}</span>
            </div>
          </div>
        </div>

        <!-- 资源使用 -->
        <div class="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
            💾 资源使用
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="opacity-80">内存使用:</span>
              <span class="font-semibold text-green-400">{{ resourceUsage.memory }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="opacity-80">存储配额:</span>
              <span class="font-semibold text-blue-400">{{ resourceUsage.storage }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="opacity-80">缓存大小:</span>
              <span class="font-semibold text-yellow-400">{{ resourceUsage.cache }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="opacity-80">数据库大小:</span>
              <span class="font-semibold text-purple-400">{{ resourceUsage.database }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
          🚀 快速操作
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button @click="refreshAllData" :disabled="loading.refresh"
            class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
            <div v-if="loading.refresh"
              class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.refresh ? '刷新中...' : '刷新数据' }}
          </button>

          <button @click="clearAllData" :disabled="loading.clear"
            class="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
            <div v-if="loading.clear" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full">
            </div>
            {{ loading.clear ? '清除中...' : '清除数据' }}
          </button>

          <button @click="exportData" :disabled="loading.export"
            class="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
            <div v-if="loading.export"
              class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.export ? '导出中...' : '导出数据' }}
          </button>

          <button @click="runDiagnostics" :disabled="loading.diagnostics"
            class="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
            <div v-if="loading.diagnostics"
              class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.diagnostics ? '诊断中...' : '系统诊断' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useGlobalStatus } from './composables/useGlobalStatus'

// 使用全局状态composable
const { globalStatusItems } = useGlobalStatus()

// 性能指标
const performanceMetrics = reactive({
  loadTime: 1250,
  fcp: 890,
  lcp: 1420,
  cls: 0.05
})

// 资源使用
const resourceUsage = reactive({
  memory: '45.2 MB',
  storage: '128 MB / 2 GB',
  cache: '12.8 MB',
  database: '8.4 MB'
})

// 加载状态
const loading = reactive({
  refresh: false,
  clear: false,
  export: false,
  diagnostics: false
})

// 快速操作方法
const refreshAllData = async () => {
  loading.refresh = true
  try {
    // 模拟刷新数据
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('数据刷新完成')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.refresh = false
  }
}

const clearAllData = async () => {
  loading.clear = true
  try {
    // 模拟清除数据
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('数据清除完成')
  } catch (error) {
    ElMessage.error('数据清除失败')
  } finally {
    loading.clear = false
  }
}

const exportData = async () => {
  loading.export = true
  try {
    // 模拟导出数据
    const data = {
      timestamp: new Date().toISOString(),
      status: globalStatusItems.value,
      performance: performanceMetrics,
      resources: resourceUsage
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `offline-optimization-status-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
    ElMessage.success('数据导出完成')
  } catch (error) {
    ElMessage.error('数据导出失败')
  } finally {
    loading.export = false
  }
}

const runDiagnostics = async () => {
  loading.diagnostics = true
  try {
    // 模拟系统诊断
    await new Promise(resolve => setTimeout(resolve, 3000))
    ElMessage.success('系统诊断完成，一切正常')
  } catch (error) {
    ElMessage.error('系统诊断失败')
  } finally {
    loading.diagnostics = false
  }
}

// 获取性能指标
const getPerformanceMetrics = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      performanceMetrics.loadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart)
    }
  }
}

// 获取资源使用情况
const getResourceUsage = async () => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const quota = estimate.quota || 0

      resourceUsage.storage = `${(used / 1024 / 1024).toFixed(1)} MB / ${(quota / 1024 / 1024 / 1024).toFixed(1)} GB`
    }

    if ('memory' in performance) {
      const memory = (performance as any).memory
      resourceUsage.memory = `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB`
    }
  } catch (error) {
    console.error('获取资源使用情况失败:', error)
  }
}

onMounted(() => {
  getPerformanceMetrics()
  getResourceUsage()
})
</script>
