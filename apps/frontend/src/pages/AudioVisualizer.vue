<template>
  <div class="audio-visualizer-container min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">🎵 音频可视化分析器</h1>
        <p class="text-gray-300">使用Web Audio API实现实时音频分析和可视化</p>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel bg-black/30 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 音频源选择 -->
          <div class="audio-source">
            <h3 class="text-white font-semibold mb-3">音频源</h3>
            <div class="space-y-3">
              <el-button @click="initializeMicrophone" :disabled="!canUseMicrophone" type="primary" class="w-full">
                <el-icon>
                  <Microphone />
                </el-icon>
                使用麦克风
              </el-button>

              <div class="file-upload">
                <input ref="fileInput" type="file" accept="audio/*" @change="handleFileUpload" class="hidden">
                <el-button @click="fileInput?.click()" class="w-full">
                  <el-icon>
                    <Upload />
                  </el-icon>
                  上传音频文件
                </el-button>
              </div>

              <audio ref="audioElement" controls class="w-full" @play="startVisualization" @pause="stopVisualization"
                @ended="stopVisualization" />
            </div>
          </div>

          <!-- 可视化设置 -->
          <div class="visualization-settings">
            <h3 class="text-white font-semibold mb-3">可视化模式</h3>
            <el-select v-model="visualizationMode" class="w-full mb-3">
              <el-option label="频谱条形图" value="bars" />
              <el-option label="圆形频谱" value="circular" />
              <el-option label="波形图" value="waveform" />
              <el-option label="粒子效果" value="particles" />
              <el-option label="3D频谱" value="3d" />
            </el-select>

            <div class="settings-grid grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs text-gray-300">FFT大小</label>
                <el-select v-model="fftSize" size="small">
                  <el-option label="512" :value="512" />
                  <el-option label="1024" :value="1024" />
                  <el-option label="2048" :value="2048" />
                  <el-option label="4096" :value="4096" />
                </el-select>
              </div>
              <div>
                <label class="text-xs text-gray-300">平滑度</label>
                <el-slider v-model="smoothing" :min="0" :max="1" :step="0.1" size="small" />
              </div>
            </div>
          </div>

          <!-- 音频信息 -->
          <div class="audio-info">
            <h3 class="text-white font-semibold mb-3">音频信息</h3>
            <div class="info-grid space-y-2 text-sm">
              <div class="flex justify-between text-gray-300">
                <span>平均频率:</span>
                <span class="text-green-400">{{ averageFrequency.toFixed(1) }}</span>
              </div>
              <div class="flex justify-between text-gray-300">
                <span>低频强度:</span>
                <span class="text-blue-400">{{ bassLevel.toFixed(1) }}</span>
              </div>
              <div class="flex justify-between text-gray-300">
                <span>高频强度:</span>
                <span class="text-purple-400">{{ trebleLevel.toFixed(1) }}</span>
              </div>
              <div class="flex justify-between text-gray-300">
                <span>状态:</span>
                <el-tag :type="isAnalyzing ? 'success' : 'info'" size="small">
                  {{ isAnalyzing ? '分析中' : '已停止' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 可视化画布 -->
      <div class="visualization-area bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <canvas ref="visualizerCanvas" class="w-full rounded-lg shadow-2xl" :class="{ 'animate-pulse': isAnalyzing }" />
      </div>

      <!-- 频率分析面板 -->
      <div class="frequency-analysis mt-6 bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 class="text-white font-semibold mb-4">频率分析</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 频率分布图 -->
          <div class="frequency-chart">
            <h4 class="text-gray-300 text-sm mb-2">频率分布</h4>
            <canvas ref="frequencyChart" width="300" height="150" class="w-full border border-gray-600 rounded" />
          </div>

          <!-- 实时波形 -->
          <div class="waveform-chart">
            <h4 class="text-gray-300 text-sm mb-2">实时波形</h4>
            <canvas ref="waveformChart" width="300" height="150" class="w-full border border-gray-600 rounded" />
          </div>

          <!-- 频谱瀑布图 -->
          <div class="spectrogram">
            <h4 class="text-gray-300 text-sm mb-2">频谱历史</h4>
            <canvas ref="spectrogramChart" width="300" height="150" class="w-full border border-gray-600 rounded" />
          </div>
        </div>
      </div>

      <!-- 预设效果 -->
      <div class="presets mt-6 bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 class="text-white font-semibold mb-4">预设效果</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <el-button v-for="preset in presets" :key="preset.name" @click="applyPreset(preset)"
            :type="currentPreset === preset.name ? 'primary' : 'default'" class="preset-button">
            {{ preset.name }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Microphone, Upload } from '@element-plus/icons-vue'
import { AudioAnalyzer } from '@/utils/audioAnalyzer'
import { AudioVisualizer, Particle } from '@/utils/audioVisualizer'

// 响应式数据
const visualizerCanvas = ref<HTMLCanvasElement>()
const frequencyChart = ref<HTMLCanvasElement>()
const waveformChart = ref<HTMLCanvasElement>()
const spectrogramChart = ref<HTMLCanvasElement>()
const audioElement = ref<HTMLAudioElement>()
const fileInput = ref<HTMLInputElement>()

const visualizationMode = ref<'bars' | 'circular' | 'waveform' | 'particles' | '3d'>('bars')
const fftSize = ref(2048)
const smoothing = ref(0.8)
const isAnalyzing = ref(false)
const canUseMicrophone = ref(true)
const currentPreset = ref('')

// 音频数据
const averageFrequency = ref(0)
const bassLevel = ref(0)
const trebleLevel = ref(0)

// 实例
let audioAnalyzer: AudioAnalyzer | null = null
let visualizer: AudioVisualizer | null = null
let particles: Particle[] = []
let spectrogramData: number[][] = []

// 预设配置
const presets = [
  {
    name: '经典',
    mode: 'bars' as const,
    fftSize: 2048,
    smoothing: 0.8
  },
  {
    name: '动感',
    mode: 'circular' as const,
    fftSize: 1024,
    smoothing: 0.6
  },
  {
    name: '科幻',
    mode: 'particles' as const,
    fftSize: 4096,
    smoothing: 0.9
  },
  {
    name: '立体',
    mode: '3d' as const,
    fftSize: 1024,
    smoothing: 0.7
  }
]

onMounted(async () => {
  await initializeVisualizer()
  checkMicrophonePermission()
})

const initializeVisualizer = async () => {
  if (!visualizerCanvas.value) return

  try {
    audioAnalyzer = new AudioAnalyzer({
      fftSize: fftSize.value,
      smoothingTimeConstant: smoothing.value
    })

    await audioAnalyzer.initialize()

    visualizer = new AudioVisualizer(visualizerCanvas.value, {
      width: 800,
      height: 400
    })

    // 初始化粒子
    initializeParticles()

    ElMessage.success('音频分析器初始化成功')
  } catch (error) {
    ElMessage.error('初始化失败: ' + (error as Error).message)
  }
}

const initializeParticles = () => {
  particles = []
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle(
      Math.random() * 800,
      Math.random() * 400
    ))
  }
}

const checkMicrophonePermission = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true })
    canUseMicrophone.value = true
  } catch {
    canUseMicrophone.value = false
  }
}

const initializeMicrophone = async () => {
  if (!audioAnalyzer) return

  try {
    await audioAnalyzer.connectMicrophone()
    await audioAnalyzer.resume()
    startVisualization()
    ElMessage.success('麦克风连接成功')
  } catch (error) {
    ElMessage.error('麦克风连接失败: ' + (error as Error).message)
  }
}

const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !audioElement.value) return

  const url = URL.createObjectURL(file)
  audioElement.value.src = url

  if (audioAnalyzer) {
    audioAnalyzer.connectAudioElement(audioElement.value)
  }
}

const startVisualization = async () => {
  if (!audioAnalyzer || !visualizer) return

  try {
    await audioAnalyzer.resume()
    isAnalyzing.value = true

    audioAnalyzer.startAnalysis((data) => {
      averageFrequency.value = data.averageFrequency
      bassLevel.value = data.bassLevel
      trebleLevel.value = data.trebleLevel

      // 主可视化
      switch (visualizationMode.value) {
        case 'bars':
          visualizer!.renderBars(data.frequencyData)
          break
        case 'circular':
          visualizer!.renderCircular(data.frequencyData)
          break
        case 'waveform':
          visualizer!.renderWaveform(data.timeDomainData)
          break
        case 'particles':
          visualizer!.renderParticles(data.frequencyData, particles)
          break
        case '3d':
          visualizer!.render3DSpectrum(data.frequencyData)
          break
      }

      // 更新分析图表
      updateAnalysisCharts(data)
    })
  } catch (error) {
    ElMessage.error('启动可视化失败: ' + (error as Error).message)
  }
}

const stopVisualization = () => {
  if (audioAnalyzer) {
    audioAnalyzer.stopAnalysis()
  }
  isAnalyzing.value = false
}

const updateAnalysisCharts = (data: any) => {
  // 更新频率分布图
  if (frequencyChart.value) {
    const ctx = frequencyChart.value.getContext('2d')!
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, 300, 150)

    const barWidth = 300 / data.frequencyData.length
    for (let i = 0; i < data.frequencyData.length; i++) {
      const barHeight = (data.frequencyData[i] / 255) * 150
      ctx.fillStyle = `hsl(${(i / data.frequencyData.length) * 360}, 70%, 60%)`
      ctx.fillRect(i * barWidth, 150 - barHeight, barWidth, barHeight)
    }
  }

  // 更新波形图
  if (waveformChart.value) {
    const ctx = waveformChart.value.getContext('2d')!
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, 300, 150)

    ctx.strokeStyle = '#4ecdc4'
    ctx.lineWidth = 2
    ctx.beginPath()

    const sliceWidth = 300 / data.timeDomainData.length
    let x = 0

    for (let i = 0; i < data.timeDomainData.length; i++) {
      const v = data.timeDomainData[i] / 128.0
      const y = v * 75

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.stroke()
  }

  // 更新频谱瀑布图
  updateSpectrogram(data.frequencyData)
}

const updateSpectrogram = (frequencyData: Uint8Array) => {
  if (!spectrogramChart.value) return

  // 添加新的频谱数据
  spectrogramData.push(Array.from(frequencyData))

  // 限制历史数据长度
  if (spectrogramData.length > 150) {
    spectrogramData.shift()
  }

  const ctx = spectrogramChart.value.getContext('2d')!
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, 300, 150)

  const imageData = ctx.createImageData(300, 150)

  for (let y = 0; y < spectrogramData.length; y++) {
    const spectrum = spectrogramData[y]
    for (let x = 0; x < Math.min(spectrum.length, 300); x++) {
      const intensity = spectrum[x] / 255
      const pixelIndex = (y * 300 + x) * 4

      // 根据强度设置颜色
      imageData.data[pixelIndex] = intensity * 255     // R
      imageData.data[pixelIndex + 1] = intensity * 100 // G
      imageData.data[pixelIndex + 2] = intensity * 200 // B
      imageData.data[pixelIndex + 3] = 255             // A
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

const applyPreset = (preset: any) => {
  visualizationMode.value = preset.mode
  fftSize.value = preset.fftSize
  smoothing.value = preset.smoothing
  currentPreset.value = preset.name

  // 重新初始化分析器
  if (audioAnalyzer) {
    audioAnalyzer.destroy()
    nextTick(() => {
      initializeVisualizer()
    })
  }
}

// 监听设置变化
watch([fftSize, smoothing], () => {
  if (audioAnalyzer) {
    audioAnalyzer.destroy()
    nextTick(() => {
      initializeVisualizer()
    })
  }
})

onBeforeUnmount(() => {
  if (audioAnalyzer) {
    audioAnalyzer.destroy()
  }
})
</script>

<style scoped>
.preset-button {
  transition: all 0.3s ease;
}

.preset-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

canvas {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .8;
  }
}
</style>