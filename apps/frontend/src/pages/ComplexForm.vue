<template>
  <div class="complex-form-container min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">📋 复杂表单演示</h1>
        <p class="text-gray-600">展示动态表单、嵌套数据结构、条件显示等高级功能</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：表单区域 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">项目配置表单</h2>
              <div class="space-x-2">
                <el-button @click="loadTemplate" size="small">加载模板</el-button>
                <el-button @click="exportConfig" size="small" type="info">导出配置</el-button>
                <el-button @click="importConfig" size="small" type="warning">导入配置</el-button>
              </div>
            </div>

            <EnhancedForm ref="formRef" v-model="formData" :fields="formFields" :submit-loading="submitLoading"
              @submit="handleSubmit" @reset="handleReset">
              <!-- 自定义插槽：代码编辑器 -->
              <template #codeEditor="{ value, setValue }">
                <div class="code-editor">
                  <el-input :model-value="value" @update:model-value="setValue" type="textarea" :rows="8"
                    placeholder="请输入JSON配置" class="code-input" />
                  <div class="code-actions">
                    <el-button size="small" @click="formatJson(value, setValue)">格式化</el-button>
                    <el-button size="small" @click="validateJson(value)">验证</el-button>
                  </div>
                </div>
              </template>

              <!-- 自定义插槽：文件上传 -->
              <template #fileUpload="{ value, setValue }">
                <div class="file-upload">
                  <el-upload :file-list="value || []" :on-change="(file, fileList) => setValue(fileList)"
                    :auto-upload="false" multiple drag>
                    <div class="upload-content">
                      <el-icon class="upload-icon">
                        <UploadFilled />
                      </el-icon>
                      <div class="upload-text">点击或拖拽文件到此处上传</div>
                    </div>
                  </el-upload>
                </div>
              </template>
            </EnhancedForm>
          </div>
        </div>

        <!-- 右侧：预览和配置 -->
        <div class="space-y-6">
          <!-- 表单预览 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4">实时预览</h3>
            <div class="preview-content">
              <pre
                class="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">{{ JSON.stringify(formData, null, 2) }}</pre>
            </div>
          </div>

          <!-- 表单统计 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4">表单统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ formFields.length }}</div>
                <div class="stat-label">表单字段</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getArrayFieldsCount() }}</div>
                <div class="stat-label">动态数组</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getNestedFieldsCount() }}</div>
                <div class="stat-label">嵌套对象</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getRequiredFieldsCount() }}</div>
                <div class="stat-label">必填字段</div>
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4">快速操作</h3>
            <div class="space-y-2">
              <el-button @click="addDeveloper" size="small" class="w-full">添加开发者</el-button>
              <el-button @click="addEnvironment" size="small" class="w-full">添加环境配置</el-button>
              <el-button @click="addDependency" size="small" class="w-full">添加依赖</el-button>
              <el-button @click="toggleAdvanced" size="small" class="w-full" type="info">
                {{ showAdvanced ? '隐藏' : '显示' }}高级选项
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入配置对话框 -->
    <el-dialog v-model="importDialog" title="导入配置" width="600px">
      <el-input v-model="importJson" type="textarea" :rows="10" placeholder="请粘贴JSON配置" />
      <template #footer>
        <el-button @click="importDialog = false">取消</el-button>
        <el-button type="primary" @click="doImportConfig">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import EnhancedForm, { type FormField } from '@/components/EnhancedForm/EnhancedForm.vue'

interface Dependency {
  name: string
  version: string
  type: 'dependencies' | 'devDependencies'
}

interface FormData {
  dependencies: Dependency[]
  // ... other properties
}

const formRef = ref()
const submitLoading = ref(false)
const showAdvanced = ref(false)
const importDialog = ref(false)
const importJson = ref('')

// 表单数据
const formData = ref({
  // 基本信息
  projectName: '',
  projectType: 'web',
  description: '',
  version: '1.0.0',

  // 项目配置
  config: {
    port: 3000,
    host: 'localhost',
    debug: true,
    ssl: false
  },

  // 开发团队
  developers: [
    {
      name: '',
      role: 'developer',
      email: '',
      skills: []
    }
  ],

  // 环境配置
  environments: [
    {
      name: 'development',
      url: '',
      database: {
        host: '',
        port: 5432,
        name: '',
        ssl: false
      },
      variables: {}
    }
  ],

  // 依赖管理
  dependencies: [],

  // 高级配置
  advanced: {
    buildTool: 'vite',
    testFramework: 'vitest',
    linter: 'eslint',
    formatter: 'prettier',
    customConfig: '{}',
    files: []
  }
})

// 动态表单字段配置
const formFields = computed<FormField[]>(() => [
  // 基本信息分组
  {
    type: 'group',
    prop: 'basic',
    label: '📋 基本信息'
  },
  {
    prop: 'projectName',
    label: '项目名称',
    type: 'input',
    required: true,
    placeholder: '请输入项目名称',
    rules: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
  },
  {
    prop: 'projectType',
    label: '项目类型',
    type: 'select',
    required: true,
    options: [
      { label: 'Web应用', value: 'web' },
      { label: '移动应用', value: 'mobile' },
      { label: '桌面应用', value: 'desktop' },
      { label: 'API服务', value: 'api' },
      { label: '微服务', value: 'microservice' }
    ]
  },
  {
    prop: 'description',
    label: '项目描述',
    type: 'textarea',
    placeholder: '请输入项目描述',
    rows: 3
  },
  {
    prop: 'version',
    label: '版本号',
    type: 'input',
    placeholder: '如：1.0.0'
  },

  // 项目配置分组
  {
    type: 'group',
    prop: 'configGroup',
    label: '⚙️ 项目配置'
  },
  {
    prop: 'config',
    label: '基础配置',
    type: 'object',
    objectFields: [
      {
        prop: 'port',
        label: '端口',
        type: 'number',
        min: 1000,
        max: 65535
      },
      {
        prop: 'host',
        label: '主机',
        type: 'input',
        placeholder: 'localhost'
      },
      {
        prop: 'debug',
        label: '调试模式',
        type: 'switch'
      },
      {
        prop: 'ssl',
        label: 'SSL支持',
        type: 'switch'
      }
    ]
  },

  // 开发团队分组
  {
    type: 'group',
    prop: 'teamGroup',
    label: '👥 开发团队'
  },
  {
    prop: 'developers',
    label: '开发者',
    type: 'array',
    itemFields: [
      {
        prop: 'name',
        label: '姓名',
        type: 'input',
        required: true,
        placeholder: '请输入姓名'
      },
      {
        prop: 'role',
        label: '角色',
        type: 'select',
        options: [
          { label: '前端开发', value: 'frontend' },
          { label: '后端开发', value: 'backend' },
          { label: '全栈开发', value: 'fullstack' },
          { label: '测试工程师', value: 'tester' },
          { label: '产品经理', value: 'pm' },
          { label: '设计师', value: 'designer' }
        ]
      },
      {
        prop: 'email',
        label: '邮箱',
        type: 'input',
        placeholder: '请输入邮箱',
        rules: [
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ]
      },
      {
        prop: 'skills',
        label: '技能',
        type: 'checkbox',
        options: [
          { label: 'Vue.js', value: 'vue' },
          { label: 'React', value: 'react' },
          { label: 'Node.js', value: 'nodejs' },
          { label: 'Python', value: 'python' },
          { label: 'Java', value: 'java' },
          { label: 'Go', value: 'go' },
          { label: 'Docker', value: 'docker' },
          { label: 'Kubernetes', value: 'k8s' }
        ]
      }
    ],
    defaultItem: {
      name: '',
      role: 'developer',
      email: '',
      skills: []
    }
  },

  // 环境配置分组
  {
    type: 'group',
    prop: 'envGroup',
    label: '🌍 环境配置'
  },
  {
    prop: 'environments',
    label: '环境',
    type: 'array',
    itemFields: [
      {
        prop: 'name',
        label: '环境名称',
        type: 'input',
        required: true,
        placeholder: '如：development, production'
      },
      {
        prop: 'url',
        label: '访问地址',
        type: 'input',
        placeholder: 'https://example.com'
      },
      {
        prop: 'database',
        label: '数据库配置',
        type: 'object',
        objectFields: [
          {
            prop: 'host',
            label: '主机',
            type: 'input',
            placeholder: 'localhost'
          },
          {
            prop: 'port',
            label: '端口',
            type: 'number',
            min: 1,
            max: 65535
          },
          {
            prop: 'name',
            label: '数据库名',
            type: 'input',
            placeholder: '数据库名称'
          },
          {
            prop: 'ssl',
            label: 'SSL连接',
            type: 'switch'
          }
        ]
      }
    ],
    defaultItem: {
      name: '',
      url: '',
      database: {
        host: 'localhost',
        port: 5432,
        name: '',
        ssl: false
      }
    }
  },

  // 依赖管理分组
  {
    type: 'group',
    prop: 'depsGroup',
    label: '📦 依赖管理'
  },
  {
    prop: 'dependencies',
    label: '项目依赖',
    type: 'array',
    itemFields: [
      {
        prop: 'name',
        label: '包名',
        type: 'input',
        required: true,
        placeholder: '如：vue, react, express'
      },
      {
        prop: 'version',
        label: '版本',
        type: 'input',
        placeholder: '如：^3.0.0, latest'
      },
      {
        prop: 'type',
        label: '依赖类型',
        type: 'radio',
        options: [
          { label: '生产依赖', value: 'dependencies' },
          { label: '开发依赖', value: 'devDependencies' }
        ]
      }
    ],
    defaultItem: {
      name: '',
      version: 'latest',
      type: 'dependencies'
    }
  },

  // 高级配置分组（条件显示）
  ...(showAdvanced.value ? [
    {
      type: 'group',
      prop: 'advancedGroup',
      label: '🔧 高级配置'
    },
    {
      prop: 'advanced.buildTool',
      label: '构建工具',
      type: 'select',
      options: [
        { label: 'Vite', value: 'vite' },
        { label: 'Webpack', value: 'webpack' },
        { label: 'Rollup', value: 'rollup' },
        { label: 'Parcel', value: 'parcel' }
      ]
    },
    {
      prop: 'advanced.testFramework',
      label: '测试框架',
      type: 'select',
      options: [
        { label: 'Vitest', value: 'vitest' },
        { label: 'Jest', value: 'jest' },
        { label: 'Mocha', value: 'mocha' },
        { label: 'Cypress', value: 'cypress' }
      ]
    },
    {
      prop: 'advanced.linter',
      label: '代码检查',
      type: 'checkbox',
      options: [
        { label: 'ESLint', value: 'eslint' },
        { label: 'Prettier', value: 'prettier' },
        { label: 'Stylelint', value: 'stylelint' }
      ]
    },
    {
      prop: 'advanced.customConfig',
      label: '自定义配置',
      type: 'slot',
      slotName: 'codeEditor'
    },
    {
      prop: 'advanced.files',
      label: '配置文件',
      type: 'slot',
      slotName: 'fileUpload'
    }
  ] as FormField[] : [])
])

// 统计方法
const getArrayFieldsCount = () => {
  return formFields.value.filter(field => field.type === 'array').length
}

const getNestedFieldsCount = () => {
  return formFields.value.filter(field => field.type === 'object').length
}

const getRequiredFieldsCount = () => {
  return formFields.value.filter(field => field.required).length
}

// 表单操作方法
const handleSubmit = async (data: any) => {
  submitLoading.value = true
  try {
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('项目配置保存成功！')
    console.log('提交的数据:', data)
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

const handleReset = () => {
  ElMessageBox.confirm('确定要重置表单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 重置为初始值
    Object.assign(formData.value, {
      projectName: '',
      projectType: 'web',
      description: '',
      version: '1.0.0',
      config: {
        port: 3000,
        host: 'localhost',
        debug: true,
        ssl: false
      },
      developers: [{
        name: '',
        role: 'developer',
        email: '',
        skills: []
      }],
      environments: [{
        name: 'development',
        url: '',
        database: {
          host: '',
          port: 5432,
          name: '',
          ssl: false
        }
      }],
      dependencies: [],
      advanced: {
        buildTool: 'vite',
        testFramework: 'vitest',
        linter: 'eslint',
        formatter: 'prettier',
        customConfig: '{}',
        files: []
      }
    })
    ElMessage.success('表单已重置')
  })
}

// 快速操作方法
const addDeveloper = () => {
  formData.value.developers.push({
    name: '',
    role: 'developer',
    email: '',
    skills: []
  })
}

const addEnvironment = () => {
  formData.value.environments.push({
    name: '',
    url: '',
    database: {
      host: 'localhost',
      port: 5432,
      name: '',
      ssl: false
    },
    variables: {}
  })
}

const addDependency = () => {
  (formData.value.dependencies as any[]).push({
    name: '',
    version: 'latest',
    type: 'dependencies'
  })
}

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

// 配置导入导出
const exportConfig = () => {
  const config = JSON.stringify(formData.value, null, 2)
  const blob = new Blob([config], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `project-config-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('配置已导出')
}

const importConfig = () => {
  importDialog.value = true
}

const doImportConfig = () => {
  try {
    const config = JSON.parse(importJson.value)
    Object.assign(formData.value, config)
    importDialog.value = false
    importJson.value = ''
    ElMessage.success('配置导入成功')
  } catch (error) {
    ElMessage.error('JSON格式错误，请检查后重试')
  }
}

const loadTemplate = () => {
  const template = {
    projectName: 'Vue3 Admin Dashboard',
    projectType: 'web',
    description: '基于Vue3 + TypeScript + Element Plus的后台管理系统',
    version: '1.0.0',
    config: {
      port: 8080,
      host: '0.0.0.0',
      debug: true,
      ssl: false
    },
    developers: [
      {
        name: '张三',
        role: 'frontend',
        email: 'zhangsan@example.com',
        skills: ['vue', 'nodejs', 'docker']
      },
      {
        name: '李四',
        role: 'backend',
        email: 'lisi@example.com',
        skills: ['nodejs', 'python', 'docker', 'k8s']
      }
    ],
    environments: [
      {
        name: 'development',
        url: 'http://localhost:8080',
        database: {
          host: 'localhost',
          port: 5432,
          name: 'dev_db',
          ssl: false
        }
      },
      {
        name: 'production',
        url: 'https://admin.example.com',
        database: {
          host: 'prod-db.example.com',
          port: 5432,
          name: 'prod_db',
          ssl: true
        }
      }
    ],
    dependencies: [
      { name: 'vue', version: '^3.3.0', type: 'dependencies' },
      { name: 'element-plus', version: '^2.4.0', type: 'dependencies' },
      { name: 'typescript', version: '^5.0.0', type: 'devDependencies' },
      { name: 'vite', version: '^4.4.0', type: 'devDependencies' }
    ],
    advanced: {
      buildTool: 'vite',
      testFramework: 'vitest',
      linter: ['eslint', 'prettier'],
      customConfig: JSON.stringify({
        "compilerOptions": {
          "target": "ES2020",
          "useDefineForClassFields": true,
          "lib": ["ES2020", "DOM", "DOM.Iterable"],
          "module": "ESNext"
        }
      }, null, 2),
      files: []
    }
  }

  Object.assign(formData.value, template)
  ElMessage.success('模板加载成功')
}

// JSON工具方法
const formatJson = (value: string, setValue: (val: string) => void) => {
  try {
    const parsed = JSON.parse(value)
    setValue(JSON.stringify(parsed, null, 2))
    ElMessage.success('JSON格式化成功')
  } catch (error) {
    ElMessage.error('JSON格式错误')
  }
}

const validateJson = (value: string) => {
  try {
    JSON.parse(value)
    ElMessage.success('JSON格式正确')
  } catch (error) {
    ElMessage.error('JSON格式错误')
  }
}
</script>

<style scoped>
.complex-form-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.code-editor {
  position: relative;
}

.code-input {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.code-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.file-upload {
  width: 100%;
}

.upload-content {
  text-align: center;
  padding: 40px 0;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
}

.preview-content {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.el-upload-dragger) {
  width: 100%;
}
</style>
