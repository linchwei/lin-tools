import { ref, reactive, watch } from 'vue'
import type { SmartFormSchema } from '../types'
import { ConditionalEngine } from '../engines/ConditionalEngine'
import { ValidationEngine } from '../engines/ValidationEngine'
import { AIEngine } from '../engines/AIEngine'

/**
 * 智能表单引擎核心组合式函数
 * 整合条件逻辑、验证、AI等多个引擎
 */
export function useSmartFormEngine(initialSchema?: SmartFormSchema) {
  // 表单结构
  const formSchema = ref<SmartFormSchema>(initialSchema || {
    id: 'default-form',
    version: '1.0.0',
    title: '智能表单',
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
  })

  // 表单数据
  const formData = ref<Record<string, any>>({})

  // 初始化各个引擎
  const conditionalEngine = new ConditionalEngine()
  const validationEngine = new ValidationEngine()
  const aiEngine = new AIEngine()

  // 表单状态
  const formState = reactive({
    isValid: false,
    isDirty: false,
    isSubmitting: false,
    errors: {} as Record<string, string[]>,
    touched: {} as Record<string, boolean>
  })

  // 监听表单结构变化，更新条件规则
  watch(() => formSchema.value.conditions, (newConditions) => {
    if (newConditions) {
      conditionalEngine.setRules(newConditions)
    }
  }, { immediate: true, deep: true })

  // 监听表单结构变化，更新验证规则
  watch(() => formSchema.value.rules, (newRules) => {
    if (newRules) {
      validationEngine.setRules(newRules)
    }
  }, { immediate: true, deep: true })

  // 初始化表单字段
  watch(() => formSchema.value.fields, (newFields) => {
    if (newFields) {
      // 初始化表单数据
      const initialData: Record<string, any> = {}
      newFields.forEach(field => {
        initialData[field.name] = field.defaultValue || null
      })
      formData.value = { ...formData.value, ...initialData }
    }
  }, { immediate: true, deep: true })

  // 验证表单
  const validateForm = async () => {
    if (!formSchema.value.fields) return false

    const errors: Record<string, string[]> = {}
    let isValid = true

    for (const field of formSchema.value.fields) {
      const fieldErrors = await validationEngine.validateField(
        field.name,
        formData.value[field.name],
        formData.value
      )

      if (fieldErrors.length > 0) {
        errors[field.name] = fieldErrors
        isValid = false
      }
    }

    formState.errors = errors
    formState.isValid = isValid

    return isValid
  }

  // 重置表单
  const resetForm = () => {
    const initialData: Record<string, any> = {}
    formSchema.value.fields?.forEach(field => {
      initialData[field.name] = field.defaultValue || null
    })
    formData.value = initialData
    formState.errors = {}
    formState.touched = {}
    formState.isDirty = false
  }

  // 提交表单
  const submitForm = async () => {
    formState.isSubmitting = true
    const isValid = await validateForm()
    
    if (isValid) {
      // 表单提交成功
      const result = { ...formData.value }
      formState.isSubmitting = false
      return result
    } else {
      // 表单验证失败
      formState.isSubmitting = false
      return null
    }
  }

  // 获取字段值
  const getFieldValue = (fieldName: string) => {
    return formData.value[fieldName]
  }

  // 设置字段值
  const setFieldValue = (fieldName: string, value: any) => {
    formData.value[fieldName] = value
    formState.touched[fieldName] = true
    formState.isDirty = true
    
    // 触发条件规则
    conditionalEngine.evaluate(fieldName, value, formData.value)
  }

  // 获取字段错误
  const getFieldErrors = (fieldName: string) => {
    return formState.errors[fieldName] || []
  }

  return {
    formSchema,
    formData,
    formState,
    conditionalEngine,
    validationEngine,
    aiEngine,
    validateForm,
    resetForm,
    submitForm,
    getFieldValue,
    setFieldValue,
    getFieldErrors
  }
}