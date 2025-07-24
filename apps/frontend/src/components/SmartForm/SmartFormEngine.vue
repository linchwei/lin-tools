<template>
  <div class="smart-form-engine">
    <!-- 表单设计器 -->
    <div v-if="mode === 'design'" class="form-designer">
      <SmartFormDesigner :schema="schema || defaultSchema" @update:schema="handleSchemaUpdate" @preview="handlePreview"
        @export="handleExport" />
    </div>

    <!-- 表单渲染器 -->
    <div v-else class="form-renderer">
      <el-form :model="internalFormData" ref="formRef" :rules="formRules">
        <div v-for="field in schema?.fields" :key="field.id" class="form-field"
          :class="{ 'field-focused': focusedField === field.id }">
          <el-form-item :label="field.label" :prop="field.name" :required="field.required">
            <!-- 文本输入框 -->
            <div v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel'" class="field-container">
              <el-input v-model="internalFormData[field.name]"
                :type="field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'"
                :placeholder="field.placeholder" @change="handleFieldChange(field.name, $event)"
                @focus="handleFieldFocus(field.id)" @blur="handleFieldBlur"
                :class="{ 'has-ai-suggestions': fieldSuggestions[field.id]?.length > 0 }" />
              <!-- AI建议下拉 -->
              <div v-if="aiEnabled && fieldSuggestions[field.id]?.length > 0" class="ai-suggestions-dropdown">
                <div class="suggestions-header">
                  <span>🤖 AI建议</span>
                  <span class="confidence">{{ Math.round(fieldSuggestions[field.id].confidence * 100) }}%</span>
                </div>
                <div v-for="suggestion in fieldSuggestions[field.id].suggestions.slice(0, 3)" :key="suggestion"
                  class="suggestion-item" @click="applySuggestion(field.name, suggestion)">
                  {{ suggestion }}
                </div>
                <div class="suggestions-reasoning">
                  {{ fieldSuggestions[field.id].reasoning }}
                </div>
              </div>
            </div>

            <!-- 文本域 -->
            <el-input v-else-if="field.type === 'textarea'" v-model="internalFormData[field.name]" type="textarea"
              :placeholder="field.placeholder" :rows="4" @change="handleFieldChange(field.name, $event)"
              @focus="handleFieldFocus(field.id)" @blur="handleFieldBlur" />

            <!-- 选择框 -->
            <el-select v-else-if="field.type === 'select'" v-model="internalFormData[field.name]"
              :placeholder="field.placeholder" style="width: 100%" @change="handleFieldChange(field.name, $event)"
              @focus="handleFieldFocus(field.id)" @blur="handleFieldBlur">
              <el-option v-for="option in field.options" :key="option.value" :label="option.label"
                :value="option.value" />
            </el-select>

            <!-- 评分 -->
            <el-rate v-else-if="field.type === 'rate'" v-model="internalFormData[field.name]"
              @change="handleFieldChange(field.name, $event)" />

            <!-- 数字输入框 -->
            <el-input-number v-else-if="field.type === 'number'" v-model.number="internalFormData[field.name]"
              :placeholder="field.placeholder" style="width: 100%" @change="handleFieldChange(field.name, $event)"
              @focus="handleFieldFocus(field.id)" @blur="handleFieldBlur" />

            <!-- 默认文本输入框 -->
            <el-input v-else v-model="internalFormData[field.name]" :placeholder="field.placeholder"
              @change="handleFieldChange(field.name, $event)" @focus="handleFieldFocus(field.id)"
              @blur="handleFieldBlur" />

            <!-- 字段验证状态 -->
            <div v-if="fieldValidation[field.id]" class="field-validation">
              <div v-if="!fieldValidation[field.id].valid" class="validation-error">
                <el-icon>
                  <Warning />
                </el-icon>
                {{ fieldValidation[field.id].message }}
              </div>
              <div v-else class="validation-success">
                <el-icon>
                  <Check />
                </el-icon>
                验证通过
              </div>
            </div>
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ submitting ? '提交中...' : '提交' }}
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-if="aiEnabled" @click="getAIOptimization" :loading="optimizing">
            🤖 AI优化建议
          </el-button>
        </div>
      </el-form>

      <!-- AI助手 -->
      <SmartFormAI v-if="aiEnabled" :schema="schema || defaultSchema" :form-data="internalFormData"
        @suggestion="handleAISuggestion" @optimize="handleAIOptimization" @field-focus="handleAIFieldFocus" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { Warning, Check } from '@element-plus/icons-vue'
import type { SmartFormSchema } from './types'
import SmartFormDesigner from './SmartFormDesigner.vue'
import SmartFormAI from './SmartFormAI.vue'
import { AIEngine } from './engines/AIEngine'
import { ElMessage } from 'element-plus'

interface Props {
  schema?: SmartFormSchema
  mode?: 'design' | 'render'
  aiEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'render',
  aiEnabled: true
})

const emit = defineEmits<{
  'schema-change': [schema: SmartFormSchema]
  'submit': [data: any]
  'field-change': [field: string, value: any]
}>()

// 基础响应式数据
const formRef = ref()
const internalFormData = reactive<Record<string, any>>({})
const submitting = ref(false)
const optimizing = ref(false)
const focusedField = ref<string>('')

// AI相关数据
const aiEngine = new AIEngine()
const fieldSuggestions = reactive<Record<string, any>>({})
const fieldValidation = reactive<Record<string, any>>({})

// 表单验证规则
const formRules = computed(() => {
  const rules: Record<string, any> = {}

  props.schema?.fields?.forEach(field => {
    if (field.required) {
      rules[field.name] = [
        { required: true, message: `请输入${field.label}`, trigger: 'blur' }
      ]
    }

    // 添加特定类型的验证规则
    if (field.type === 'email') {
      rules[field.name] = [
        ...(rules[field.name] || []),
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ]
    }

    if (field.type === 'tel') {
      rules[field.name] = [
        ...(rules[field.name] || []),
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
      ]
    }
  })

  return rules
})

// 默认的表单结构
const defaultSchema: SmartFormSchema = {
  id: 'new-form',
  version: '1.0.0',
  title: '新建表单',
  description: '',
  fields: [],
  rules: [],
  conditions: [],
  layout: {
    type: 'vertical',
    spacing: 16
  },
  ai: {
    enabled: true,
    autoComplete: true,
    smartValidation: true,
    fieldSuggestions: true,
    dataAnalysis: true
  }
}

// 处理设计器的 schema 更新
const handleSchemaUpdate = (newSchema: SmartFormSchema) => {
  emit('schema-change', newSchema)
}

// 处理预览
const handlePreview = () => {
  // 预览功能已经在 SmartFormDesigner 内部实现
  console.log('预览表单', props.schema)
}

// 处理导出
const handleExport = () => {
  const schemaJson = JSON.stringify(props.schema || defaultSchema, null, 2)
  const blob = new Blob([schemaJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.schema?.title || 'form'}-schema.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('表单配置已导出')
}

// 字段交互方法
const handleFieldFocus = async (fieldId: string) => {
  focusedField.value = fieldId

  if (props.aiEnabled) {
    // 获取AI建议
    const field = props.schema?.fields?.find(f => f.id === fieldId)
    if (field) {
      try {
        const suggestions = await aiEngine.suggestFieldValue(field, internalFormData)
        fieldSuggestions[fieldId] = suggestions
      } catch (error) {
        console.error('获取AI建议失败:', error)
      }
    }
  }
}

const handleFieldBlur = () => {
  focusedField.value = ''
}

const applySuggestion = (fieldName: string, suggestion: string) => {
  internalFormData[fieldName] = suggestion
  emit('field-change', fieldName, suggestion)

  // 清除该字段的建议
  const fieldId = props.schema?.fields?.find(f => f.name === fieldName)?.id
  if (fieldId) {
    delete fieldSuggestions[fieldId]
  }

  ElMessage.success('已应用AI建议')
}

// AI相关方法
const handleAISuggestion = (suggestion: any) => {
  console.log('收到AI建议:', suggestion)
  // 处理AI建议的应用
}

const handleAIOptimization = (optimization: any) => {
  console.log('收到AI优化:', optimization)
  // 处理AI优化建议
}

const handleAIFieldFocus = (fieldId: string) => {
  handleFieldFocus(fieldId)
}

const getAIOptimization = async () => {
  optimizing.value = true

  try {
    // 模拟获取AI优化建议
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success('AI分析完成，请查看右侧AI助手面板')
  } catch (error) {
    ElMessage.error('获取AI优化建议失败')
  } finally {
    optimizing.value = false
  }
}

// 实时验证
const validateField = async (fieldId: string, value: any) => {
  if (!props.aiEnabled) return

  const field = props.schema?.fields?.find(f => f.id === fieldId)
  if (!field) return

  try {
    const validation = await aiEngine.validateField(field, value, internalFormData)
    fieldValidation[fieldId] = validation
  } catch (error) {
    console.error('字段验证失败:', error)
  }
}

// 监听 schema 变化，初始化表单数据
watch(() => props.schema, (newSchema) => {
  if (newSchema?.fields) {
    // 清空旧数据
    Object.keys(internalFormData).forEach(key => {
      delete internalFormData[key]
    })

    // 初始化新数据
    newSchema.fields.forEach(field => {
      if (field.type === 'number') {
        internalFormData[field.name] = field.defaultValue || 0
      } else {
        internalFormData[field.name] = field.defaultValue || ''
      }
    })
  }
}, { immediate: true, deep: true })

// 监听表单数据变化，进行实时验证
watch(internalFormData, (newData, oldData) => {
  if (props.aiEnabled && oldData) {
    Object.keys(newData).forEach(key => {
      if (newData[key] !== oldData[key]) {
        const field = props.schema?.fields?.find(f => f.name === key)
        if (field) {
          validateField(field.id, newData[key])
          aiEngine.analyzeFieldChange(key, newData[key], props.schema!)
        }
      }
    })
  }
}, { deep: true })

const handleFieldChange = (field: string, value: any) => {
  emit('field-change', field, value)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟提交过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('submit', { ...internalFormData })
    ElMessage.success('表单提交成功！')
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入')
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()

  // 清空AI相关数据
  Object.keys(fieldSuggestions).forEach(key => {
    delete fieldSuggestions[key]
  })
  Object.keys(fieldValidation).forEach(key => {
    delete fieldValidation[key]
  })
}
</script>

<style scoped>
.smart-form-engine {
  width: 100%;
  position: relative;
}

/* 表单渲染器 */
.form-renderer {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 表单字段 */
.form-field {
  margin-bottom: 24px;
  transition: all 0.3s ease;
  position: relative;
}

.form-field.field-focused {
  transform: translateX(4px);
}

.form-field.field-focused::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  animation: focusGlow 0.3s ease-out;
}

@keyframes focusGlow {
  from {
    opacity: 0;
    transform: scaleY(0);
  }

  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

/* 字段容器 */
.field-container {
  position: relative;
}

/* AI建议输入框样式 */
.has-ai-suggestions {
  border-color: #667eea !important;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
}

/* AI建议下拉框 */
.ai-suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  margin-top: 4px;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.confidence {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333;
}

.suggestion-item:hover {
  background: #f8f9ff;
  color: #667eea;
  transform: translateX(4px);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestions-reasoning {
  padding: 12px 16px;
  background: #f8f9ff;
  color: #666;
  font-size: 12px;
  font-style: italic;
  border-top: 1px solid #e1e5e9;
}

/* 字段验证状态 */
.field-validation {
  margin-top: 8px;
  font-size: 12px;
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f56c6c;
  animation: shake 0.5s ease-in-out;
}

.validation-success {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #67c23a;
  animation: fadeIn 0.3s ease-out;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-4px);
  }

  75% {
    transform: translateX(4px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 表单操作按钮 */
.form-actions {
  text-align: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e1e5e9;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.form-actions .el-button {
  min-width: 120px;
  height: 44px;
  border-radius: 22px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.form-actions .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.form-actions .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.form-actions .el-button:not(.el-button--primary) {
  border-color: #d1d5db;
  color: #6b7280;
}

.form-actions .el-button:not(.el-button--primary):hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-renderer {
    padding: 24px 20px;
    margin: 0 10px;
  }

  .form-field {
    margin-bottom: 20px;
  }

  .form-actions {
    flex-direction: column;
    align-items: center;
  }

  .form-actions .el-button {
    width: 100%;
    max-width: 280px;
  }

  .ai-suggestions-dropdown {
    position: fixed;
    left: 10px;
    right: 10px;
    top: auto;
    bottom: 20px;
    margin-top: 0;
  }
}

@media (max-width: 480px) {
  .form-renderer {
    padding: 20px 16px;
    margin: 0 5px;
    border-radius: 12px;
  }

  .form-field.field-focused {
    transform: none;
  }

  .form-field.field-focused::before {
    display: none;
  }
}

/* 加载状态 */
.el-button.is-loading {
  position: relative;
  overflow: hidden;
}

.el-button.is-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: loading-shine 1.5s infinite;
}

@keyframes loading-shine {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

/* 表单项标签样式增强 */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

:deep(.el-form-item__label::before) {
  color: #ef4444 !important;
}

/* 输入框样式增强 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #d1d5db;
}

:deep(.el-input__wrapper:hover) {
  border-color: #9ca3af;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:hover) {
  border-color: #9ca3af;
}

:deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 选择框样式增强 */
:deep(.el-select .el-input__wrapper) {
  transition: all 0.3s ease;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: #9ca3af;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
</style>
