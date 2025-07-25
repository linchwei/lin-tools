<template>
  <div class="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
    <!-- 地图头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold text-white mb-2">🌍 全球数据中心分布</h3>
        <p class="text-white/60 text-sm">全球服务器节点实时监控</p>
      </div>

      <div class="flex items-center gap-3">
        <button @click="resetGeoZoom"
          class="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all duration-200">
          重置视图
        </button>

        <div class="flex items-center gap-2">
          <span class="text-white/60 text-sm">显示连接</span>
          <button @click="toggleConnections"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
            :class="showConnections ? 'bg-blue-500' : 'bg-gray-600'">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
              :class="showConnections ? 'translate-x-6' : 'translate-x-1'"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="relative h-96 bg-black/20 rounded-xl overflow-hidden">
      <div ref="geoMapRef" class="w-full h-full"></div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/50">
        <div class="text-center">
          <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2">
          </div>
          <p class="text-white/80 text-sm">加载地图中...</p>
        </div>
      </div>

      <!-- 图例 -->
      <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
        <div class="space-y-2">
          <div v-for="item in geoLegend" :key="item.label" class="flex items-center gap-2 text-xs">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></div>
            <span class="text-white/80">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-blue-400">{{ stats.dataCenters }}</div>
        <div class="text-xs text-white/60">数据中心</div>
      </div>

      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-green-400">{{ stats.activeNodes }}</div>
        <div class="text-xs text-white/60">活跃节点</div>
      </div>

      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-yellow-400">{{ stats.connections }}</div>
        <div class="text-xs text-white/60">连接数</div>
      </div>

      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-purple-400">{{ stats.regions }}</div>
        <div class="text-xs text-white/60">覆盖区域</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { GeoVisualizer } from '@/utils/geoVisualizer'
import { worldMapData, majorCities, connections, getAllHotspots } from '@/utils/worldMapData'

// 响应式数据
const geoMapRef = ref<HTMLElement>()
const isLoading = ref(true)
const showConnections = ref(true)

// 图例数据 - 从原文件复制
const geoLegend = [
  { label: '主要数据中心', color: '#00f2fe' },
  { label: '次要节点', color: '#4facfe' },
  { label: '数据流', color: '#43e97b' },
  { label: '热点区域', color: '#ff6b6b' }
]

// 统计数据
const stats = ref({
  dataCenters: 12,
  activeNodes: 48,
  connections: 156,
  regions: 6
})

// 地理可视化实例
let geoVisualizer: GeoVisualizer | null = null

// 方法
const initGeoMap = async () => {
  if (!geoMapRef.value) {
    console.warn('地图容器未找到')
    isLoading.value = false
    return
  }

  try {
    // 确保容器有尺寸
    const width = geoMapRef.value.clientWidth || 800
    const height = geoMapRef.value.clientHeight || 400

    // 从原文件复制的地理可视化初始化
    geoVisualizer = new GeoVisualizer(geoMapRef.value, {
      width,
      height,
      colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#ff6b6b'],
      enableZoom: true,
      showGraticule: true
    })

    // 渲染世界地图
    geoVisualizer.renderWorldMap(worldMapData)

    // 渲染城市点
    geoVisualizer.renderCityPoints(majorCities, {
      radius: 6,
      color: '#00f2fe',
      showLabels: true
    })

    // 渲染热点
    const hotspots = getAllHotspots()
    geoVisualizer.renderHeatmapPoints(hotspots, {
      maxRadius: 30
    })

    // 渲染连接线
    if (showConnections.value) {
      geoVisualizer.renderConnections(connections, {
        strokeWidth: 2,
        animated: true
      })
    }

    isLoading.value = false
    updateStats()
  } catch (error) {
    console.error('地图初始化失败:', error)
    isLoading.value = false
  }
}

const resetGeoZoom = () => {
  if (geoVisualizer) {
    geoVisualizer.resetZoom()
  }
}

const toggleConnections = () => {
  showConnections.value = !showConnections.value

  if (geoVisualizer) {
    if (showConnections.value) {
      geoVisualizer.renderConnections(connections, {
        strokeWidth: 2,
        animated: true
      })
    } else {
      geoVisualizer.clearConnections()
    }
  }
}

const updateStats = () => {
  // 模拟统计数据更新
  stats.value = {
    dataCenters: majorCities.length,
    activeNodes: Math.floor(Math.random() * 20) + 40,
    connections: connections.length + Math.floor(Math.random() * 50),
    regions: 6
  }
}

// 生命周期
onMounted(async () => {
  await nextTick()
  await initGeoMap()

  // 定时更新统计数据
  setInterval(updateStats, 5000)
})

onUnmounted(() => {
  if (geoVisualizer) {
    geoVisualizer.cleanup()
  }
})
</script>

<style lang="scss" scoped>
// 只保留必要的自定义样式</style>
