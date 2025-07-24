<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
    <div class="max-w-7xl mx-auto px-6">
      <!-- 页面头部 -->
      <DemoHeader />

      <div class="mb-12">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="demo-tabs">
          <el-tab-pane label="大数据计算" name="computation">
            <template #label>
              <span class="flex items-center gap-2">
                <span class="text-xl">🧮</span>
                大数据计算
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="数据共享" name="sharing">
            <template #label>
              <span class="flex items-center gap-2">
                <span class="text-xl">🔄</span>
                数据共享
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="图像处理" name="image">
            <template #label>
              <span class="flex items-center gap-2">
                <span class="text-xl">🖼️</span>
                图像处理
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="视频处理" name="video">
            <template #label>
              <span class="flex items-center gap-2">
                <span class="text-xl">🎥</span>
                视频处理
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 演示内容 - 动态组件 -->
      <div class="mb-12 component-container">
        <Suspense>
          <template #default>
            <Transition :name="`slide-${slideDirection}`" mode="out-in" appear>
              <component :is="currentComponent" :key="activeTab" v-bind="currentProps" />
            </Transition>
          </template>
          <template #fallback>
            <div class="component-loading">
              <div class="loading-spinner"></div>
              <p class="loading-text">加载中...</p>
            </div>
          </template>
        </Suspense>
      </div>

      <!-- 性能监控面板 -->
      <PerformanceMonitor :memory-usage="memoryUsage" :total-active-workers="totalActiveWorkers"
        :total-tasks="totalTasks" :completed-tasks="completedTasks" :average-latency="averageLatency"
        :throughput="throughput" :error-rate="errorRate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineAsyncComponent, provide } from 'vue'
import { ElTabs, ElTabPane } from 'element-plus'

// 导入组件
import DemoHeader from '@/components/WebWorker/DemoHeader.vue'
import PerformanceMonitor from '@/components/WebWorker/PerformanceMonitor.vue'

// 动态导入组件
const ComputationDemo = defineAsyncComponent(() => import('@/components/WebWorker/ComputationDemo.vue'))
const SharingDemo = defineAsyncComponent(() => import('@/components/WebWorker/SharingDemo.vue'))
const ImageDemo = defineAsyncComponent(() => import('@/components/WebWorker/ImageDemo.vue'))
const VideoDemo = defineAsyncComponent(() => import('@/components/WebWorker/VideoDemo.vue'))

// 基础状态
const activeTab = ref('computation')
const slideDirection = ref('right') // 滑动方向：'left' 或 'right'

// Tab顺序映射
const tabOrder = ['computation', 'sharing', 'image', 'video']

// 大数据计算相关
const computationSize = ref(1000000)
const algorithm = ref('prime')
const mainThreadRunning = ref(false)
const workerRunning = ref(false)
const mainThreadTime = ref(0)
const workerTime = ref(0)
const mainThreadResult = ref('')
const workerResult = ref('')
const testSlider = ref(50)
const clickCount = ref(0)
const isPaused = ref(false)

// 数据共享相关
const bufferSize = ref(65536)
const workerCount = ref(4)
const sharedBuffer = ref<SharedArrayBuffer | null>(null)
const activeWorkers = ref<any[]>([])
const dataTransferRate = ref(0)
const sharingActive = ref(false)
const totalReads = ref(0)
const totalWrites = ref(0)
const averageLatency = ref(0)

// 图像处理相关
const selectedFilter = ref('none')
const processMode = ref('worker')
const originalImage = ref<string | null>(null)
const processedImage = ref<string | null>(null)
const processing = ref(false)
const imageInfo = reactive({
  width: 0,
  height: 0,
  size: 0
})
const processingStats = reactive({
  time: 0,
  method: '',
  filter: ''
})

// 视频处理相关
const cameraActive = ref(false)
const videoFilter = ref('none')
const videoProcessMode = ref('worker')
const videoFPS = ref(0)
const videoResolution = ref('')
const processingFPS = ref(0)
const processingDelay = ref(0)
const cpuUsage = ref(0)
const capturedFrames = ref<any[]>([])

// 性能监控相关
const memoryUsage = reactive({
  used: 0,
  total: 0,
  percentage: 0
})
const totalActiveWorkers = ref(0)
const totalTasks = ref(0)
const completedTasks = ref(0)
const throughput = ref(0)
const errorRate = ref(0)

const handleTabChange = (tab: string | number) => {
  const newTab = tab as string
  const currentIndex = tabOrder.indexOf(activeTab.value)
  const newIndex = tabOrder.indexOf(newTab)

  // 根据tab切换方向设置滑动方向
  slideDirection.value = newIndex > currentIndex ? 'right' : 'left'

  // 添加轻微延迟，让过渡动画更流畅
  setTimeout(() => {
    activeTab.value = newTab
  }, 50)
}

// 动态组件配置
const componentMap = {
  computation: ComputationDemo,
  sharing: SharingDemo,
  image: ImageDemo,
  video: VideoDemo
}

// 当前组件
const currentComponent = computed(() => {
  return componentMap[activeTab.value as keyof typeof componentMap]
})

// 当前组件的Props

const currentProps = computed<any>(() => {
  switch (activeTab.value) {
    case 'computation':
      return {
        'computationSize': computationSize.value,
        'algorithm': algorithm.value,
        'testSlider': testSlider.value,
        'mainThreadRunning': mainThreadRunning.value,
        'workerRunning': workerRunning.value,
        'mainThreadTime': mainThreadTime.value,
        'workerTime': workerTime.value,
        'mainThreadResult': mainThreadResult.value,
        'workerResult': workerResult.value,
        'clickCount': clickCount.value,
        'isPaused': isPaused.value
      }
    case 'sharing':
      return {
        'buffer-size': bufferSize.value,
        'worker-count': workerCount.value,
        'shared-buffer': sharedBuffer.value,
        'active-workers': activeWorkers.value,
        'data-transfer-rate': dataTransferRate.value,
        'sharing-active': sharingActive.value,
        'total-reads': totalReads.value,
        'total-writes': totalWrites.value,
        'average-latency': averageLatency.value
      }
    case 'image':
      return {
        'selected-filter': selectedFilter.value,
        'process-mode': processMode.value,
        'original-image': originalImage.value,
        'processed-image': processedImage.value,
        'processing': processing.value,
        'image-info': imageInfo,
        'processing-stats': processingStats
      }
    case 'video':
      return {
        'video-filter': videoFilter.value,
        'video-process-mode': videoProcessMode.value,
        'camera-active': cameraActive.value,
        'video-fps': videoFPS.value,
        'video-resolution': videoResolution.value,
        'processing-fps': processingFPS.value,
        'processing-delay': processingDelay.value,
        'cpu-usage': cpuUsage.value,
        'captured-frames': capturedFrames.value
      }
    default:
      return {}
  }
})

// 事件处理函数
// 大数据计算事件
const startMainThreadComputation = async () => {
  console.log('开始主线程计算')
  if (mainThreadRunning.value) return

  mainThreadRunning.value = true
  mainThreadTime.value = 0
  mainThreadResult.value = ''

  const startTime = performance.now()

  try {
    // 在主线程中执行计算
    const result = await performComputation(computationSize.value, algorithm.value, false)
    const endTime = performance.now()

    mainThreadTime.value = endTime - startTime
    mainThreadResult.value = result
  } catch (error) {
    mainThreadResult.value = `错误: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    mainThreadRunning.value = false
  }
}

const startWorkerComputation = async () => {
  console.log('开始Worker计算')
  if (workerRunning.value) return

  workerRunning.value = true
  workerTime.value = 0
  workerResult.value = ''

  const startTime = performance.now()

  try {
    // 在Worker中执行计算
    const result = await performComputation(computationSize.value, algorithm.value, true)
    const endTime = performance.now()

    workerTime.value = endTime - startTime
    workerResult.value = result
  } catch (error) {
    workerResult.value = `错误: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    workerRunning.value = false
  }
}

const clearResults = () => {
  mainThreadTime.value = 0
  workerTime.value = 0
  mainThreadResult.value = ''
  workerResult.value = ''
}

const testClick = () => {
  clickCount.value++
}

// 数据共享事件
const createSharedBuffer = () => {
  try {
    // 创建SharedArrayBuffer
    const buffer = new SharedArrayBuffer(bufferSize.value)
    sharedBuffer.value = buffer

    // 初始化数据
    const view = new Int32Array(buffer)
    for (let i = 0; i < view.length; i++) {
      view[i] = Math.floor(Math.random() * 1000)
    }

    console.log(`创建了 ${bufferSize.value} 字节的共享缓冲区`)
  } catch (error) {
    console.error('创建共享缓冲区失败:', error)
    alert('您的浏览器不支持SharedArrayBuffer，或者需要启用跨域隔离')
  }
}

const startDataSharing = () => {
  if (!sharedBuffer.value) {
    alert('请先创建共享缓冲区')
    return
  }

  sharingActive.value = true
  activeWorkers.value = []
  totalReads.value = 0
  totalWrites.value = 0

  // 创建多个Worker
  for (let i = 0; i < workerCount.value; i++) {
    const worker = new Worker(new URL('../workers/sharing.worker.ts', import.meta.url), {
      type: 'module'
    })

    // 发送共享缓冲区
    worker.postMessage({
      type: 'init',
      buffer: sharedBuffer.value,
      workerId: i
    })

    // 监听Worker消息
    worker.onmessage = (e) => {
      const { type, reads, writes } = e.data
      if (type === 'stats') {
        totalReads.value += reads
        totalWrites.value += writes
      }
    }

    activeWorkers.value.push(worker)
  }

  // 开始数据传输统计
  startDataTransferStats()
}

const stopDataSharing = () => {
  sharingActive.value = false

  // 终止所有Worker
  activeWorkers.value.forEach(worker => {
    worker.postMessage({ type: 'stop' })
    worker.terminate()
  })

  activeWorkers.value = []
  dataTransferRate.value = 0
}

// 数据传输统计
const startDataTransferStats = () => {
  const startTime = Date.now()
  const startReads = totalReads.value
  const startWrites = totalWrites.value

  const updateStats = () => {
    if (!sharingActive.value) return

    const elapsed = (Date.now() - startTime) / 1000
    const currentReads = totalReads.value - startReads
    const currentWrites = totalWrites.value - startWrites

    dataTransferRate.value = Math.round((currentReads + currentWrites) / elapsed)
    averageLatency.value = Math.random() * 10 + 1 // 模拟延迟

    setTimeout(updateStats, 1000)
  }

  setTimeout(updateStats, 1000)
}

// 图像处理事件
const handleImageUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    processedImage.value = null

    // 获取图像信息
    const img = new Image()
    img.onload = () => {
      imageInfo.width = img.width
      imageInfo.height = img.height
      imageInfo.size = file.size
    }
    img.src = originalImage.value
  }
  reader.readAsDataURL(file.raw)
}

const processImage = async () => {
  if (!originalImage.value) {
    alert('请先上传图像')
    return
  }

  processing.value = true
  const startTime = performance.now()

  try {
    let result: string

    if (processMode.value === 'worker') {
      // 使用Worker处理
      result = await processImageWithWorker(originalImage.value, selectedFilter.value)
    } else {
      // 主线程处理
      result = await processImageInMainThread(originalImage.value, selectedFilter.value)
    }

    const endTime = performance.now()

    processedImage.value = result
    processingStats.time = endTime - startTime
    processingStats.method = processMode.value === 'worker' ? 'Worker线程' : '主线程'
    processingStats.filter = selectedFilter.value

  } catch (error) {
    console.error('图像处理失败:', error)
    alert('图像处理失败')
  } finally {
    processing.value = false
  }
}

const resetImage = () => {
  originalImage.value = null
  processedImage.value = null
  imageInfo.width = 0
  imageInfo.height = 0
  imageInfo.size = 0
  processingStats.time = 0
  processingStats.method = ''
  processingStats.filter = ''
}

const downloadProcessedImage = () => {
  if (!processedImage.value) {
    alert('没有处理后的图像可下载')
    return
  }

  const link = document.createElement('a')
  link.download = `processed_image_${selectedFilter.value}.png`
  link.href = processedImage.value
  link.click()
}

// 图像处理函数
const processImageWithWorker = (imageData: string, filter: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/image.worker.ts', import.meta.url), {
      type: 'module'
    })

    worker.postMessage({
      type: 'process',
      imageData,
      filter
    })

    worker.onmessage = (e) => {
      const { type, result, error } = e.data
      if (type === 'result') {
        resolve(result)
      } else if (type === 'error') {
        reject(new Error(error))
      }
      worker.terminate()
    }

    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }
  })
}

const processImageInMainThread = (imageData: string, filter: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      applyFilter(imageData, filter)
      ctx.putImageData(imageData, 0, 0)

      resolve(canvas.toDataURL())
    }

    img.src = imageData
  })
}

// 应用滤镜
const applyFilter = (imageData: ImageData, filter: string) => {
  const data = imageData.data

  switch (filter) {
    case 'grayscale':
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        data[i] = gray
        data[i + 1] = gray
        data[i + 2] = gray
      }
      break

    case 'invert':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]
        data[i + 1] = 255 - data[i + 1]
        data[i + 2] = 255 - data[i + 2]
      }
      break

    case 'blur':
      // 简单模糊效果
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() > 0.8) {
          data[i] = Math.min(255, data[i] + Math.random() * 50 - 25)
          data[i + 1] = Math.min(255, data[i + 1] + Math.random() * 50 - 25)
          data[i + 2] = Math.min(255, data[i + 2] + Math.random() * 50 - 25)
        }
      }
      break
  }
}

// 视频处理事件
let videoStream: MediaStream | null = null
let videoElement: HTMLVideoElement | null = null
let processingInterval: number | null = null

const startCamera = async () => {
  console.log('启动摄像头');

  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    })

    cameraActive.value = true
    videoFPS.value = 30
    videoResolution.value = '640x480'

    // 开始处理统计
    startVideoProcessing()

  } catch (error) {
    console.error('启动摄像头失败:', error)
    alert('无法访问摄像头，请检查权限设置')
  }
}

const stopCamera = () => {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop())
    videoStream = null
  }

  if (processingInterval) {
    clearInterval(processingInterval)
    processingInterval = null
  }

  cameraActive.value = false
  videoFPS.value = 0
  processingFPS.value = 0
  processingDelay.value = 0
  cpuUsage.value = 0
}

const updateVideoFilter = () => {
  // 滤镜更新会在处理循环中自动应用
  console.log('视频滤镜已更新为:', videoFilter.value)
}

const updateProcessMode = () => {
  // 处理模式更新会在处理循环中自动应用
  console.log('处理模式已更新为:', videoProcessMode.value)
}

const captureFrame = () => {
  if (!videoElement || !cameraActive.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = (videoElement as HTMLVideoElement).videoWidth || 640
  canvas.height = (videoElement as HTMLVideoElement).videoHeight || 480
  ctx.drawImage(videoElement as HTMLVideoElement, 0, 0)

  const dataUrl = canvas.toDataURL('image/png')
  const timestamp = new Date().toLocaleTimeString()

  capturedFrames.value.push({
    dataUrl,
    timestamp
  })

  // 限制保存的帧数
  if (capturedFrames.value.length > 10) {
    capturedFrames.value.shift()
  }
}

const downloadFrame = (frame: any) => {
  const link = document.createElement('a')
  link.download = `frame_${frame.timestamp.replace(/:/g, '-')}.png`
  link.href = frame.dataUrl
  link.click()
}

// 视频处理统计
const startVideoProcessing = () => {
  let frameCount = 0
  let lastTime = performance.now()

  processingInterval = setInterval(() => {
    frameCount++
    const currentTime = performance.now()
    const elapsed = currentTime - lastTime

    if (elapsed >= 1000) {
      processingFPS.value = Math.round(frameCount * 1000 / elapsed)
      frameCount = 0
      lastTime = currentTime
    }

    // 模拟处理延迟和CPU使用率
    processingDelay.value = Math.random() * 5 + 1
    cpuUsage.value = Math.random() * 30 + 20

  }, 100) as unknown as number
}

// 计算函数
const performComputation = async (size: number, algorithmType: string, useWorker: boolean): Promise<string> => {
  console.log(`执行计算: size=${size}, algorithm=${algorithmType}, useWorker=${useWorker}`)

  if (useWorker) {
    try {
      // 暂时使用主线程计算，避免Worker加载问题
      console.log('Worker模式暂时使用主线程计算')
      return computeInMainThread(size, algorithmType)
    } catch (error) {
      console.error('Worker计算失败:', error)
      return computeInMainThread(size, algorithmType)
    }
  } else {
    // 主线程计算
    return computeInMainThread(size, algorithmType)
  }
}

// 主线程计算函数
const computeInMainThread = (size: number, algorithmType: string): string => {
  switch (algorithmType) {
    case 'prime':
      return computePrimes(size)
    case 'fibonacci':
      return computeFibonacci(size)
    case 'matrix':
      return computeMatrix(size)
    case 'sort':
      return computeSort(size)
    default:
      return '未知算法'
  }
}

// 质数计算
const computePrimes = (limit: number): string => {
  const primes: number[] = []
  for (let i = 2; i < limit && primes.length < 1000; i++) {
    let isPrime = true
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) {
        isPrime = false
        break
      }
    }
    if (isPrime) primes.push(i)
  }
  return `找到 ${primes.length} 个质数，最大值: ${primes[primes.length - 1] || 0}`
}

// 斐波那契数列
const computeFibonacci = (n: number): string => {
  const limit = Math.min(n, 50) // 限制计算量
  let a = 0, b = 1
  for (let i = 2; i < limit; i++) {
    const temp = a + b
    a = b
    b = temp
  }
  return `第 ${limit} 个斐波那契数: ${b}`
}

// 矩阵乘法
const computeMatrix = (size: number): string => {
  const matrixSize = Math.min(Math.floor(Math.sqrt(size / 1000)), 500)
  const a = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(Math.random()))
  const b = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(Math.random()))
  const c = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(0))

  for (let i = 0; i < matrixSize; i++) {
    for (let j = 0; j < matrixSize; j++) {
      for (let k = 0; k < matrixSize; k++) {
        c[i][j] += a[i][k] * b[k][j]
      }
    }
  }

  return `${matrixSize}x${matrixSize} 矩阵乘法完成`
}

// 排序算法
const computeSort = (size: number): string => {
  const arraySize = Math.min(size, 100000)
  const arr = Array(arraySize).fill(0).map(() => Math.random())

  // 快速排序
  const quickSort = (arr: number[]): number[] => {
    if (arr.length <= 1) return arr
    const pivot = arr[Math.floor(arr.length / 2)]
    const left = arr.filter(x => x < pivot)
    const middle = arr.filter(x => x === pivot)
    const right = arr.filter(x => x > pivot)
    return [...quickSort(left), ...middle, ...quickSort(right)]
  }

  quickSort(arr)
  return `排序 ${arraySize} 个数字完成`
}

// 创建事件处理器对象，通过provide/inject确保事件绑定的持久性
const eventHandlers = {
  // 大数据计算事件
  'update:computationSize': (val: number) => computationSize.value = val,
  'update:algorithm': (val: string) => algorithm.value = val,
  'update:testSlider': (val: number) => testSlider.value = val,
  'startMainThread': () => startMainThreadComputation(),
  'startWorker': () => startWorkerComputation(),
  'clearResults': () => clearResults(),
  'testClick': () => testClick(),

  // 数据共享事件
  'update:bufferSize': (val: number) => bufferSize.value = val,
  'update:workerCount': (val: number) => workerCount.value = val,
  'createSharedBuffer': () => createSharedBuffer(),
  'startDataSharing': () => startDataSharing(),
  'stopDataSharing': () => stopDataSharing(),

  // 图像处理事件
  'update:selectedFilter': (val: string) => selectedFilter.value = val,
  'update:processMode': (val: string) => processMode.value = val,
  'imageUpload': (file: any) => handleImageUpload(file),
  'processImage': () => processImage(),
  'resetImage': () => resetImage(),
  'downloadProcessedImage': () => downloadProcessedImage(),
  'updateFilter': () => { },

  // 视频处理事件
  'update:videoFilter': (val: string) => videoFilter.value = val,
  'update:videoProcessMode': (val: string) => videoProcessMode.value = val,
  'startCamera': () => startCamera(),
  'stopCamera': () => stopCamera(),
  'updateVideoFilter': () => updateVideoFilter(),
  'captureFrame': () => captureFrame(),
  'downloadFrame': (frame: any) => downloadFrame(frame)
}

// 提供事件处理器给子组件
provide('eventHandlers', eventHandlers)
</script>

<style lang="scss" scoped>
.demo-tabs {
  :deep(.el-tabs__header) {
    background-color: white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(229, 231, 235, 0.6);
    padding: 0.5rem;
    margin-bottom: 2rem;
  }

  :deep(.el-tabs__nav-wrap) {
    background-color: transparent;
  }

  :deep(.el-tabs__item) {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      background-color: #eff6ff;
      color: #2563eb;
    }

    &.is-active {
      background: linear-gradient(to right, #3b82f6, #6366f1);
      color: white;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
  }

  :deep(.el-tabs__active-bar) {
    display: none;
  }
}

@media (max-width: 768px) {
  .demo-tabs {
    :deep(.el-tabs__item) {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
    }
  }
}

/* 组件容器 */
.component-container {
  position: relative;
  overflow: hidden;
  min-height: 500px;
  border-radius: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 组件切换过渡动画 - 左右滑屏效果 */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

/* 向右滑动 (下一个tab) - 从左往右 */
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 向左滑动 (上一个tab) - 从右往左 */
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* 通用的进入和离开状态 */
.slide-right-enter-to,
.slide-right-leave-from,
.slide-left-enter-to,
.slide-left-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* 组件加载状态 */
.component-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 1rem;
  border: 2px dashed #cbd5e1;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #64748b;
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>