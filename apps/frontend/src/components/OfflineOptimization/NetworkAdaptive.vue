<template>
  <div class="network-adaptive text-white">
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-4 flex items-center gap-3">
        🌐 网络自适应策略
      </h2>
      <p class="text-lg opacity-90 leading-relaxed">
        根据网络状况自动调整应用行为，优化用户体验和资源使用
      </p>
    </div>

    <!-- 网络监控面板 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 网络状态 -->
      <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
          📡 网络状态监控
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="opacity-80">连接状态:</span>
            <span :class="{
              'text-green-400': networkStatus === 'online',
              'text-red-400': networkStatus === 'offline',
              'text-yellow-400': networkStatus === 'slow'
            }" class="font-semibold">
              {{ getNetworkStatusText() }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">连接类型:</span>
            <span class="font-semibold">{{ networkInfo.type }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">网络质量:</span>
            <span class="font-semibold">{{ networkInfo.effectiveType }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">下行速度:</span>
            <span class="font-semibold">{{ networkInfo.downlink }} Mbps</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">RTT延迟:</span>
            <span class="font-semibold">{{ networkInfo.rtt }} ms</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">省流模式:</span>
            <span class="font-semibold">{{ networkInfo.saveData ? '开启' : '关闭' }}</span>
          </div>
        </div>
      </div>

      <!-- 网络质量评分 -->
      <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
          🎯 网络质量评分
        </h3>
        <div class="flex items-center justify-center">
          <div class="relative w-32 h-32">
            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
              <path d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" :stroke="getQualityColor()" stroke-width="2"
                :stroke-dasharray="`${networkQuality}, 100`" stroke-linecap="round" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-2xl font-bold">{{ networkQuality }}</div>
                <div class="text-sm opacity-70">{{ getNetworkQualityText() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自适应策略配置 -->
    <div class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8">
      <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
        ⚙️ 自适应策略配置
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white/10 rounded-lg p-4">
          <h4 class="font-semibold mb-2">图片质量</h4>
          <select v-model="adaptiveSettings.imageQuality" @change="updateAdaptiveSettings"
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option value="auto">自动</option>
            <option value="high">高质量</option>
            <option value="medium">中等质量</option>
            <option value="low">低质量</option>
          </select>
          <p class="text-sm opacity-70 mt-2">根据网络状况自动调整图片质量</p>
        </div>

        <div class="bg-white/10 rounded-lg p-4">
          <h4 class="font-semibold mb-2">预加载策略</h4>
          <select v-model="adaptiveSettings.preloadStrategy" @change="updateAdaptiveSettings"
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option value="smart">智能预加载</option>
            <option value="aggressive">积极预加载</option>
            <option value="conservative">保守预加载</option>
            <option value="disabled">禁用预加载</option>
          </select>
          <p class="text-sm opacity-70 mt-2">根据网络条件调整资源预加载</p>
        </div>

        <div class="bg-white/10 rounded-lg p-4">
          <h4 class="font-semibold mb-2">缓存策略</h4>
          <select v-model="adaptiveSettings.cacheStrategy" @change="updateAdaptiveSettings"
            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option value="adaptive">自适应</option>
            <option value="aggressive">积极缓存</option>
            <option value="minimal">最小缓存</option>
          </select>
          <p class="text-sm opacity-70 mt-2">根据网络状况调整缓存行为</p>
        </div>

        <div class="bg-white/10 rounded-lg p-4">
          <h4 class="font-semibold mb-2">离线模式</h4>
          <label class="flex items-center gap-2 mt-2">
            <input type="checkbox" v-model="adaptiveSettings.offlineMode" @change="updateAdaptiveSettings"
              class="text-blue-500" />
            <span>自动启用</span>
          </label>
          <p class="text-sm opacity-70 mt-2">网络不佳时自动启用离线模式</p>
        </div>
      </div>
    </div>

    <!-- 网络统计 -->
    <div class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
      <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
        📊 网络统计
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="bg-white/10 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-400 mb-1">{{ networkStats.totalRequests }}</div>
          <div class="text-sm opacity-70">总请求数</div>
        </div>
        <div class="bg-white/10 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-400 mb-1">{{ networkStats.cacheHits }}</div>
          <div class="text-sm opacity-70">缓存命中</div>
        </div>
        <div class="bg-white/10 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-yellow-400 mb-1">{{ Math.round((networkStats.cacheHits /
            networkStats.totalRequests) * 100) }}%</div>
          <div class="text-sm opacity-70">命中率</div>
        </div>
        <div class="bg-white/10 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-purple-400 mb-1">{{ networkStats.dataUsage }}</div>
          <div class="text-sm opacity-70">数据使用量</div>
        </div>
        <div class="bg-white/10 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-indigo-400 mb-1">{{ networkMetrics.stability }}%</div>
          <div class="text-sm opacity-70">网络稳定性</div>
        </div>
        <div class="bg-white/10 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-pink-400 mb-1">{{ networkMetrics.availability }}%</div>
          <div class="text-sm opacity-70">网络可用性</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useNetworkStatus } from './composables/useNetworkStatus'

// 使用网络状态composable
const {
  networkStatus,
  networkInfo,
  networkQuality,
  networkMetrics,
  getNetworkStatusText,
  getNetworkQualityText
} = useNetworkStatus()

// 自适应设置
const adaptiveSettings = reactive({
  imageQuality: 'auto',
  preloadStrategy: 'smart',
  cacheStrategy: 'adaptive',
  offlineMode: true
})

// 网络统计
const networkStats = reactive({
  totalRequests: 1234,
  cacheHits: 987,
  dataUsage: '45.2 MB'
})

// 获取质量颜色
const getQualityColor = () => {
  if (networkQuality.value >= 80) return '#10b981'
  if (networkQuality.value >= 60) return '#f59e0b'
  if (networkQuality.value >= 40) return '#ef4444'
  return '#ef4444'
}

// 更新自适应设置
const updateAdaptiveSettings = () => {
  ElMessage.success('自适应策略已更新')
  console.log('自适应设置:', adaptiveSettings)
}
</script>

<style scoped>
select option {
  background-color: #1f2937;
  color: white;
}
</style>
