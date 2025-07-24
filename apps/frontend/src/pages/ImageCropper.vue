<template>
  <div class="image-cropper-container min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">✂️ 图片裁切工具</h1>
        <p class="text-gray-600">支持多种裁切比例、实时预览、高质量输出</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：图片上传和裁切区域 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <!-- 上传区域 -->
            <div v-if="!originalImage" class="upload-area">
              <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*" class="hidden" />
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                @click="fileInput?.click()" @dragover.prevent @drop.prevent="handleFileDrop">
                <div class="text-6xl mb-4">📷</div>
                <p class="text-lg font-medium text-gray-700 mb-2">点击或拖拽上传图片</p>
                <p class="text-sm text-gray-500">支持 JPG、PNG、GIF 格式</p>
              </div>
            </div>

            <!-- 裁切区域 -->
            <div v-else class="cropper-wrapper">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">图片裁切</h3>
                <el-button @click="resetImage" size="small">重新选择</el-button>
              </div>

              <div class="cropper-container" ref="cropperContainer">
                <img ref="cropperImage" :src="originalImage" class="max-w-full" />
              </div>

              <!-- 操作按钮 -->
              <div class="flex justify-center gap-4 mt-6">
                <el-button @click="rotateLeft" icon="RefreshLeft">左转90°</el-button>
                <el-button @click="rotateRight" icon="RefreshRight">右转90°</el-button>
                <el-button @click="flipHorizontal" icon="Switch">水平翻转</el-button>
                <el-button @click="flipVertical" icon="Sort">垂直翻转</el-button>
                <el-button @click="reset" type="warning">重置</el-button>
                <el-button @click="cropImage" type="primary">裁切图片</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：设置和预览 -->
        <div class="space-y-6">
          <!-- 裁切设置 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4">裁切设置</h3>

            <!-- 宽高比 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">宽高比</label>
              <el-select v-model="aspectRatio" @change="setAspectRatio" class="w-full">
                <el-option label="自由裁切" value="free" />
                <el-option label="1:1 (正方形)" value="1" />
                <el-option label="4:3" value="1.33" />
                <el-option label="16:9" value="1.78" />
                <el-option label="3:2" value="1.5" />
                <el-option label="2:3" value="0.67" />
                <el-option label="9:16" value="0.56" />
              </el-select>
            </div>

            <!-- 输出尺寸 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">输出尺寸</label>
              <div class="grid grid-cols-2 gap-2">
                <el-input-number v-model="outputWidth" :min="1" :max="4000" placeholder="宽度" size="small" />
                <el-input-number v-model="outputHeight" :min="1" :max="4000" placeholder="高度" size="small" />
              </div>
            </div>

            <!-- 输出质量 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                输出质量: {{ Math.round(quality * 100) }}%
              </label>
              <el-slider v-model="quality" :min="0.1" :max="1" :step="0.1" />
            </div>

            <!-- 输出格式 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
              <el-radio-group v-model="outputFormat">
                <el-radio value="jpeg">JPEG</el-radio>
                <el-radio value="png">PNG</el-radio>
                <el-radio value="webp">WebP</el-radio>
              </el-radio-group>
            </div>
          </div>

          <!-- 预览区域 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4">裁切预览</h3>
            <div class="preview-container">
              <div v-if="!croppedImage" class="preview-placeholder">
                <div class="text-4xl mb-2">🖼️</div>
                <p class="text-sm text-gray-500">裁切后的图片预览</p>
              </div>
              <div v-else class="preview-image">
                <img :src="croppedImage" class="max-w-full rounded" />
                <div class="mt-4 space-y-2">
                  <p class="text-sm text-gray-600">
                    尺寸: {{ imageInfo.width }} × {{ imageInfo.height }}
                  </p>
                  <p class="text-sm text-gray-600">
                    大小: {{ formatFileSize(imageInfo.size) }}
                  </p>
                  <el-button @click="downloadImage" type="success" size="small" class="w-full">
                    下载图片
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 历史记录 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4">历史记录</h3>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              <div v-for="(item, index) in history" :key="index"
                class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                @click="loadFromHistory(item)">
                <img :src="item.thumbnail" class="w-12 h-12 object-cover rounded" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.timestamp }}</p>
                </div>
              </div>
              <div v-if="history.length === 0" class="text-center text-gray-500 py-4">
                暂无历史记录
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElButton, ElSelect, ElOption, ElInputNumber, ElSlider, ElRadioGroup, ElRadio } from 'element-plus'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css';

interface HistoryItem {
  name: string
  thumbnail: string
  timestamp: string
  data: string
}

interface ImageInfo {
  width: number
  height: number
  size: number
}

const fileInput = ref<HTMLInputElement>()
const cropperContainer = ref<HTMLElement>()
const cropperImage = ref<HTMLImageElement>()

const originalImage = ref<string>('')
const croppedImage = ref<string>('')
const cropper = ref<Cropper>()

const aspectRatio = ref<string>('free')
const outputWidth = ref<number>(800)
const outputHeight = ref<number>(600)
const quality = ref<number>(0.9)
const outputFormat = ref<string>('jpeg')

const imageInfo = ref<ImageInfo>({ width: 0, height: 0, size: 0 })
const history = ref<HistoryItem[]>([])

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleFileDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    nextTick(() => {
      initCropper()
    })
  }
  reader.readAsDataURL(file)
}

const initCropper = () => {
  if (cropper.value) {
    cropper.value.destroy()
  }

  if (cropperImage.value) {
    cropper.value = new Cropper(cropperImage.value, {
      aspectRatio: aspectRatio.value === 'free' ? NaN : parseFloat(aspectRatio.value),
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    })
  }
}

const setAspectRatio = () => {
  if (cropper.value && typeof cropper.value.setAspectRatio === 'function') {
    const ratio = aspectRatio.value === 'free' ? NaN : parseFloat(aspectRatio.value)
    cropper.value.setAspectRatio(ratio)
  }
}

const rotateLeft = () => {
  if (cropper.value && typeof cropper.value.rotate === 'function') {
    cropper.value.rotate(-90)
  } else {
    ElMessage.error('裁切器未初始化')
  }
}

const rotateRight = () => {
  if (cropper.value && typeof cropper.value.rotate === 'function') {
    cropper.value.rotate(90)
  } else {
    ElMessage.error('裁切器未初始化')
  }
}

const flipHorizontal = () => {
  if (cropper.value && typeof cropper.value.scaleX === 'function') {
    const imageData = cropper.value.getImageData()
    cropper.value.scaleX(imageData?.scaleX === 1 ? -1 : 1)
  } else {
    ElMessage.error('裁切器未初始化')
  }
}

const flipVertical = () => {
  if (cropper.value && typeof cropper.value.scaleY === 'function') {
    const imageData = cropper.value.getImageData()
    cropper.value.scaleY(imageData?.scaleY === 1 ? -1 : 1)
  } else {
    ElMessage.error('裁切器未初始化')
  }
}

const reset = () => {
  if (cropper.value && typeof cropper.value.reset === 'function') {
    cropper.value.reset()
  } else {
    ElMessage.error('裁切器未初始化')
  }
}

const cropImage = () => {
  if (!cropper.value || typeof cropper.value.getCroppedCanvas !== 'function') {
    ElMessage.error('裁切器未初始化')
    return
  }

  const canvas = cropper.value.getCroppedCanvas({
    width: outputWidth.value,
    height: outputHeight.value,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  })

  const mimeType = `image/${outputFormat.value}`
  croppedImage.value = canvas.toDataURL(mimeType, quality.value)

  // 更新图片信息
  imageInfo.value = {
    width: canvas.width,
    height: canvas.height,
    size: Math.round((croppedImage.value.length * 3) / 4),
  }

  // 添加到历史记录
  const thumbnail = cropper.value.getCroppedCanvas({ width: 100, height: 100 }).toDataURL()
  history.value.unshift({
    name: `裁切图片_${Date.now()}`,
    thumbnail,
    timestamp: new Date().toLocaleString(),
    data: croppedImage.value,
  })

  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10)
  }

  ElMessage.success('图片裁切成功')
}

const downloadImage = () => {
  if (!croppedImage.value) return

  const link = document.createElement('a')
  link.download = `cropped_image_${Date.now()}.${outputFormat.value}`
  link.href = croppedImage.value
  link.click()
}

const resetImage = () => {
  originalImage.value = ''
  croppedImage.value = ''
  if (cropper.value) {
    cropper.value.destroy()
    cropper.value = undefined
  }
}

const loadFromHistory = (item: HistoryItem) => {
  croppedImage.value = item.data

  // 创建临时图片获取尺寸信息
  const img = new Image()
  img.onload = () => {
    imageInfo.value = {
      width: img.width,
      height: img.height,
      size: Math.round((item.data.length * 3) / 4),
    }
  }
  img.src = item.data
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onBeforeUnmount(() => {
  if (cropper.value) {
    cropper.value.destroy()
  }
})
</script>

<style scoped>
.upload-area {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-container {
  max-height: 500px;
  overflow: hidden;
}

.preview-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  text-align: center;
  color: #9ca3af;
}

.preview-image {
  text-align: center;
}

:deep(.cropper-container) {
  max-height: 500px;
}

:deep(.cropper-canvas) {
  max-width: 100%;
}
</style>
