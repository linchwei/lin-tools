<template>
  <div class="field-property-editor">
    <h4>字段属性</h4>

    <el-form :model="field" label-width="80px" size="small">
      <el-form-item label="字段名">
        <el-input v-model="field.name" />
      </el-form-item>

      <el-form-item label="标签">
        <el-input v-model="field.label" />
      </el-form-item>

      <el-form-item label="类型">
        <el-select v-model="field.type" @change="onTypeChange">
          <el-option label="文本输入" value="text" />
          <el-option label="多行文本" value="textarea" />
          <el-option label="数字输入" value="number" />
          <el-option label="下拉选择" value="select" />
          <el-option label="单选" value="radio" />
          <el-option label="多选" value="checkbox" />
          <el-option label="日期" value="date" />
          <el-option label="文件上传" value="file" />
        </el-select>
      </el-form-item>

      <el-form-item label="必填">
        <el-switch v-model="field.required" />
      </el-form-item>

      <el-form-item label="占位符">
        <el-input v-model="field.placeholder" />
      </el-form-item>

      <!-- 选择类型字段的选项配置 -->
      <template v-if="['select', 'radio', 'checkbox'].includes(field.type)">
        <el-form-item label="选项">
          <div v-for="(option, index) in field.options" :key="index" class="option-item">
            <el-input v-model="option.label" placeholder="标签" />
            <el-input v-model="option.value" placeholder="值" />
            <el-button size="small" type="danger" @click="removeOption(index)">删除</el-button>
          </div>
          <el-button size="small" @click="addOption">添加选项</el-button>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { SmartField } from './types'

interface Props {
  modelValue: SmartField
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [field: SmartField]
  'update': []
}>()

const field = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('update')
  }
})

const onTypeChange = () => {
  // 根据类型初始化选项
  if (['select', 'radio', 'checkbox'].includes(field.value.type)) {
    if (!field.value.options) {
      field.value.options = [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ]
    }
  }
}

const addOption = () => {
  if (!field.value.options) field.value.options = []
  field.value.options.push({
    label: `选项${field.value.options.length + 1}`,
    value: `option${field.value.options.length + 1}`
  })
}

const removeOption = (index: number) => {
  field.value.options?.splice(index, 1)
}
</script>

<style scoped>
.field-property-editor {
  padding: 16px;
  border-left: 1px solid #e4e7ed;
  background: #fafafa;
}

.option-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
</style>