<template>
  <div class="smart-field-preview">
    <div class="field-label">
      {{ field.label }}
      <span v-if="field.required" class="required">*</span>
    </div>

    <div class="field-input">
      <el-input v-if="field.type === 'text'" :placeholder="field.placeholder" disabled />
      <el-input v-else-if="field.type === 'textarea'" type="textarea" :placeholder="field.placeholder" disabled />
      <el-input-number v-else-if="field.type === 'number'" disabled />
      <el-select v-else-if="field.type === 'select'" :placeholder="field.placeholder" disabled>
        <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value" />
      </el-select>
      <el-radio-group v-else-if="field.type === 'radio'" disabled>
        <el-radio v-for="option in field.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </el-radio>
      </el-radio-group>
      <el-checkbox-group v-else-if="field.type === 'checkbox'" disabled>
        <el-checkbox v-for="option in field.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </el-checkbox>
      </el-checkbox-group>
      <el-date-picker v-else-if="field.type === 'date'" disabled />
      <el-time-picker v-else-if="field.type === 'time'" disabled />
      <el-upload v-else-if="field.type === 'file'" disabled>
        <el-button>选择文件</el-button>
      </el-upload>
      <el-input v-else :placeholder="field.placeholder" disabled />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SmartField } from './types'

interface Props {
  field: SmartField
}

defineProps<Props>()
</script>

<style scoped>
.smart-field-preview {
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f5f7fa;
}

.field-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.required {
  color: #f56c6c;
}

.field-input {
  pointer-events: none;
}
</style>