<template>
  <div class="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 mb-6">
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <!-- 左侧标题和状态 -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            🚀 实时数据大屏
          </h1>
        </div>
        
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <div 
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="{
                'bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse': connectionStatus === 'connected',
                'bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse': connectionStatus === 'connecting',
                'bg-red-400 shadow-lg shadow-red-400/50': connectionStatus === 'disconnected'
              }"
            ></div>
            <span class="text-white/80 text-sm font-medium">{{ connectionText }}</span>
          </div>
          <div class="text-white/60 text-xs">
            最后更新: {{ lastUpdateTime }}
          </div>
        </div>
      </div>

      <!-- 右侧控制按钮 -->
      <div class="flex items-center gap-3">
        <button
          @click="toggleAutoRefresh"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="isAutoRefresh 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
            : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
          </svg>
          {{ isAutoRefresh ? '停止自动刷新' : '开启自动刷新' }}
        </button>

        <button
          @click="refreshData"
          :disabled="isRefreshing"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg 
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'animate-spin': isRefreshing }"
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          手动刷新
        </button>

        <button
          @click="toggleFullscreen"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          全屏
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { WebSocketManager } from '@/utils/websocketManager'

// 响应式数据
const connectionStatus = ref<'connected' | 'connecting' | 'disconnected'>('disconnected')
const lastUpdateTime = ref('')
const isAutoRefresh = ref(true)
const isRefreshing = ref(false)

// WebSocket管理器
let wsManager: WebSocketManager | null = null
let updateTimer: number | null = null

// 计算属性
const connectionText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected': return '已连接'
    case 'connecting': return '连接中...'
    case 'disconnected': return '未连接'
    default: return '未知状态'
  }
})

// 方法
const initWebSocket = () => {
  wsManager = new WebSocketManager({
    url: 'ws://localhost:3001/dashboard',
    onOpen: () => {
      connectionStatus.value = 'connected'
      console.log('Dashboard WebSocket连接成功')
    },
    onClose: () => {
      connectionStatus.value = 'disconnected'
    },
    onError: (error) => {
      console.error('Dashboard WebSocket错误:', error)
      connectionStatus.value = 'disconnected'
    },
    onReconnect: (attempt) => {
      connectionStatus.value = 'connecting'
      console.log(`Dashboard WebSocket重连尝试: ${attempt}`)
    }
  })
}

const toggleAutoRefresh = () => {
  isAutoRefresh.value = !isAutoRefresh.value
  if (isAutoRefresh.value) {
    startUpdateTimer()
  } else {
    stopUpdateTimer()
  }
}

const refreshData = async () => {
  isRefreshing.value = true
  try {
    // 模拟数据刷新
    await new Promise(resolve => setTimeout(resolve, 1000))
    updateLastUpdateTime()
  } finally {
    isRefreshing.value = false
  }
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

const updateLastUpdateTime = () => {
  lastUpdateTime.value = new Date().toLocaleTimeString()
}

const startUpdateTimer = () => {
  if (updateTimer) return
  updateTimer = window.setInterval(() => {
    if (isAutoRefresh.value) {
      updateLastUpdateTime()
    }
  }, 2000)
}

const stopUpdateTimer = () => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

// 生命周期
onMounted(() => {
  updateLastUpdateTime()
  initWebSocket()
  startUpdateTimer()
  
  // 模拟连接状态变化
  setTimeout(() => {
    connectionStatus.value = 'connecting'
    setTimeout(() => {
      connectionStatus.value = 'connected'
    }, 1000)
  }, 500)
})

onUnmounted(() => {
  stopUpdateTimer()
  if (wsManager) {
    wsManager.disconnect()
  }
})
</script>

<style lang="scss" scoped>
// 使用Tailwind CSS，减少自定义样式
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .flex-col {
    align-items: flex-start !important;
  }
}
</style>
