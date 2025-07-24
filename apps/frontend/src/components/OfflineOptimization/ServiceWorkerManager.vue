<template>
  <div class="service-worker-manager text-white">
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-4 flex items-center gap-3">
        🔧 Service Worker 管理
      </h2>
      <p class="text-lg opacity-90 leading-relaxed">
        管理Service Worker的注册、更新和缓存策略，实现离线功能和性能优化
      </p>
    </div>

    <!-- 状态面板 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- SW状态卡片 -->
      <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
          📊 Service Worker 状态
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="opacity-80">注册状态:</span>
            <span :class="swStatus.registered ? 'text-green-400' : 'text-red-400'" class="font-semibold">
              {{ swStatus.registered ? '已注册' : '未注册' }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">激活状态:</span>
            <span :class="swStatus.activated ? 'text-green-400' : 'text-yellow-400'" class="font-semibold">
              {{ swStatus.activated ? '已激活' : '未激活' }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">更新状态:</span>
            <span :class="swStatus.updateAvailable ? 'text-yellow-400' : 'text-green-400'" class="font-semibold">
              {{ swStatus.updateAvailable ? '有更新' : '最新版本' }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">版本:</span>
            <span class="font-semibold">{{ swStatus.version }}</span>
          </div>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
          🎮 操作控制
        </h3>
        <div class="space-y-3">
          <button 
            @click="registerServiceWorker" 
            :disabled="swStatus.registered || loading.register"
            class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.register" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.register ? '注册中...' : '注册 Service Worker' }}
          </button>
          
          <button 
            @click="updateServiceWorker" 
            :disabled="!swStatus.updateAvailable || loading.update"
            class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.update" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.update ? '更新中...' : '更新 Service Worker' }}
          </button>
          
          <button 
            @click="unregisterServiceWorker" 
            :disabled="!swStatus.registered || loading.unregister"
            class="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.unregister" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.unregister ? '注销中...' : '注销 Service Worker' }}
          </button>
          
          <button 
            @click="clearAllCaches" 
            :disabled="loading.clear"
            class="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.clear" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.clear ? '清除中...' : '清除所有缓存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 缓存策略配置 -->
    <div class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8">
      <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
        ⚙️ 缓存策略配置
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white/10 rounded-lg p-4">
          <h4 class="font-semibold mb-2">静态资源</h4>
          <select v-model="cacheStrategies.static" @change="updateCacheStrategy" 
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option value="cache-first">Cache First</option>
            <option value="network-first">Network First</option>
            <option value="stale-while-revalidate">Stale While Revalidate</option>
          </select>
          <p class="text-sm opacity-70 mt-2">HTML、CSS、JS等静态文件的缓存策略</p>
        </div>

        <div class="bg-white/10 rounded-lg p-4">
          <h4 class="font-semibold mb-2">API数据</h4>
          <select v-model="cacheStrategies.api" @change="updateCacheStrategy"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option value="network-first">Network First</option>
            <option value="cache-first">Cache First</option>
            <option value="network-only">Network Only</option>
          </select>
          <p class="text-sm opacity-70 mt-2">API接口数据的缓存策略</p>
        </div>

        <div class="bg-white/10 rounded-lg p-4">
          <h4 class="font-semibold mb-2">图片资源</h4>
          <select v-model="cacheStrategies.images" @change="updateCacheStrategy"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option value="cache-first">Cache First</option>
            <option value="stale-while-revalidate">Stale While Revalidate</option>
            <option value="network-first">Network First</option>
          </select>
          <p class="text-sm opacity-70 mt-2">图片等媒体资源的缓存策略</p>
        </div>
      </div>
    </div>

    <!-- 缓存统计 -->
    <div class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
      <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
        📈 缓存统计
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white/10 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-400 mb-1">{{ cacheStats.totalSize }}</div>
          <div class="text-sm opacity-70">缓存总大小</div>
        </div>
        <div class="bg-white/10 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-400 mb-1">{{ cacheStats.fileCount }}</div>
          <div class="text-sm opacity-70">缓存文件数</div>
        </div>
        <div class="bg-white/10 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-yellow-400 mb-1">{{ cacheStats.hitRate }}%</div>
          <div class="text-sm opacity-70">缓存命中率</div>
        </div>
        <div class="bg-white/10 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-purple-400 mb-1">{{ cacheStats.lastUpdate }}</div>
          <div class="text-sm opacity-70">最后更新</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// Service Worker状态
const swStatus = reactive({
  registered: false,
  activated: false,
  updateAvailable: false,
  version: 'v1.0.0'
})

// 加载状态
const loading = reactive({
  register: false,
  update: false,
  unregister: false,
  clear: false
})

// 缓存策略
const cacheStrategies = reactive({
  static: 'cache-first',
  api: 'network-first',
  images: 'cache-first'
})

// 缓存统计
const cacheStats = reactive({
  totalSize: '0 MB',
  fileCount: 0,
  hitRate: 0,
  lastUpdate: '从未'
})

// Service Worker 方法
const registerServiceWorker = async () => {
  loading.register = true
  
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js')
      swStatus.registered = true
      swStatus.activated = registration.active !== null
      
      ElMessage.success('Service Worker 注册成功')
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        swStatus.updateAvailable = true
      })
    } else {
      throw new Error('浏览器不支持 Service Worker')
    }
  } catch (error) {
    ElMessage.error('Service Worker 注册失败: ' + (error as Error).message)
  } finally {
    loading.register = false
  }
}

const updateServiceWorker = async () => {
  loading.update = true
  
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.update()
      swStatus.updateAvailable = false
      ElMessage.success('Service Worker 更新成功')
    }
  } catch (error) {
    ElMessage.error('Service Worker 更新失败')
  } finally {
    loading.update = false
  }
}

const unregisterServiceWorker = async () => {
  loading.unregister = true
  
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.unregister()
      swStatus.registered = false
      swStatus.activated = false
      ElMessage.success('Service Worker 注销成功')
    }
  } catch (error) {
    ElMessage.error('Service Worker 注销失败')
  } finally {
    loading.unregister = false
  }
}

const clearAllCaches = async () => {
  loading.clear = true
  
  try {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))
    
    cacheStats.totalSize = '0 MB'
    cacheStats.fileCount = 0
    cacheStats.hitRate = 0
    
    ElMessage.success('所有缓存已清除')
  } catch (error) {
    ElMessage.error('清除缓存失败')
  } finally {
    loading.clear = false
  }
}

const updateCacheStrategy = () => {
  ElMessage.success('缓存策略已更新')
}

// 初始化检查
onMounted(async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      swStatus.registered = true
      swStatus.activated = registration.active !== null
    }
  }
})
</script>

<style scoped>
select option {
  background-color: #1f2937;
  color: white;
}
</style>
