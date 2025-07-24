<template>
  <div class="user-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" @submit.prevent>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入电话" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态">
          <el-option label="禁用" :value="0" />
          <el-option label="正常" :value="1" />
          <el-option label="待审核" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
interface Props {
  userData?: any
  userId?: number
}

const props = withDefaults(defineProps<Props>(), {
  userData: () => ({})
})

const emit = defineEmits<{
  'confirm': []
  'cancel': []
}>()

const formRef = ref()
const form = ref({
  name: '',
  email: '',
  phone: '',
  status: 1,
  remark: ''
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 初始化表单数据
onMounted(() => {
  if (props.userData && Object.keys(props.userData).length > 0) {
    Object.assign(form.value, props.userData)
  }
})

// 暴露验证方法给父组件
defineExpose({
  validate: () => formRef.value?.validate()
})
</script>

<style scoped>
.user-form {
  padding: 20px 0;
}
</style>