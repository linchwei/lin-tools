<template>
  <el-dialog v-model="visible" title="表单预览" width="80%" :before-close="handleClose" class="form-preview-dialog">
    <div class="preview-container">
      <div class="preview-header">
        <h2 class="form-title">{{ schema.title }}</h2>
        <p v-if="schema.description" class="form-description">{{ schema.description }}</p>
      </div>

      <div class="preview-content">
        <el-form ref="previewFormRef" :model="formData" :rules="formRules" label-width="120px" class="preview-form">
          <el-form-item v-for="field in schema.fields" :key="field.id" :label="field.label" :prop="field.name"
            :required="field.required">
            <!-- 文本输入 -->
            <el-input v-if="field.type === 'text'" v-model="formData[field.name]" :placeholder="field.placeholder"
              clearable />

            <!-- 邮箱输入 -->
            <el-input v-else-if="field.type === 'email'" v-model="formData[field.name]" :placeholder="field.placeholder"
              type="email" clearable />

            <!-- 电话输入 -->
            <el-input v-else-if="field.type === 'tel'" v-model="formData[field.name]" :placeholder="field.placeholder"
              type="tel" clearable />

            <!-- 数字输入 -->
            <el-input-number v-else-if="field.type === 'number'" v-model="formData[field.name]"
              :placeholder="field.placeholder" style="width: 100%" />

            <!-- 多行文本 -->
            <el-input v-else-if="field.type === 'textarea'" v-model="formData[field.name]"
              :placeholder="field.placeholder" type="textarea" :rows="4" />

            <!-- 下拉选择 -->
            <el-select v-else-if="field.type === 'select'" v-model="formData[field.name]"
              :placeholder="field.placeholder" style="width: 100%" clearable>
              <el-option v-for="option in field.options" :key="option.value" :label="option.label"
                :value="option.value" />
            </el-select>

            <!-- 评分 -->
            <el-rate v-else-if="field.type === 'rate'" v-model="formData[field.name]" show-text />

            <!-- 默认文本输入 -->
            <el-input v-else v-model="formData[field.name]" :placeholder="field.placeholder" clearable />
          </el-form-item>
        </el-form>
      </div>

      <div class="preview-data">
        <h3>实时数据预览</h3>
        <el-card class="data-card">
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
        </el-card>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resetForm">重置表单</el-button>
        <el-button type="primary" @click="validateForm">验证表单</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { SmartFormSchema } from './types'

interface Props {
  modelValue: boolean
  schema: SmartFormSchema
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const previewFormRef = ref<FormInstance>()
const formData = reactive<Record<string, any>>({})

// 根据字段生成表单规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}

  props.schema.fields.forEach(field => {
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
  })

  return rules
})

// 初始化表单数据
const initFormData = () => {
  const data: Record<string, any> = {}
  props.schema.fields.forEach(field => {
    switch (field.type) {
      case 'number':
        data[field.name] = 0
        break
      case 'rate':
        data[field.name] = 0
        break
      case 'select':
        data[field.name] = ''
        break
      default:
        data[field.name] = ''
    }
  })
  Object.assign(formData, data)
}

// 监听 schema 变化，重新初始化表单数据
watch(() => props.schema, () => {
  if (visible.value) {
    initFormData()
  }
}, { deep: true })

// 监听对话框显示状态
watch(visible, (newVisible) => {
  if (newVisible) {
    initFormData()
  }
})

const handleClose = () => {
  visible.value = false
}

const resetForm = () => {
  previewFormRef.value?.resetFields()
  initFormData()
}

const validateForm = async () => {
  try {
    await previewFormRef.value?.validate()
    ElMessage.success('表单验证通过！')
  } catch (error) {
    ElMessage.error('表单验证失败，请检查必填项')
  }
}
</script>

<style scoped>
.form-preview-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.preview-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 20px;
}

.form-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.form-description {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.preview-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.preview-form {
  max-width: 600px;
  margin: 0 auto;
}

.preview-data {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.preview-data h3 {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.data-card {
  background: #2d3748;
  border: none;
}

.data-card :deep(.el-card__body) {
  padding: 16px;
}

.data-card pre {
  color: #e2e8f0;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-container {
    max-height: 60vh;
  }

  .preview-form {
    max-width: 100%;
  }

  .form-preview-dialog {
    width: 95% !important;
  }
}
</style>