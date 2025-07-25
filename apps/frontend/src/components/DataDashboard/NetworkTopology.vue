<template>
  <div class="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
    <!-- 网络拓扑头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold text-white mb-2">🔗 网络拓扑</h3>
        <p class="text-white/60 text-sm">网络节点连接状态监控</p>
      </div>

      <div class="flex items-center gap-3">
        <button @click="resetTopology"
          class="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all duration-200">
          重置
        </button>

        <div class="flex items-center gap-2">
          <span class="text-white/60 text-sm">动画</span>
          <button @click="toggleAnimation"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
            :class="isAnimating ? 'bg-green-500' : 'bg-gray-600'">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
              :class="isAnimating ? 'translate-x-6' : 'translate-x-1'"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 网络拓扑容器 -->
    <div class="relative h-80 bg-black/20 rounded-xl overflow-hidden">
      <div ref="networkTopologyRef" class="w-full h-full"></div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/50">
        <div class="text-center">
          <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2">
          </div>
          <p class="text-white/80 text-sm">加载网络拓扑中...</p>
        </div>
      </div>

      <!-- 节点信息面板 -->
      <div v-if="selectedNode" class="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 min-w-[200px]">
        <div class="text-white font-medium mb-2">{{ selectedNode.name }}</div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-white/60">状态:</span>
            <span :class="getNodeStatusClass(selectedNode.status)">{{ selectedNode.status }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">延迟:</span>
            <span class="text-white">{{ selectedNode.latency }}ms</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">连接数:</span>
            <span class="text-white">{{ selectedNode.connections }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">流量:</span>
            <span class="text-white">{{ selectedNode.traffic }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 网络统计 -->
    <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-green-400">{{ networkStats.activeNodes }}</div>
        <div class="text-xs text-white/60">活跃节点</div>
      </div>

      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-blue-400">{{ networkStats.connections }}</div>
        <div class="text-xs text-white/60">连接数</div>
      </div>

      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-yellow-400">{{ networkStats.avgLatency }}</div>
        <div class="text-xs text-white/60">平均延迟(ms)</div>
      </div>

      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-purple-400">{{ networkStats.throughput }}</div>
        <div class="text-xs text-white/60">吞吐量(MB/s)</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { AdvancedVisualizer } from '@/utils/advancedVisualizer'

// 响应式数据
const networkTopologyRef = ref<HTMLElement>()
const isLoading = ref(true)
const isAnimating = ref(true)
const selectedNode = ref<any>(null)

// 网络节点数据 - 从原文件复制
const networkNodes = ref([
  {
    id: 1,
    x: 100,
    y: 100,
    name: '主节点',
    status: '正常',
    latency: 12,
    connections: 4,
    traffic: '156MB/s'
  },
  {
    id: 2,
    x: 200,
    y: 50,
    name: '节点A',
    status: '正常',
    latency: 8,
    connections: 2,
    traffic: '89MB/s'
  },
  {
    id: 3,
    x: 300,
    y: 100,
    name: '节点B',
    status: '警告',
    latency: 25,
    connections: 3,
    traffic: '234MB/s'
  },
  {
    id: 4,
    x: 200,
    y: 150,
    name: '节点C',
    status: '正常',
    latency: 15,
    connections: 2,
    traffic: '67MB/s'
  },
  {
    id: 5,
    x: 250,
    y: 200,
    name: '节点D',
    status: '错误',
    latency: 45,
    connections: 1,
    traffic: '12MB/s'
  }
])

// 网络连接数据 - 从原文件复制
const networkConnections = ref([
  { source: 1, target: 2 },
  { source: 1, target: 3 },
  { source: 1, target: 4 },
  { source: 2, target: 3 },
  { source: 3, target: 5 }
])

// 网络统计
const networkStats = ref({
  activeNodes: 5,
  connections: 5,
  avgLatency: 21,
  throughput: 112
})

// 网络可视化实例
let networkVisualizer: AdvancedVisualizer | null = null
let animationTimer: number | null = null

// 方法
const getNodeStatusClass = (status: string) => {
  const classes = {
    '正常': 'text-green-400',
    '警告': 'text-yellow-400',
    '错误': 'text-red-400'
  }
  return classes[status as keyof typeof classes] || 'text-gray-400'
}

const initNetworkTopology = async () => {
  if (!networkTopologyRef.value) {
    console.warn('网络拓扑容器未找到')
    isLoading.value = false
    return
  }

  try {
    // 确保容器有尺寸
    const width = networkTopologyRef.value.clientWidth || 400
    const height = networkTopologyRef.value.clientHeight || 320

    // 从原文件复制的网络可视化初始化
    networkVisualizer = new AdvancedVisualizer(
      networkTopologyRef.value,
      width,
      height
    )

    // 创建网络拓扑
    createNetworkTopology()

    isLoading.value = false
    updateNetworkStats()
  } catch (error) {
    console.error('网络拓扑初始化失败:', error)
    isLoading.value = false
  }
}

const createNetworkTopology = () => {
  if (!networkVisualizer) return

  // 创建连接线和数据流
  networkConnections.value.forEach((connection, index) => {
    const sourceNode = networkNodes.value.find(n => n.id === connection.source)
    const targetNode = networkNodes.value.find(n => n.id === connection.target)

    if (sourceNode && targetNode) {
      setTimeout(() => {
        networkVisualizer!.createDataFlow(
          [sourceNode.x, sourceNode.y],
          [targetNode.x, targetNode.y],
          [{ name: `数据包${index + 1}`, value: Math.random() * 100 }]
        )
      }, index * 800)
    }
  })

  // 添加节点脉冲动画
  if (isAnimating.value) {
    networkNodes.value.forEach((node, index) => {
      setTimeout(() => {
        const color = node.status === '正常' ? '#43e97b' :
          node.status === '警告' ? '#ffa502' : '#ff4757'

        networkVisualizer!.createPulseAnimation({
          center: [node.x, node.y],
          maxRadius: 20,
          duration: 1500,
          color,
          opacity: 0.7,
          strokeWidth: 1
        })
      }, index * 300)
    })
  }
}

const resetTopology = () => {
  if (networkVisualizer) {
    networkVisualizer.clear()
    createNetworkTopology()
  }
  selectedNode.value = null
}

const toggleAnimation = () => {
  isAnimating.value = !isAnimating.value

  if (isAnimating.value) {
    startAnimation()
  } else {
    stopAnimation()
  }
}

const startAnimation = () => {
  if (animationTimer) return

  animationTimer = window.setInterval(() => {
    if (isAnimating.value && networkVisualizer) {
      // 随机选择一个连接进行数据流动画
      const randomConnection = networkConnections.value[
        Math.floor(Math.random() * networkConnections.value.length)
      ]

      const sourceNode = networkNodes.value.find(n => n.id === randomConnection.source)
      const targetNode = networkNodes.value.find(n => n.id === randomConnection.target)

      if (sourceNode && targetNode) {
        networkVisualizer.createDataFlow(
          [sourceNode.x, sourceNode.y],
          [targetNode.x, targetNode.y],
          [{ name: '数据包', value: Math.random() * 100 }]
        )
      }
    }
  }, 2000)
}

const stopAnimation = () => {
  if (animationTimer) {
    clearInterval(animationTimer)
    animationTimer = null
  }
}

const updateNetworkStats = () => {
  // 模拟网络统计数据更新
  const activeNodes = networkNodes.value.filter(n => n.status !== '错误').length
  const avgLatency = Math.round(
    networkNodes.value.reduce((sum, node) => sum + node.latency, 0) / networkNodes.value.length
  )

  networkStats.value = {
    activeNodes,
    connections: networkConnections.value.length,
    avgLatency,
    throughput: Math.floor(Math.random() * 50) + 80
  }
}

// 生命周期
onMounted(async () => {
  await nextTick()
  await initNetworkTopology()
  startAnimation()

  // 定时更新统计数据
  setInterval(updateNetworkStats, 3000)
})

onUnmounted(() => {
  stopAnimation()
  if (networkVisualizer) {
    networkVisualizer.cleanup()
  }
})
</script>

<style lang="scss" scoped>
// 只保留必要的自定义样式</style>
