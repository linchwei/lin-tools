<template>
  <el-dialog
    v-model="visible"
    :title="config.title"
    :width="config.width"
    :top="config.top"
    :modal="config.modal"
    :lock-scroll="config.lockScroll"
    :close-on-click-modal="config.closeOnClickModal"
    :close-on-press-escape="config.closeOnPressEscape"
    :show-close="config.showClose"
    :before-close="handleBeforeClose"
    :destroy-on-close="config.destroyOnClose"
    :center="config.center"
    :align-center="config.alignCenter"
    :draggable="config.draggable"
    :class="config.customClass"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
  >
    <!-- 自定义头部 -->
    <template v-if="config.customHeader" #header>
      <component :is="config.customHeader" v-bind="config.headerProps" />
    </template>

    <!-- 内容区域 -->
    <div class="global-modal-content">
      <!-- 组件内容 -->
      <component 
        v-if="config.component" 
        :is="config.component" 
        v-bind="config.props"
        v-on="config.listeners || {}"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      />
      
      <!-- HTML内容 -->
      <div v-else-if="config.html" v-html="config.html" />
      
      <!-- 文本内容 -->
      <div v-else-if="config.content" class="modal-text-content">
        {{ config.content }}
      </div>

      <!-- 确认对话框 -->
      <div v-else-if="config.type === 'confirm'" class="confirm-content">
        <div class="confirm-icon">
          <el-icon size="48" :color="getIconColor()">
            <component :is="getIconComponent()" />
          </el-icon>
        </div>
        <div class="confirm-message">
          <h3 v-if="config.title" class="confirm-title">{{ config.title }}</h3>
          <p class="confirm-text">{{ config.message }}</p>
        </div>
      </div>
    </div>

    <!-- 自定义底部 -->
    <template v-if="config.customFooter" #footer>
      <component :is="config.customFooter" v-bind="config.footerProps" />
    </template>
    
    <!-- 默认底部 -->
    <template v-else-if="config.showFooter !== false" #footer>
      <div class="modal-footer">
        <el-button 
          v-if="config.showCancel !== false"
          @click="handleCancel"
          :loading="loading"
        >
          {{ config.cancelText || '取消' }}
        </el-button>
        <el-button 
          v-if="config.showConfirm !== false"
          type="primary" 
          @click="handleConfirm"
          :loading="loading"
        >
          {{ config.confirmText || '确定' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Warning, QuestionFilled, InfoFilled, SuccessFilled } from '@element-plus/icons-vue'

export interface ModalConfig {
  // 基础配置
  title?: string
  content?: string
  html?: string
  message?: string
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm'
  
  // 组件配置
  component?: any
  props?: Record<string, any>
  listeners?: Record<string, Function>
  
  // 样式配置
  width?: string | number
  top?: string
  customClass?: string
  center?: boolean
  alignCenter?: boolean
  draggable?: boolean
  
  // 行为配置
  modal?: boolean
  lockScroll?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  destroyOnClose?: boolean
  
  // 按钮配置
  showFooter?: boolean
  showConfirm?: boolean
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
  
  // 自定义插槽
  customHeader?: any
  customFooter?: any
  headerProps?: Record<string, any>
  footerProps?: Record<string, any>
  
  // 回调函数
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  beforeClose?: (done: () => void) => void
}

const props = defineProps<{
  config: ModalConfig
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const visible = ref(false)
const loading = ref(false)

const getIconComponent = () => {
  switch (props.config.type) {
    case 'warning': return Warning
    case 'error': return Warning
    case 'info': return InfoFilled
    case 'success': return SuccessFilled
    case 'confirm': return QuestionFilled
    default: return QuestionFilled
  }
}

const getIconColor = () => {
  switch (props.config.type) {
    case 'warning': return '#E6A23C'
    case 'error': return '#F56C6C'
    case 'info': return '#409EFF'
    case 'success': return '#67C23A'
    case 'confirm': return '#E6A23C'
    default: return '#409EFF'
  }
}

const handleOpen = () => {
  props.config.onOpen?.()
}

const handleOpened = () => {
  props.config.onOpened?.()
}

const handleClose = () => {
  props.config.onClose?.()
}

const handleClosed = () => {
  props.config.onClosed?.()
  emit('update:visible', false)
}

const handleBeforeClose = (done: () => void) => {
  if (props.config.beforeClose) {
    props.config.beforeClose(done)
  } else {
    done()
  }
}

const handleConfirm = async () => {
  try {
    loading.value = true
    await props.config.onConfirm?.()
    emit('confirm')
    visible.value = false
  } catch (error) {
    console.error('Modal confirm error:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  props.config.onCancel?.()
  emit('cancel')
  visible.value = false
}

// 暴露方法
const show = () => {
  visible.value = true
}

const hide = () => {
  visible.value = false
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.global-modal-content {
  min-height: 60px;
}

.modal-text-content {
  padding: 20px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.confirm-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
}

.confirm-icon {
  flex-shrink: 0;
}

.confirm-message {
  flex: 1;
}

.confirm-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.confirm-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>