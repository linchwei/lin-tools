<template>
  <div class="bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden">
    <!-- 头部 -->
    <div class="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 p-8 border-b border-gray-200/60">
      <h3 class="text-3xl font-bold text-gray-800 mb-3 flex items-center gap-3">
        🎥 视频处理演示
      </h3>
      <p class="text-gray-600 text-lg">实时视频流处理，展示Worker在视频处理中的应用</p>
    </div>

    <!-- 控制面板 -->
    <div class="p-8 bg-gradient-to-br from-gray-50 to-orange-50/30">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- 摄像头控制 -->
        <div class="control-group">
          <label class="block text-sm font-semibold text-gray-700 mb-3">摄像头控制：</label>
          <div class="space-y-3">
            <el-button type="primary" @click="startCamera" :disabled="cameraActive" class="w-full py-3 rounded-xl">
              📹 启动摄像头
            </el-button>
            <el-button @click="stopCamera" :disabled="!cameraActive" class="w-full py-3 rounded-xl">
              ⏹️ 停止摄像头
            </el-button>
          </div>
        </div>

        <!-- 滤镜选择 -->
        <div class="control-group">
          <label class="block text-sm font-semibold text-gray-700 mb-3">视频滤镜：</label>
          <el-select :model-value="videoFilter" @update:model-value="eventHandlers['update:videoFilter']?.($event)"
            @change="updateVideoFilter" class="w-full mb-3">
            <el-option label="无滤镜" value="none" />
            <el-option label="灰度" value="grayscale" />
            <el-option label="反色" value="invert" />
            <el-option label="模糊" value="blur" />
            <el-option label="边缘检测" value="edge" />
          </el-select>

          <el-button type="success" @click="captureFrame" :disabled="!cameraActive" class="w-full py-2 rounded-xl">
            📸 截取帧
          </el-button>
        </div>

        <!-- 处理方式 -->
        <div class="control-group">
          <label class="block text-sm font-semibold text-gray-700 mb-3">处理方式：</label>
          <el-radio-group :model-value="videoProcessMode"
            @update:model-value="eventHandlers['update:videoProcessMode']?.($event)" @change="updateProcessMode"
            class="w-full">
            <el-radio value="main" class="w-full mb-2">🔴 主线程</el-radio>
            <el-radio value="worker" class="w-full">🟢 Worker线程</el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>

    <!-- 视频显示区域 -->
    <div v-if="cameraActive" class="p-8 border-t border-gray-200/60">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 原始视频 -->
        <div class="video-container">
          <h4 class="text-xl font-semibold text-gray-800 mb-4 text-center">
            📹 原始视频
          </h4>
          <div class="video-wrapper">
            <video ref="videoElement" autoplay muted
              class="w-full h-auto rounded-lg shadow-lg border border-gray-200"></video>
            <div class="video-info">
              <span class="info-tag">FPS: {{ videoFPS }}</span>
              <span class="info-tag">{{ videoResolution }}</span>
            </div>
          </div>
        </div>

        <!-- 处理结果 -->
        <div class="video-container">
          <h4 class="text-xl font-semibold text-gray-800 mb-4 text-center">
            ✨ 处理结果
          </h4>
          <div class="video-wrapper">
            <canvas ref="videoCanvas"
              class="w-full h-auto rounded-lg shadow-lg border border-gray-200 bg-gray-100"></canvas>
            <div class="processing-stats">
              <div class="stat-item">
                <span class="label">处理FPS:</span>
                <span class="value">{{ processingFPS }}</span>
              </div>
              <div class="stat-item">
                <span class="label">延迟:</span>
                <span class="value">{{ processingDelay }}ms</span>
              </div>
              <div class="stat-item">
                <span class="label">CPU使用:</span>
                <span class="value">{{ cpuUsage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 截取的帧 -->
    <div v-if="capturedFrames.length > 0"
      class="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200/60">
      <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        📸 截取的帧
      </h4>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="(frame, index) in capturedFrames" :key="index" class="frame-item">
          <img :src="frame.dataUrl" :alt="`Frame ${index + 1}`"
            class="w-full h-auto rounded-lg shadow-md border border-gray-200" />
          <div class="frame-info">
            <span class="timestamp">{{ frame.timestamp }}</span>
            <el-button size="small" @click="downloadFrame(frame)" class="download-btn">
              💾
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="p-16 text-center">
      <div class="text-6xl mb-4">🎥</div>
      <h4 class="text-xl font-semibold text-gray-600 mb-2">启动摄像头开始视频处理</h4>
      <p class="text-gray-500">实时视频流处理演示</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { ElButton, ElSelect, ElOption, ElRadioGroup, ElRadio } from 'element-plus'

// Props
interface CapturedFrame {
  dataUrl: string
  timestamp: string
}

interface Props {
  cameraActive: boolean
  videoFilter: string
  videoProcessMode: string
  videoFPS: number
  videoResolution: string
  processingFPS: number
  processingDelay: number
  cpuUsage: number
  capturedFrames: CapturedFrame[]
}

const props = withDefaults(defineProps<Props>(), {
  cameraActive: false,
  videoFilter: 'none',
  videoProcessMode: 'worker',
  videoFPS: 0,
  videoResolution: '',
  processingFPS: 0,
  processingDelay: 0,
  cpuUsage: 0,
  capturedFrames: () => []
})

// Emits
const emit = defineEmits([
  'update:videoFilter',
  'update:videoProcessMode',
  'startCamera',
  'stopCamera',
  'updateVideoFilter',
  'updateProcessMode',
  'captureFrame',
  'downloadFrame'
])

// 注入事件处理器
const eventHandlers = inject('eventHandlers', {}) as Record<string, Function>

// 响应式数据
const videoElement = ref<HTMLVideoElement>()
const videoCanvas = ref<HTMLCanvasElement>()

// 方法
const startCamera = () => emit('startCamera')
const stopCamera = () => emit('stopCamera')
const updateVideoFilter = () => emit('updateVideoFilter')
const updateProcessMode = () => emit('updateProcessMode')
const captureFrame = () => emit('captureFrame')
const downloadFrame = (frame: CapturedFrame) => emit('downloadFrame', frame)

// 暴露元素引用
defineExpose({
  videoElement,
  videoCanvas
})
</script>

<style lang="scss" scoped>
.control-group {
  margin-bottom: 1rem;
}

.video-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-wrapper {
  position: relative;

  .video-info {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    gap: 0.5rem;

    .info-tag {
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      backdrop-filter: blur(4px);
    }
  }

  .processing-stats {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    right: 0.5rem;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.375rem;
    backdrop-filter: blur(4px);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;

    .stat-item {
      text-align: center;

      .label {
        display: block;
        color: #d1d5db;
      }

      .value {
        display: block;
        font-weight: 700;
      }
    }
  }
}

.frame-item {
  position: relative;

  &:hover .frame-info {
    opacity: 1;
  }

  .frame-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 0.75rem;
    padding: 0.5rem;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    .timestamp {
      color: #d1d5db;
    }

    .download-btn {
      padding: 0.25rem !important;
      min-height: 0 !important;
      height: auto !important;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .processing-stats {
    grid-template-columns: 1fr;
    gap: 1px;
  }
}
</style>
