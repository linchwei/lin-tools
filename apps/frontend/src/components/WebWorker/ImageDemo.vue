<template>
  <div class="bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden">
    <!-- 头部 -->
    <div class="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 p-8 border-b border-gray-200/60">
      <h3 class="text-3xl font-bold text-gray-800 mb-3 flex items-center gap-3">
        🖼️ 图像处理演示
      </h3>
      <p class="text-gray-600 text-lg">使用Web Worker进行图像滤镜处理，保持UI流畅</p>
    </div>

    <!-- 控制面板 -->
    <div class="p-8 bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- 图像上传 -->
        <div class="control-group">
          <label class="block text-sm font-semibold text-gray-700 mb-3">选择图像：</label>
          <el-upload ref="uploadRef" :auto-upload="false" :show-file-list="false" accept="image/*"
            @change="handleImageUpload" class="w-full">
            <el-button type="primary" class="w-full py-3 rounded-xl">
              📁 选择图像文件
            </el-button>
          </el-upload>
        </div>

        <!-- 滤镜选择 -->
        <div class="control-group">
          <label class="block text-sm font-semibold text-gray-700 mb-3">图像滤镜：</label>
          <el-select :model-value="selectedFilter"
            @update:model-value="eventHandlers['update:selectedFilter']?.($event)" @change="updateFilter"
            class="w-full">
            <el-option label="无滤镜" value="none" />
            <el-option label="灰度" value="grayscale" />
            <el-option label="反色" value="invert" />
            <el-option label="模糊" value="blur" />
            <el-option label="锐化" value="sharpen" />
            <el-option label="边缘检测" value="edge" />
            <el-option label="浮雕" value="emboss" />
          </el-select>
        </div>

        <!-- 处理方式 -->
        <div class="control-group">
          <label class="block text-sm font-semibold text-gray-700 mb-3">处理方式：</label>
          <el-radio-group :model-value="processMode" @update:model-value="eventHandlers['update:processMode']?.($event)"
            @change="updateProcessMode" class="w-full">
            <el-radio value="main" class="w-full mb-2">🔴 主线程</el-radio>
            <el-radio value="worker" class="w-full">🟢 Worker线程</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-wrap gap-4 justify-center">
        <el-button type="success" size="large" @click="processImage" :disabled="!originalImage" :loading="processing"
          class="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          🚀 处理图像
        </el-button>
        <el-button size="large" @click="resetImage" :disabled="!originalImage"
          class="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          🔄 重置图像
        </el-button>
        <el-button size="large" @click="downloadProcessedImage" :disabled="!processedImage"
          class="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          💾 下载结果
        </el-button>
      </div>
    </div>

    <!-- 图像显示区域 -->
    <div v-if="originalImage" class="p-8 border-t border-gray-200/60">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 原始图像 -->
        <div class="image-container">
          <h4 class="text-xl font-semibold text-gray-800 mb-4 text-center">
            📷 原始图像
          </h4>
          <div class="image-wrapper">
            <img :src="originalImage" alt="原始图像" class="w-full h-auto rounded-lg shadow-lg border border-gray-200" />
            <div class="image-info">
              <span class="info-tag">{{ imageInfo.width }} × {{ imageInfo.height }}</span>
              <span class="info-tag">{{ formatBytes(imageInfo.size) }}</span>
            </div>
          </div>
        </div>

        <!-- 处理结果 -->
        <div class="image-container">
          <h4 class="text-xl font-semibold text-gray-800 mb-4 text-center">
            ✨ 处理结果
          </h4>
          <div class="image-wrapper">
            <div v-if="processing" class="processing-placeholder">
              <div class="loading-spinner"></div>
              <p class="text-gray-600 mt-4">正在处理图像...</p>
            </div>
            <img v-else-if="processedImage" :src="processedImage" alt="处理结果"
              class="w-full h-auto rounded-lg shadow-lg border border-gray-200" />
            <div v-else class="placeholder">
              <p class="text-gray-400">处理结果将显示在这里</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 处理统计 -->
      <div v-if="processingStats.time > 0" class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h4 class="text-lg font-semibold text-gray-800 mb-4 text-center">📊 处理统计</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="stat-item">
            <span class="label">处理时间：</span>
            <span class="value">{{ processingStats.time }}ms</span>
          </div>
          <div class="stat-item">
            <span class="label">处理方式：</span>
            <span class="value" :class="processingStats.method === 'worker' ? 'text-green-600' : 'text-red-600'">
              {{ processingStats.method === 'worker' ? 'Worker线程' : '主线程' }}
            </span>
          </div>
          <div class="stat-item">
            <span class="label">滤镜类型：</span>
            <span class="value">{{ getFilterName(processingStats.filter) }}</span>
          </div>
          <div class="stat-item">
            <span class="label">UI阻塞：</span>
            <span class="value" :class="processingStats.method === 'worker' ? 'text-green-600' : 'text-red-600'">
              {{ processingStats.method === 'worker' ? '否' : '是' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="p-16 text-center">
      <div class="text-6xl mb-4">🖼️</div>
      <h4 class="text-xl font-semibold text-gray-600 mb-2">请选择一张图像开始处理</h4>
      <p class="text-gray-500">支持 JPG、PNG、GIF 等常见格式</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { ElButton, ElUpload, ElSelect, ElOption, ElRadioGroup, ElRadio } from 'element-plus'

// Props
interface ImageInfo {
  width: number
  height: number
  size: number
}

interface ProcessingStats {
  time: number
  method: string
  filter: string
}

interface Props {
  selectedFilter: string
  processMode: string
  originalImage: string | null
  processedImage: string | null
  processing: boolean
  imageInfo: ImageInfo
  processingStats: ProcessingStats
}

const props = withDefaults(defineProps<Props>(), {
  selectedFilter: 'none',
  processMode: 'worker',
  originalImage: null,
  processedImage: null,
  processing: false,
  imageInfo: () => ({ width: 0, height: 0, size: 0 }),
  processingStats: () => ({ time: 0, method: '', filter: '' })
})

// Emits
const emit = defineEmits([
  'update:selectedFilter',
  'update:processMode',
  'imageUpload',
  'processImage',
  'resetImage',
  'downloadProcessedImage',
  'updateFilter',
  'updateProcessMode'
])

// 注入事件处理器
const eventHandlers = inject('eventHandlers', {}) as Record<string, Function>

// 响应式数据
const uploadRef = ref()

// 方法
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFilterName = (filter: string): string => {
  const filterNames: Record<string, string> = {
    none: '无滤镜',
    grayscale: '灰度',
    invert: '反色',
    blur: '模糊',
    sharpen: '锐化',
    edge: '边缘检测',
    emboss: '浮雕'
  }
  return filterNames[filter] || filter
}

const handleImageUpload = (file: any) => eventHandlers['imageUpload']?.(file)
const updateFilter = () => eventHandlers['updateFilter']?.()
const updateProcessMode = () => eventHandlers['updateProcessMode']?.()
const processImage = () => eventHandlers['processImage']?.()
const resetImage = () => eventHandlers['resetImage']?.()
const downloadProcessedImage = () => eventHandlers['downloadProcessedImage']?.()
</script>

<style lang="scss" scoped>
.control-group {
  margin-bottom: 1rem;
}

.image-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-wrapper {
  position: relative;

  .image-info {
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
}

.processing-placeholder,
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 16rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 4px solid #dbeafe;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

  .label {
    font-size: 0.875rem;
    color: #4b5563;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .value {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1f2937;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
