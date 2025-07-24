<template>
  <div class="smart-form-renderer">
    <el-form :model="formData" :rules="formRules" ref="formRef">
      <div v-for="field in visibleFields" :key="field.id" class="form-field">
        <el-form-item :label="field.label" :prop="field.name">
          <!-- 文本输入框 -->
          <el-input v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel'"
            v-model="formData[field.name]"
            :type="field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'"
            :placeholder="field.placeholder" @change="handleFieldChange(field.name, $event)" />

          <!-- 文本域 -->
          <el-input v-else-if="field.type === 'textarea'" v-model="formData[field.name]" type="textarea"
            :placeholder="field.placeholder" :rows="4" @change="handleFieldChange(field.name, $event)" />

          <!-- 选择框 -->
          <el-select v-else-if="field.type === 'select'" v-model="formData[field.name]" :placeholder="field.placeholder"
            style="width: 100%" @change="handleFieldChange(field.name, $event)">
            <el-option v-for="option in field.options" :key="option.value" :label="option.label"
              :value="option.value" />
          </el-select>

          <!-- 评分 -->
          <el-rate v-else-if="field.type === 'rate'" v-model="formData[field.name]"
            @change="handleFieldChange(field.name, $event)" />

          <!-- 数字输入框 -->
          <el-input-number v-else-if="field.type === 'number'" v-model="formData[field.name]"
            :placeholder="field.placeholder" style="width: 100%" @change="handleFieldChange(field.name, $event)" />

          <!-- 默认文本输入框 -->
          <el-input v-else v-model="formData[field.name]" :placeholder="field.placeholder"
            @change="handleFieldChange(field.name, $event)" />
        </el-form-item>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SmartFormSchema } from './types'

interface Props {
  schema: SmartFormSchema
  modelValue: Record<string, any>
  aiEnabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'submit': [data: any]
  'field-change': [field: string, value: any]
}>()

const formRef = ref()
const formData = ref<Record<string, any>>({})

// 监听 modelValue 变化，同步到内部 formData
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...newValue }
}, { immediate: true, deep: true })

// 监听 formData 变化，同步到父组件
watch(formData, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

const visibleFields = computed(() => {
  return props.schema.fields || []
})

const formRules = computed(() => {
  const rules: Record<string, any> = {}
  props.schema.fields?.forEach(field => {
    if (field.required) {
      rules[field.name] = [
        { required: true, message: `请输入${field.label}`, trigger: 'blur' }
      ]
    }
  })
  return rules
})

const handleFieldChange = (field: string, value: any) => {
  emit('field-change', field, value)
}

const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      emit('submit', formData.value)
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.smart-form-renderer {
  max-width: 600px;
  margin: 0 auto;
}

.form-field {
  margin-bottom: 20px;
}

.form-actions {
  text-align: center;
  margin-top: 30px;
}

.form-actions .el-button {
  margin: 0 10px;
}
</style>
