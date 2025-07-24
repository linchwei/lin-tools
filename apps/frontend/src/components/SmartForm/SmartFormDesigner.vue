<template>
  <div class="smart-form-designer">
    <div class="designer-layout">
      <div class="field-palette">
        <h4>字段库</h4>
        <div class="field-types">
          <div v-for="fieldType in fieldTypes" :key="fieldType.type" class="field-type-item" draggable="true"
            @dragstart="handleDragStart(fieldType)">
            <i :class="fieldType.icon"></i>
            {{ fieldType.label }}
          </div>
        </div>
      </div>

      <div class="design-canvas">
        <h4>表单设计区</h4>
        <div class="canvas-area" :class="{ 'drag-over': isDragOver }" @drop="handleDrop" @dragover="handleDragOver"
          @dragenter="handleDragEnter" @dragleave="handleDragLeave">
          <div v-if="!localSchema.fields?.length" class="empty-canvas">
            <div>
              <i class="el-icon-upload" style="font-size: 48px; color: #c0c4cc; margin-bottom: 16px;"></i>
              <p>拖拽字段到这里开始设计表单</p>
            </div>
          </div>
          <div v-else>
            <div v-for="(field, index) in localSchema.fields" :key="field.id" class="field-item"
              :class="{ active: selectedFieldId === field.id }" @click="selectField(field.id)">
              <div class="field-content">
                <i :class="getFieldIcon(field.type)" style="color: #409eff;"></i>
                <span class="field-label">{{ field.label }}</span>
                <span class="field-type">{{ field.type }}</span>
              </div>
              <div class="field-actions">
                <el-button size="small" type="text" @click.stop="moveField(index, -1)" :disabled="index === 0">
                  <i class="el-icon-arrow-up"></i>
                </el-button>
                <el-button size="small" type="text" @click.stop="moveField(index, 1)"
                  :disabled="index === localSchema.fields.length - 1">
                  <i class="el-icon-arrow-down"></i>
                </el-button>
                <el-button size="small" type="text" @click.stop="removeField(index)">
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 属性面板保持不变 -->
      <div class="property-panel">
        <h4>属性面板</h4>
        <div class="properties">
          <el-form label-width="80px">
            <!-- 表单基本属性 -->
            <div v-if="!selectedFieldId">
              <el-form-item label="表单标题">
                <el-input v-model="localSchema.title" @input="updateSchema" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="localSchema.description" type="textarea" @input="updateSchema" />
              </el-form-item>
            </div>

            <!-- 字段属性 -->
            <div v-else-if="selectedField">
              <el-form-item label="字段标签">
                <el-input v-model="selectedField.label" @input="updateSchema" />
              </el-form-item>
              <el-form-item label="字段名称">
                <el-input v-model="selectedField.name" @input="updateSchema" />
              </el-form-item>
              <el-form-item label="占位符">
                <el-input v-model="selectedField.placeholder" @input="updateSchema" />
              </el-form-item>
              <el-form-item label="必填">
                <el-switch v-model="selectedField.required" @change="updateSchema" />
              </el-form-item>

              <!-- 选择框选项 -->
              <div v-if="selectedField.type === 'select'">
                <el-form-item label="选项">
                  <div v-for="(option, idx) in selectedField.options" :key="idx" class="option-item">
                    <el-input v-model="option.label" placeholder="标签" size="small" />
                    <el-input v-model="option.value" placeholder="值" size="small" />
                    <el-button size="small" type="text" @click="removeOption(idx)">删除</el-button>
                  </div>
                  <el-button size="small" @click="addOption">添加选项</el-button>
                </el-form-item>
              </div>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <div class="designer-toolbar">
      <el-button type="primary" @click="showPreview">
        <i class="el-icon-view"></i> 预览
      </el-button>
      <el-button @click="$emit('export')">
        <i class="el-icon-download"></i> 导出
      </el-button>
      <el-button @click="clearForm">
        <i class="el-icon-delete"></i> 清空
      </el-button>
    </div>

    <!-- 预览模态框 -->
    <SmartFormPreview v-model="previewVisible" :schema="localSchema" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { SmartFormSchema, SmartField } from './types'
import SmartFormPreview from './SmartFormPreview.vue'

interface Props {
  schema: SmartFormSchema
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:schema': [schema: SmartFormSchema]
  'preview': []
  'export': []
}>()

const localSchema = ref<SmartFormSchema>({ ...props.schema })
const selectedFieldId = ref<string>('')
const draggedFieldType = ref<any>(null)
const isDragOver = ref(false)
const previewVisible = ref(false)

const selectedField = computed(() =>
  localSchema.value.fields.find(f => f.id === selectedFieldId.value)
)

// 监听外部 schema 变化
watch(() => props.schema, (newSchema) => {
  localSchema.value = { ...newSchema }
}, { deep: true })

const fieldTypes = ref([
  { type: 'text', label: '文本输入', icon: 'el-icon-edit' },
  { type: 'email', label: '邮箱', icon: 'el-icon-message' },
  { type: 'tel', label: '电话', icon: 'el-icon-phone' },
  { type: 'select', label: '下拉选择', icon: 'el-icon-arrow-down' },
  { type: 'textarea', label: '多行文本', icon: 'el-icon-document' },
  { type: 'number', label: '数字', icon: 'el-icon-s-data' },
  { type: 'rate', label: '评分', icon: 'el-icon-star-on' }
])

const handleDragStart = (fieldType: any) => {
  draggedFieldType.value = fieldType
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  // 只有当离开整个拖放区域时才设置为false
  if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  if (draggedFieldType.value) {
    addField(draggedFieldType.value)
    draggedFieldType.value = null

    // 添加成功反馈
    showSuccessMessage('字段添加成功！')
  }
}

const addField = (fieldType: any) => {
  const newField: SmartField = {
    id: `field_${Date.now()}`,
    name: `field_${localSchema.value.fields.length + 1}`,
    type: fieldType.type,
    label: fieldType.label,
    placeholder: `请输入${fieldType.label}`,
    required: false,
    validation: {},
    dependencies: [],
    aiSuggestions: true
  }

  if (fieldType.type === 'select') {
    newField.options = [
      { label: '选项1', value: 'option1' },
      { label: '选项2', value: 'option2' }
    ]
  }

  localSchema.value.fields.push(newField)
  selectedFieldId.value = newField.id // 自动选中新添加的字段
  updateSchema()
}

const selectField = (fieldId: string) => {
  selectedFieldId.value = fieldId
}

const removeField = (index: number) => {
  localSchema.value.fields.splice(index, 1)
  selectedFieldId.value = ''
  updateSchema()
}

const moveField = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < localSchema.value.fields.length) {
    const field = localSchema.value.fields.splice(index, 1)[0]
    localSchema.value.fields.splice(newIndex, 0, field)
    updateSchema()
  }
}

const addOption = () => {
  if (selectedField.value && selectedField.value.options) {
    selectedField.value.options.push({
      label: `选项${selectedField.value.options.length + 1}`,
      value: `option${selectedField.value.options.length + 1}`
    })
    updateSchema()
  }
}

const removeOption = (index: number) => {
  if (selectedField.value && selectedField.value.options) {
    selectedField.value.options.splice(index, 1)
    updateSchema()
  }
}

const clearForm = () => {
  localSchema.value.fields = []
  selectedFieldId.value = ''
  updateSchema()
}

const updateSchema = () => {
  emit('update:schema', { ...localSchema.value })
}

// 添加成功消息提示
const showSuccessMessage = (message: string) => {
  ElMessage.success(message)
}

const getFieldIcon = (fieldType: string) => {
  const iconMap: Record<string, string> = {
    text: 'el-icon-edit',
    email: 'el-icon-message',
    tel: 'el-icon-phone',
    select: 'el-icon-arrow-down',
    textarea: 'el-icon-document',
    number: 'el-icon-s-data',
    rate: 'el-icon-star-on'
  }
  return iconMap[fieldType] || 'el-icon-edit'
}

// 显示预览
const showPreview = () => {
  if (localSchema.value.fields.length === 0) {
    ElMessage.warning('请先添加字段再预览')
    return
  }
  previewVisible.value = true
}
</script>

<style scoped>
.smart-form-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.designer-layout {
  display: flex;
  flex: 1;
  gap: 1px;
  background: #e4e7ed;
}

.field-palette {
  width: 250px;
  background: white;
  padding: 20px;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.field-palette h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.field-types {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-type-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.field-type-item:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.field-type-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.field-type-item i {
  color: #409eff;
  font-size: 16px;
}

.design-canvas {
  flex: 1;
  background: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.design-canvas h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.canvas-area {
  flex: 1;
  min-height: 500px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  background: #fafbfc;
}

.canvas-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.canvas-area.drag-over {
  border-color: #67c23a;
  background: #f0f9ff;
  box-shadow: inset 0 0 20px rgba(103, 194, 58, 0.1);
}

.empty-canvas {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 16px;
  text-align: center;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23e5e7eb" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
}

.field-item {
  padding: 16px;
  margin: 12px 0;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.field-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: #409eff;
  transform: scaleY(0);
  transition: transform 0.2s ease;
}

.field-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.field-item:hover::before {
  transform: scaleY(1);
}

.field-item.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
}

.field-item.active::before {
  transform: scaleY(1);
}

.field-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.field-label {
  font-weight: 500;
  color: #303133;
}

.field-type {
  color: #909399;
  font-size: 12px;
  background: #f4f4f5;
  padding: 2px 8px;
  border-radius: 12px;
}

.field-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.field-item:hover .field-actions {
  opacity: 1;
}

.property-panel {
  width: 300px;
  background: white;
  padding: 20px;
  border-left: 1px solid #e4e7ed;
  overflow-y: auto;
}

.property-panel h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.option-item {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.designer-toolbar {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.designer-toolbar .el-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
}

/* 拖拽动画效果 */
.field-item.dragging {
  opacity: 0.5;
  transform: rotate(5deg) scale(0.95);
}

.drop-indicator {
  height: 4px;
  background: #67c23a;
  border-radius: 2px;
  margin: 8px 0;
  opacity: 0;
  transform: scaleX(0);
  transition: all 0.2s ease;
}

.drop-indicator.active {
  opacity: 1;
  transform: scaleX(1);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .field-palette {
    width: 200px;
  }

  .property-panel {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .designer-layout {
    flex-direction: column;
  }

  .field-palette,
  .property-panel {
    width: 100%;
    max-height: 200px;
  }
}
</style>
