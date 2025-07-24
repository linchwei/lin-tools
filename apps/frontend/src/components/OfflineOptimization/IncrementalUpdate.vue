<template>
  <div class="incremental-update text-white">
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-4 flex items-center gap-3">
        🔄 增量更新策略
      </h2>
      <p class="text-lg opacity-90 leading-relaxed">
        智能的版本管理和增量更新机制，支持自动检测、下载和应用更新
      </p>
    </div>

    <!-- 更新状态面板 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 更新状态 -->
      <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
          📊 更新状态
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="opacity-80">当前版本:</span>
            <span class="font-semibold">{{ updateInfo.currentVersion }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">最新版本:</span>
            <span class="font-semibold">{{ updateInfo.latestVersion }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">更新状态:</span>
            <span 
              :class="{
                'text-green-400': updateInfo.status === 'up-to-date',
                'text-yellow-400': ['checking', 'downloading', 'updating'].includes(updateInfo.status),
                'text-blue-400': updateInfo.status === 'ready'
              }" 
              class="font-semibold"
            >
              {{ getUpdateStatusText() }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">检查时间:</span>
            <span class="font-semibold">{{ updateInfo.lastCheck }}</span>
          </div>
        </div>
      </div>

      <!-- 更新控制 -->
      <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
          🎮 更新控制
        </h3>
        <div class="space-y-3">
          <button 
            @click="checkForUpdates" 
            :disabled="loading.check"
            class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.check" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.check ? '检查中...' : '检查更新' }}
          </button>
          
          <button 
            @click="downloadUpdate" 
            :disabled="!updateInfo.hasUpdate || loading.download"
            class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.download" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.download ? '下载中...' : '下载更新' }}
          </button>
          
          <button 
            @click="applyUpdate" 
            :disabled="updateInfo.status !== 'ready' || loading.apply"
            class="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.apply" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.apply ? '应用中...' : '应用更新' }}
          </button>
          
          <button 
            @click="rollbackUpdate" 
            :disabled="loading.rollback"
            class="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.rollback" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.rollback ? '回滚中...' : '回滚版本' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 更新进度 -->
    <div v-if="updateInfo.status === 'downloading'" class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8">
      <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
        📥 下载进度
      </h3>
      <div class="mb-4">
        <div class="flex justify-between text-sm mb-2">
          <span>{{ updateProgress.percentage }}%</span>
          <span>{{ updateProgress.downloaded }} / {{ updateProgress.total }}</span>
        </div>
        <div class="w-full bg-white/20 rounded-full h-2">
          <div 
            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: updateProgress.percentage + '%' }"
          ></div>
        </div>
      </div>
      <div class="flex justify-between text-sm opacity-70">
        <span>下载速度: {{ updateProgress.speed }}</span>
        <span>剩余时间: {{ updateProgress.remaining }}</span>
      </div>
    </div>

    <!-- 更新策略配置 -->
    <div class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8">
      <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
        ⚙️ 更新策略
      </h3>
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">更新模式</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2">
              <input 
                type="radio" 
                v-model="updateStrategy.mode" 
                value="auto"
                @change="updateStrategyMode"
                class="text-blue-500"
              />
              <span>自动更新</span>
            </label>
            <label class="flex items-center gap-2">
              <input 
                type="radio" 
                v-model="updateStrategy.mode" 
                value="manual"
                @change="updateStrategyMode"
                class="text-blue-500"
              />
              <span>手动更新</span>
            </label>
            <label class="flex items-center gap-2">
              <input 
                type="radio" 
                v-model="updateStrategy.mode" 
                value="scheduled"
                @change="updateStrategyMode"
                class="text-blue-500"
              />
              <span>定时更新</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="flex items-center gap-2">
            <input 
              type="checkbox" 
              v-model="updateStrategy.autoRestart"
              @change="updateStrategyMode"
              class="text-blue-500"
            />
            <span>更新后自动重启</span>
          </label>
          <label class="flex items-center gap-2">
            <input 
              type="checkbox" 
              v-model="updateStrategy.backgroundDownload"
              @change="updateStrategyMode"
              class="text-blue-500"
            />
            <span>后台下载</span>
          </label>
          <label class="flex items-center gap-2">
            <input 
              type="checkbox" 
              v-model="updateStrategy.deltaUpdate"
              @change="updateStrategyMode"
              class="text-blue-500"
            />
            <span>增量更新</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 更新历史 -->
    <div class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
      <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
        📜 更新历史
      </h3>
      <div class="space-y-4">
        <div 
          v-for="update in updateHistory" 
          :key="update.version"
          class="bg-white/10 rounded-lg p-4"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold">{{ update.version }}</span>
            <span class="text-sm opacity-70">{{ update.date }}</span>
          </div>
          <p class="text-sm opacity-80 mb-2">{{ update.description }}</p>
          <div class="flex justify-between text-xs opacity-60">
            <span>大小: {{ update.size }}</span>
            <span>耗时: {{ update.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 更新信息
const updateInfo = reactive({
  currentVersion: 'v1.2.0',
  latestVersion: 'v1.3.0',
  status: 'up-to-date' as 'up-to-date' | 'checking' | 'downloading' | 'ready' | 'updating',
  hasUpdate: false,
  lastCheck: '10分钟前'
})

// 加载状态
const loading = reactive({
  check: false,
  download: false,
  apply: false,
  rollback: false
})

// 更新进度
const updateProgress = reactive({
  percentage: 0,
  downloaded: '0 MB',
  total: '0 MB',
  speed: '0 KB/s',
  remaining: '0分钟'
})

// 更新策略
const updateStrategy = reactive({
  mode: 'manual',
  autoRestart: false,
  backgroundDownload: true,
  deltaUpdate: true
})

// 更新历史
const updateHistory = [
  {
    version: 'v1.2.0',
    date: '2024-01-15',
    description: '修复了缓存策略的bug，优化了网络检测',
    size: '2.3 MB',
    duration: '45秒'
  },
  {
    version: 'v1.1.0',
    date: '2024-01-10',
    description: '新增了增量更新功能，提升了性能',
    size: '1.8 MB',
    duration: '32秒'
  }
]

// 方法
const getUpdateStatusText = () => {
  switch (updateInfo.status) {
    case 'up-to-date': return '最新版本'
    case 'checking': return '检查中'
    case 'downloading': return '下载中'
    case 'ready': return '准备更新'
    case 'updating': return '更新中'
    default: return '未知'
  }
}

const checkForUpdates = async () => {
  loading.check = true
  updateInfo.status = 'checking'
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    updateInfo.hasUpdate = true
    updateInfo.latestVersion = 'v1.3.0'
    updateInfo.status = 'ready'
    updateInfo.lastCheck = '刚刚'
    ElMessage.success('发现新版本 v1.3.0')
  } catch (error) {
    ElMessage.error('检查更新失败')
    updateInfo.status = 'up-to-date'
  } finally {
    loading.check = false
  }
}

const downloadUpdate = async () => {
  loading.download = true
  updateInfo.status = 'downloading'
  
  try {
    updateProgress.total = '2.5 MB'
    
    for (let i = 0; i <= 100; i += 10) {
      updateProgress.percentage = i
      updateProgress.downloaded = `${(i * 0.025).toFixed(1)} MB`
      updateProgress.speed = `${Math.random() * 500 + 200}KB/s`
      updateProgress.remaining = `${Math.ceil((100 - i) / 10)}分钟`
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    updateInfo.status = 'ready'
    ElMessage.success('更新下载完成')
  } catch (error) {
    ElMessage.error('下载更新失败')
    updateInfo.status = 'up-to-date'
  } finally {
    loading.download = false
  }
}

const applyUpdate = async () => {
  loading.apply = true
  updateInfo.status = 'updating'
  
  try {
    await new Promise(resolve => setTimeout(resolve, 3000))
    updateInfo.currentVersion = updateInfo.latestVersion
    updateInfo.status = 'up-to-date'
    updateInfo.hasUpdate = false
    ElMessage.success('更新应用成功')
  } catch (error) {
    ElMessage.error('应用更新失败')
  } finally {
    loading.apply = false
  }
}

const rollbackUpdate = async () => {
  loading.rollback = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('版本回滚成功')
  } catch (error) {
    ElMessage.error('版本回滚失败')
  } finally {
    loading.rollback = false
  }
}

const updateStrategyMode = () => {
  ElMessage.success('更新策略已保存')
}
</script>
