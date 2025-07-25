<template>
  <div class="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 h-[500px] flex flex-col">
    <!-- 日志头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold text-white mb-2">📝 实时日志</h3>
        <p class="text-white/60 text-sm">系统运行日志实时监控</p>
      </div>

      <div class="flex items-center gap-3">
        <button @click="clearLogs"
          class="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all duration-200">
          清空
        </button>

        <div class="flex items-center gap-2">
          <span class="text-white/60 text-sm">自动滚动</span>
          <button @click="toggleAutoScroll"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
            :class="autoScroll ? 'bg-blue-500' : 'bg-gray-600'">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
              :class="autoScroll ? 'translate-x-6' : 'translate-x-1'"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 日志内容 -->
    <div ref="logsContainer"
      class="flex-1 bg-black/20 rounded-xl overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      <div class="p-4 space-y-2">
        <div v-for="(log, index) in recentLogs" :key="index"
          class="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/5"
          :class="getLogItemClass(log.level)">
          <!-- 时间戳 -->
          <div class="text-xs text-white/60 font-mono min-w-[80px] mt-0.5">
            {{ formatTime(log.timestamp) }}
          </div>

          <!-- 日志级别 -->
          <div class="px-2 py-1 rounded text-xs font-bold min-w-[70px] text-center" :class="getLevelClass(log.level)">
            {{ log.level.toUpperCase() }}
          </div>

          <!-- 日志消息 -->
          <div class="flex-1 text-sm text-white/90">
            {{ log.message }}
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="recentLogs.length === 0" class="text-center py-12">
          <div class="text-white/40 text-lg mb-2">📋</div>
          <p class="text-white/60">暂无日志数据</p>
        </div>
      </div>
    </div>

    <!-- 日志统计 -->
    <div class="mt-4 flex items-center justify-between text-sm">
      <div class="flex items-center gap-4">
        <div class="text-white/60">
          总计: {{ recentLogs.length }} 条
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-blue-400"></div>
            <span class="text-white/60">信息: {{ getLogCount('info') }}</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
            <span class="text-white/60">警告: {{ getLogCount('warning') }}</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-red-400"></div>
            <span class="text-white/60">错误: {{ getLogCount('error') }}</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-green-400"></div>
            <span class="text-white/60">成功: {{ getLogCount('success') }}</span>
          </div>
        </div>
      </div>

      <div class="text-white/60">
        更新频率: 2秒
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const logsContainer = ref<HTMLElement>()
const autoScroll = ref(true)

// 日志数据 - 从原文件复制
const recentLogs = ref<Array<{
  timestamp: number
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
}>>([])

let logTimer: number | null = null

// 方法
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const getLogItemClass = (level: string) => {
  const classes = {
    info: 'border-l-4 border-blue-400/50',
    warning: 'border-l-4 border-yellow-400/50',
    error: 'border-l-4 border-red-400/50',
    success: 'border-l-4 border-green-400/50'
  }
  return classes[level as keyof typeof classes] || ''
}

const getLevelClass = (level: string) => {
  const classes = {
    info: 'bg-blue-500/20 text-blue-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    success: 'bg-green-500/20 text-green-400'
  }
  return classes[level as keyof typeof classes] || 'bg-gray-500/20 text-gray-400'
}

const getLogCount = (level: string) => {
  return recentLogs.value.filter(log => log.level === level).length
}

const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
}

const clearLogs = () => {
  recentLogs.value = []
  ElMessage.success('日志已清空')
}

// 生成日志 - 从原文件复制
const generateLogs = () => {
  const levels = ['info', 'warning', 'error', 'success'] as const
  const messages = [
    '用户登录成功',
    '数据库连接正常',
    '缓存更新完成',
    '系统负载较高',
    '磁盘空间不足',
    '网络延迟异常',
    '服务重启完成',
    '备份任务执行',
    'API请求处理完成',
    '内存使用率正常',
    '定时任务执行',
    '文件上传成功',
    '数据同步完成',
    '安全检查通过'
  ]

  const newLog = {
    timestamp: Date.now(),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)]
  }

  recentLogs.value.push(newLog)

  // 保持最近100条日志
  if (recentLogs.value.length > 100) {
    recentLogs.value.shift()
  }

  // 自动滚动到底部
  if (autoScroll.value && logsContainer.value) {
    nextTick(() => {
      if (logsContainer.value) {
        logsContainer.value.scrollTop = logsContainer.value.scrollHeight
      }
    })
  }
}

const startLogGeneration = () => {
  // 生成一些初始日志
  for (let i = 0; i < 10; i++) {
    generateLogs()
  }

  // 定时生成新日志
  logTimer = window.setInterval(generateLogs, 2000)
}

const stopLogGeneration = () => {
  if (logTimer) {
    clearInterval(logTimer)
    logTimer = null
  }
}

// 生命周期
onMounted(() => {
  startLogGeneration()
})

onUnmounted(() => {
  stopLogGeneration()
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
