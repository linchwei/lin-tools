<template>
  <div class="enhanced-form">
    <el-form ref="formRef" :model="formData" :rules="formRules" :label-width="labelWidth"
      :label-position="labelPosition" :size="size" :disabled="disabled" v-bind="formProps">
      <template v-for="field in fields" :key="field.prop">
        <!-- 分组标题 -->
        <div v-if="field.type === 'group'" class="form-group">
          <h3 class="form-group-title">{{ field.label }}</h3>
          <el-divider />
        </div>

        <!-- 普通表单项 -->
        <el-form-item v-else :prop="field.prop" :label="field.label" :required="field.required" :rules="field.rules"
          :class="field.class" :style="field.style">
          <!-- 输入框 -->
          <el-input v-if="field.type === 'input'" v-model="formData[field.prop]" :placeholder="field.placeholder"
            :disabled="field.disabled" :clearable="field.clearable !== false" v-bind="field.props" />

          <!-- 密码输入框 -->
          <el-input v-else-if="field.type === 'password'" v-model="formData[field.prop]" type="password"
            :placeholder="field.placeholder" :disabled="field.disabled" :show-password="true" v-bind="field.props" />

          <!-- 文本域 -->
          <el-input v-else-if="field.type === 'textarea'" v-model="formData[field.prop]" type="textarea"
            :placeholder="field.placeholder" :disabled="field.disabled" :rows="field.rows || 3" v-bind="field.props" />

          <!-- 数字输入框 -->
          <el-input-number v-else-if="field.type === 'number'" v-model="formData[field.prop]"
            :placeholder="field.placeholder" :disabled="field.disabled" :min="field.min" :max="field.max"
            :step="field.step" v-bind="field.props" />

          <!-- 选择器 -->
          <el-select v-else-if="field.type === 'select'" v-model="formData[field.prop]" :placeholder="field.placeholder"
            :disabled="field.disabled" :multiple="field.multiple" :clearable="field.clearable !== false"
            v-bind="field.props">
            <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value"
              :disabled="option.disabled" />
          </el-select>

          <!-- 单选框组 -->
          <el-radio-group v-else-if="field.type === 'radio'" v-model="formData[field.prop]" :disabled="field.disabled"
            v-bind="field.props">
            <el-radio v-for="option in field.options" :key="option.value" :value="option.value"
              :disabled="option.disabled">
              {{ option.label }}
            </el-radio>
          </el-radio-group>

          <!-- 复选框组 -->
          <el-checkbox-group v-else-if="field.type === 'checkbox'" v-model="formData[field.prop]"
            :disabled="field.disabled" v-bind="field.props">
            <el-checkbox v-for="option in field.options" :key="option.value" :value="option.value"
              :disabled="option.disabled">
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>

          <!-- 开关 -->
          <el-switch v-else-if="field.type === 'switch'" v-model="formData[field.prop]" :disabled="field.disabled"
            v-bind="field.props" />

          <!-- 日期选择器 -->
          <el-date-picker v-else-if="field.type === 'date'" v-model="formData[field.prop]"
            :type="field.dateType || 'date'" :placeholder="field.placeholder" :disabled="field.disabled"
            :format="field.format" :value-format="field.valueFormat" v-bind="field.props" />

          <!-- 时间选择器 -->
          <el-time-picker v-else-if="field.type === 'time'" v-model="formData[field.prop]"
            :placeholder="field.placeholder" :disabled="field.disabled" v-bind="field.props" />

          <!-- 颜色选择器 -->
          <el-color-picker v-else-if="field.type === 'color'" v-model="formData[field.prop]" :disabled="field.disabled"
            v-bind="field.props" />

          <!-- 滑块 -->
          <el-slider v-else-if="field.type === 'slider'" v-model="formData[field.prop]" :min="field.min || 0"
            :max="field.max || 100" :step="field.step || 1" :disabled="field.disabled" v-bind="field.props" />

          <!-- 评分 -->
          <el-rate v-else-if="field.type === 'rate'" v-model="formData[field.prop]" :disabled="field.disabled"
            v-bind="field.props" />

          <!-- 动态数组 -->
          <div v-else-if="field.type === 'array'" class="dynamic-array">
            <div v-for="(item, index) in formData[field.prop]" :key="index" class="array-item">
              <EnhancedForm v-model="formData[field.prop][index]" :fields="field.itemFields || []" :show-actions="false"
                :label-width="'100px'" class="nested-form" />
              <el-button type="danger" size="small" icon="Delete" @click="removeArrayItem(field.prop, index)"
                class="remove-btn">
                删除
              </el-button>
            </div>
            <el-button type="primary" size="small" icon="Plus" @click="addArrayItem(field.prop, field.defaultItem)">
              添加{{ field.label }}
            </el-button>
          </div>

          <!-- 嵌套对象 -->
          <div v-else-if="field.type === 'object'" class="nested-object">
            <EnhancedForm v-model="formData[field.prop]" :fields="field.objectFields || []" :show-actions="false"
              :label-width="'120px'" class="nested-form" />
          </div>

          <!-- 自定义插槽 -->
          <slot v-else-if="field.type === 'slot'" :name="field.slotName" :field="field" :value="formData[field.prop]"
            :setValue="(val) => (formData[field.prop] = val)" />
        </el-form-item>
      </template>

      <!-- 操作按钮 -->
      <el-form-item v-if="showActions" class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ submitText }}
        </el-button>
        <el-button @click="handleReset">{{ resetText }}</el-button>
        <el-button v-if="showCancel" @click="handleCancel">{{ cancelText }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export interface FormField {
  prop: string
  label: string
  type: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  clearable?: boolean
  rules?: any[]
  class?: string
  style?: any
  props?: any

  // 选择器相关
  options?: Array<{ label: string; value: any; disabled?: boolean }>
  multiple?: boolean

  // 数字输入框相关
  min?: number
  max?: number
  step?: number

  // 文本域相关
  rows?: number

  // 日期相关
  dateType?: string
  format?: string
  valueFormat?: string

  // 动态数组相关
  itemFields?: FormField[]
  defaultItem?: any

  // 嵌套对象相关
  objectFields?: FormField[]

  // 插槽相关
  slotName?: string
}

interface Props {
  modelValue: Record<string, any>
  fields: FormField[]
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  showActions?: boolean
  submitText?: string
  resetText?: string
  cancelText?: string
  showCancel?: boolean
  submitLoading?: boolean
  formProps?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '120px',
  labelPosition: 'right',
  size: 'default',
  disabled: false,
  showActions: true,
  submitText: '提交',
  resetText: '重置',
  cancelText: '取消',
  showCancel: false,
  submitLoading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'submit': [value: Record<string, any>]
  'reset': []
  'cancel': []
}>()

const formRef = ref()

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRules = computed(() => {
  const rules: Record<string, any> = {}
  props.fields.forEach(field => {
    if (field.rules) {
      rules[field.prop] = field.rules
    } else if (field.required) {
      rules[field.prop] = [
        { required: true, message: `请输入${field.label}`, trigger: 'blur' }
      ]
    }
  })
  return rules
})

const addArrayItem = (prop: string, defaultItem: any) => {
  if (!formData.value[prop]) {
    formData.value[prop] = []
  }
  formData.value[prop].push(JSON.parse(JSON.stringify(defaultItem || {})))
}

const removeArrayItem = (prop: string, index: number) => {
  formData.value[prop].splice(index, 1)
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    emit('submit', formData.value)
  } catch (error) {
    ElMessage.error('表单验证失败')
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  emit('reset')
}

const handleCancel = () => {
  emit('cancel')
}

const validate = () => {
  return formRef.value?.validate()
}

const validateField = (prop: string) => {
  return formRef.value?.validateField(prop)
}

const resetFields = () => {
  formRef.value?.resetFields()
}

const clearValidate = (props?: string | string[]) => {
  formRef.value?.clearValidate(props)
}

defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate
})
</script>

<style scoped>
.enhanced-form {
  width: 100%;
}

.form-group {
  margin: 20px 0;
}

.form-group-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px 0;
}

.dynamic-array {
  width: 100%;
}

.array-item {
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fafafa;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.nested-form {
  margin-bottom: 0;
}

.nested-object {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
}

.form-actions {
  margin-top: 24px;
  text-align: center;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.nested-form .el-form-item) {
  margin-bottom: 16px;
}

:deep(.nested-form .el-form-item:last-child) {
  margin-bottom: 0;
}
</style>