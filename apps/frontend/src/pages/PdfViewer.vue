<template>
  <div class="pdf-viewer-container" :class="{ 'fullscreen': isFullscreen }">
    <div class="pdf-toolbar">
      <div class="flex items-center gap-4">
        <input type="file" ref="fileInput" @change="handleFileSelect" accept=".pdf" class="hidden" />
        <el-button @click="fileInput?.click()" type="primary">
          选择PDF文件
        </el-button>

        <div v-if="pdfSrc" class="flex items-center gap-2">
          <el-button @click="prevPage" :disabled="currentPage <= 1">
            上一页
          </el-button>
          <span class="text-sm">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <el-button @click="nextPage" :disabled="currentPage >= totalPages">
            下一页
          </el-button>

          <el-select v-model="scale" @change="updateScale" class="w-24">
            <el-option label="50%" :value="0.5" />
            <el-option label="75%" :value="0.75" />
            <el-option label="100%" :value="1" />
            <el-option label="125%" :value="1.25" />
            <el-option label="150%" :value="1.5" />
            <el-option label="200%" :value="2" />
            <el-option label="300%" :value="3" />
          </el-select>

          <el-button @click="zoomIn" :disabled="scale >= 3">
            放大
          </el-button>
          <el-button @click="zoomOut" :disabled="scale <= 0.5">
            缩小
          </el-button>
          <el-button @click="toggleFullscreen">
            {{ isFullscreen ? '退出全屏' : '全屏' }}
          </el-button>
        </div>
      </div>
    </div>

    <div class="pdf-content" v-if="pdfSrc">
      <vue-pdf-embed :source="pdfSrc" :page="currentPage" :scale="scale" @loaded="onPdfLoaded"
        @loading-failed="onLoadingFailed" class="pdf-page" />
    </div>

    <div v-else class="empty-state">
      <div class="text-center py-20">
        <el-icon size="64" class="text-gray-400 mb-4">
          <DocumentIcon />
        </el-icon>
        <p class="text-gray-500">请选择PDF文件进行预览</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { DocumentIcon } from '@heroicons/vue/24/outline'
import { ElMessage, ElIcon, ElButton, ElSelect, ElOption } from 'element-plus'

const fileInput = ref<HTMLInputElement>()
const pdfSrc = ref<string | ArrayBuffer | null>(null)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1)
const isFullscreen = ref(false)

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.type !== 'application/pdf') {
    ElMessage.error('请选择PDF文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    pdfSrc.value = e.target?.result || null
    currentPage.value = 1
  }
  reader.readAsArrayBuffer(file)
}

const onPdfLoaded = (pdf: any) => {
  totalPages.value = pdf.numPages
  ElMessage.success(`PDF加载成功，共${pdf.numPages}页`)
}

const onLoadingFailed = (error: any) => {
  ElMessage.error('PDF加载失败')
  console.error('PDF loading failed:', error)
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const updateScale = () => {
  // 缩放更新会自动触发重新渲染
}

const zoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.min(3, scale.value + 0.25)
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(0.5, scale.value - 0.25)
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (!pdfSrc.value) return

    switch (e.key) {
      case 'ArrowLeft':
        prevPage()
        break
      case 'ArrowRight':
        nextPage()
        break
      case '+':
      case '=':
        if (e.ctrlKey) {
          e.preventDefault()
          zoomIn()
        }
        break
      case '-':
        if (e.ctrlKey) {
          e.preventDefault()
          zoomOut()
        }
        break
      case 'F11':
        e.preventDefault()
        toggleFullscreen()
        break
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.pdf-viewer-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.pdf-viewer-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: white;
}

.pdf-toolbar {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.pdf-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pdf-viewer-container.fullscreen .pdf-content {
  padding: 10px;
}

.pdf-page {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  background: white;
  max-width: none;
  width: 100% !important;
  height: auto;
}

.pdf-viewer-container.fullscreen .pdf-page {
  width: calc(100vw - 20px) !important;
  max-height: calc(100vh - 100px);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
