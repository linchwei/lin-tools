<template>
  <div class="bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden">
    <!-- 头部 -->
    <div class="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-8 border-b border-gray-200/60">
      <h3 class="text-3xl font-bold text-gray-800 mb-3 flex items-center gap-3">
        🔄 SharedArrayBuffer 数据共享
      </h3>
      <p class="text-gray-600 text-lg">多个Worker之间共享内存，实现高效数据交换</p>
    </div>

    <!-- 控制面板 -->
    <div class="p-8 bg-gradient-to-br from-gray-50 to-green-50/30">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- 缓冲区大小控制 -->
        <div class="control-group">
          <label class="block text-sm font-semibold text-gray-700 mb-3">共享缓冲区大小：</label>
          <div class="flex items-center gap-3">
            <el-input-number :model-value="bufferSize"
              @update:model-value="eventHandlers['update:bufferSize']?.($event)" :min="1024" :max="1048576" :step="1024"
              class="flex-1" />
            <span class="text-sm text-gray-600 font-medium">bytes</span>
          </div>
        </div>

        <!-- Worker数量控制 -->
        <div class="control-group">
          <label class="block text-sm font-semibold text-gray-700 mb-3">Worker数量：</label>
          <el-slider :model-value="workerCount" @update:model-value="eventHandlers['update:workerCount']?.($event)"
            :min="1" :max="8" :step="1" show-input class="mb-3" />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-wrap gap-4 justify-center">
        <el-button type="primary" size="large" @click="createSharedBuffer"
          class="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          创建共享缓冲区
        </el-button>
        <el-button type="success" size="large" @click="startDataSharing" :disabled="!sharedBuffer"
          class="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          开始数据共享
        </el-button>
        <el-button size="large" @click="stopDataSharing"
          class="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          停止共享
        </el-button>
      </div>
    </div>

    <!-- 共享状态显示 -->
    <div v-if="sharedBuffer" class="p-8 border-t border-gray-200/60">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 缓冲区状态 -->
        <div class="status-card">
          <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            💾 共享缓冲区状态
          </h4>
          <div class="space-y-4">
            <div class="info-item">
              <span class="label">缓冲区大小：</span>
              <span class="value">{{ formatBytes(sharedBuffer.byteLength) }}</span>
            </div>
            <div class="info-item">
              <span class="label">活跃Worker：</span>
              <span class="value">{{ activeWorkers.length }}</span>
            </div>
            <div class="info-item">
              <span class="label">数据传输率：</span>
              <span class="value">{{ dataTransferRate }} MB/s</span>
            </div>
          </div>
        </div>

        <!-- 性能指标 -->
        <div class="status-card">
          <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            📊 性能指标
          </h4>
          <div class="space-y-4">
            <div class="info-item">
              <span class="label">总读取次数：</span>
              <span class="value">{{ totalReads }}</span>
            </div>
            <div class="info-item">
              <span class="label">总写入次数：</span>
              <span class="value">{{ totalWrites }}</span>
            </div>
            <div class="info-item">
              <span class="label">平均延迟：</span>
              <span class="value">{{ averageLatency }}ms</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Worker状态网格 -->
      <div v-if="activeWorkers.length > 0" class="mt-8">
        <h4 class="text-xl font-semibold text-gray-800 mb-6">⚡ Worker状态</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(worker, index) in activeWorkers" :key="index" class="worker-card">
            <h5 class="text-lg font-semibold text-gray-700 mb-3">
              Worker {{ index + 1 }}
            </h5>
            <div class="space-y-2">
              <div class="worker-metric">
                <span class="label">读取：</span>
                <span class="value">{{ worker.readCount }}</span>
              </div>
              <div class="worker-metric">
                <span class="label">写入：</span>
                <span class="value">{{ worker.writeCount }}</span>
              </div>
              <div class="worker-metric">
                <span class="label">状态：</span>
                <span class="value" :class="getStatusClass(worker.status)">
                  {{ worker.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据可视化 -->
    <div v-if="sharingActive" class="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200/60">
      <h4 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        📈 实时数据流
      </h4>
      <div class="bg-white rounded-xl p-4 shadow-inner">
        <canvas ref="dataCanvas" width="800" height="200"
          class="w-full h-auto border border-gray-200 rounded-lg"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { ElButton, ElInputNumber, ElSlider } from 'element-plus'

// Props
interface WorkerStatus {
  readCount: number
  writeCount: number
  status: string
}

interface Props {
  bufferSize: number
  workerCount: number
  sharedBuffer: SharedArrayBuffer | null
  activeWorkers: WorkerStatus[]
  dataTransferRate: number
  sharingActive: boolean
  totalReads: number
  totalWrites: number
  averageLatency: number
}

const props = withDefaults(defineProps<Props>(), {
  bufferSize: 65536,
  workerCount: 4,
  sharedBuffer: null,
  activeWorkers: () => [],
  dataTransferRate: 0,
  sharingActive: false,
  totalReads: 0,
  totalWrites: 0,
  averageLatency: 0
})

// Emits
const emit = defineEmits([
  'update:bufferSize',
  'update:workerCount',
  'createSharedBuffer',
  'startDataSharing',
  'stopDataSharing'
])

// 注入事件处理器
const eventHandlers = inject('eventHandlers', {}) as Record<string, Function>

// 响应式数据
const dataCanvas = ref<HTMLCanvasElement>()

// 方法
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'active': return 'text-green-600'
    case 'idle': return 'text-yellow-600'
    case 'error': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

const createSharedBuffer = () => eventHandlers['createSharedBuffer']?.()
const startDataSharing = () => eventHandlers['startDataSharing']?.()
const stopDataSharing = () => eventHandlers['stopDataSharing']?.()

// 暴露canvas引用
defineExpose({
  dataCanvas
})
</script>

<style lang="scss" scoped>
.control-group {
  margin-bottom: 1rem;
}

.status-card {
  background: linear-gradient(to bottom right, white, #f9fafb);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
}

.info-item,
.worker-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .label {
    color: #4b5563;
    font-weight: 500;
  }

  .value {
    font-weight: 700;
    color: #1f2937;
  }
}

.worker-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
