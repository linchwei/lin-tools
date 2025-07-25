<template>
  <div class="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
    <!-- 数据流动画头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold text-white mb-2">💫 实时数据流</h3>
        <p class="text-white/60 text-sm">数据传输可视化动画</p>
      </div>

      <div class="flex items-center gap-3">
        <button @click="resetAnimation"
          class="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all duration-200">
          重置
        </button>

        <div class="flex items-center gap-2">
          <span class="text-white/60 text-sm">粒子流</span>
          <button @click="toggleParticleFlow"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
            :class="isFlowActive ? 'bg-green-500' : 'bg-gray-600'">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
              :class="isFlowActive ? 'translate-x-6' : 'translate-x-1'"></span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-white/60 text-sm">脉冲</span>
          <button @click="togglePulse"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
            :class="isPulseActive ? 'bg-purple-500' : 'bg-gray-600'">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
              :class="isPulseActive ? 'translate-x-6' : 'translate-x-1'"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 数据流动画容器 -->
    <div class="relative h-80 bg-black/20 rounded-xl overflow-hidden">
      <div ref="particleFlowRef" class="w-full h-full"></div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/50">
        <div class="text-center">
          <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2">
          </div>
          <p class="text-white/80 text-sm">初始化动画中...</p>
        </div>
      </div>

      <!-- 动画控制面板 -->
      <div class="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <span class="text-white/80 text-sm min-w-[60px]">速度:</span>
            <input type="range" min="1" max="5" v-model="animationSpeed" @input="updateAnimationSpeed" class="flex-1">
            <span class="text-white text-sm min-w-[20px]">{{ animationSpeed }}</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-white/80 text-sm min-w-[60px]">粒子数:</span>
            <input type="range" min="5" max="20" v-model="particleCount" @input="updateParticleCount" class="flex-1">
            <span class="text-white text-sm min-w-[20px]">{{ particleCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据流统计 -->
    <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-blue-400">{{ flowStats.activeStreams }}</div>
        <div class="text-xs text-white/60">活跃数据流</div>
      </div>

      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-green-400">{{ flowStats.particlesPerSecond }}</div>
        <div class="text-xs text-white/60">粒子/秒</div>
      </div>

      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-purple-400">{{ flowStats.pulseRate }}</div>
        <div class="text-xs text-white/60">脉冲频率</div>
      </div>

      <div class="text-center p-3 bg-black/20 rounded-lg">
        <div class="text-2xl font-bold text-yellow-400">{{ flowStats.dataTransfer }}</div>
        <div class="text-xs text-white/60">传输速率(MB/s)</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { AdvancedVisualizer } from '@/utils/advancedVisualizer'

// 响应式数据
const particleFlowRef = ref<HTMLElement>()
const isLoading = ref(true)
const isFlowActive = ref(true)
const isPulseActive = ref(true)
const animationSpeed = ref(2)
const particleCount = ref(8)

// 数据流路径 - 从原文件复制
const flowPaths = [
  'M50,150 Q200,50 350,150',
  'M50,100 Q200,200 350,100',
  'M50,200 Q200,100 350,200'
]

// 脉冲点位置 - 从原文件复制
const pulsePoints = [
  [100, 150],
  [300, 100],
  [200, 200]
]

// 数据流统计
const flowStats = ref({
  activeStreams: 3,
  particlesPerSecond: 24,
  pulseRate: 60,
  dataTransfer: 156
})

// 高级可视化实例
let advancedVisualizer: AdvancedVisualizer | null = null
let flowTimer: number | null = null
let pulseTimer: number | null = null

// 方法
const initDataFlowAnimation = async () => {
  if (!particleFlowRef.value) {
    console.warn('数据流动画容器未找到')
    isLoading.value = false
    return
  }

  try {
    // 确保容器有尺寸
    const width = particleFlowRef.value.clientWidth || 400
    const height = particleFlowRef.value.clientHeight || 320

    // 从原文件复制的粒子流可视化初始化
    advancedVisualizer = new AdvancedVisualizer(
      particleFlowRef.value,
      width,
      height
    )

    // 创建数据流动画
    initParticleFlow()

    isLoading.value = false
    updateFlowStats()
  } catch (error) {
    console.error('数据流动画初始化失败:', error)
    isLoading.value = false
  }
}

const initParticleFlow = () => {
  if (!advancedVisualizer) return

  // 创建多个数据流路径 - 从原文件复制
  if (isFlowActive.value) {
    flowPaths.forEach((pathData, index) => {
      setTimeout(() => {
        if (advancedVisualizer && isFlowActive.value) {
          advancedVisualizer.createParticleFlow({
            pathData,
            particleCount: particleCount.value,
            speed: animationSpeed.value,
            particleSize: 3,
            colors: ['#4facfe', '#00f2fe', '#43e97b'],
            duration: 3000
          })
        }
      }, index * 1000)
    })
  }

  // 创建脉冲动画 - 从原文件复制
  if (isPulseActive.value) {
    pulsePoints.forEach((center, index) => {
      setTimeout(() => {
        if (advancedVisualizer && isPulseActive.value) {
          advancedVisualizer.createPulseAnimation({
            center: center as [number, number],
            maxRadius: 30,
            duration: 2000,
            color: '#00f2fe',
            opacity: 0.6,
            strokeWidth: 2
          })
        }
      }, index * 500)
    })
  }
}

const resetAnimation = () => {
  if (advancedVisualizer) {
    advancedVisualizer.clear()
    initParticleFlow()
  }
}

const toggleParticleFlow = () => {
  isFlowActive.value = !isFlowActive.value
  updateFlowStats()
}

const togglePulse = () => {
  isPulseActive.value = !isPulseActive.value
  updateFlowStats()
}

const updateAnimationSpeed = () => {
  // 重新初始化以应用新速度
  if (advancedVisualizer) {
    advancedVisualizer.clear()
    setTimeout(() => {
      initParticleFlow()
    }, 100)
  }
}

const updateParticleCount = () => {
  // 重新初始化以应用新粒子数
  if (advancedVisualizer) {
    advancedVisualizer.clear()
    setTimeout(() => {
      initParticleFlow()
    }, 100)
  }
}

const startContinuousAnimation = () => {
  // 持续的粒子流动画
  if (flowTimer) return

  flowTimer = window.setInterval(() => {
    if (isFlowActive.value && advancedVisualizer) {
      const randomPath = flowPaths[Math.floor(Math.random() * flowPaths.length)]
      advancedVisualizer.createParticleFlow({
        pathData: randomPath,
        particleCount: particleCount.value,
        speed: animationSpeed.value,
        particleSize: 3,
        colors: ['#4facfe', '#00f2fe', '#43e97b'],
        duration: 3000
      })
    }
  }, 4000)

  // 持续的脉冲动画
  pulseTimer = window.setInterval(() => {
    if (isPulseActive.value && advancedVisualizer) {
      const randomPoint = pulsePoints[Math.floor(Math.random() * pulsePoints.length)]
      advancedVisualizer.createPulseAnimation({
        center: randomPoint as [number, number],
        maxRadius: 30,
        duration: 2000,
        color: '#00f2fe',
        opacity: 0.6,
        strokeWidth: 2
      })
    }
  }, 2500)
}

const stopContinuousAnimation = () => {
  if (flowTimer) {
    clearInterval(flowTimer)
    flowTimer = null
  }

  if (pulseTimer) {
    clearInterval(pulseTimer)
    pulseTimer = null
  }
}

const updateFlowStats = () => {
  // 模拟数据流统计更新
  flowStats.value = {
    activeStreams: isFlowActive.value ? flowPaths.length : 0,
    particlesPerSecond: isFlowActive.value ? particleCount.value * animationSpeed.value : 0,
    pulseRate: isPulseActive.value ? 60 : 0,
    dataTransfer: Math.floor(Math.random() * 100) + 100
  }
}

// 生命周期
onMounted(async () => {
  await nextTick()
  await initDataFlowAnimation()
  startContinuousAnimation()

  // 定时更新统计数据
  setInterval(updateFlowStats, 2000)
})

onUnmounted(() => {
  stopContinuousAnimation()
  if (advancedVisualizer) {
    advancedVisualizer.cleanup()
  }
})
</script>

<style lang="scss" scoped>
// 自定义滑块样式
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #4facfe;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #4facfe;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>
