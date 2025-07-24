<template>
  <div class="smart-form-demo">
    <!-- 页面头部 -->
    <div class="demo-header">
      <h1 class="demo-title">🧠 智能表单引擎</h1>
      <p class="demo-subtitle">
        基于AI驱动的智能表单系统，支持条件逻辑、智能验证、自动优化
      </p>

      <div class="demo-tabs">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="表单渲染" name="render">
            <el-icon>
              <Document />
            </el-icon>
          </el-tab-pane>
          <el-tab-pane label="表单设计" name="design">
            <el-icon>
              <Edit />
            </el-icon>
          </el-tab-pane>
          <el-tab-pane label="数据分析" name="analytics">
            <el-icon>
              <DataAnalysis />
            </el-icon>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 功能演示区域 -->
    <div class="demo-content">
      <!-- 表单渲染模式 -->
      <div v-if="activeTab === 'render'" class="render-demo">
        <div class="demo-controls">
          <el-space>
            <el-button @click="loadDemoSchema('user-registration')">
              用户注册表单
            </el-button>
            <el-button @click="loadDemoSchema('job-application')">
              求职申请表单
            </el-button>
            <el-button @click="loadDemoSchema('survey')">
              问卷调查表单
            </el-button>
            <el-switch v-model="aiEnabled" active-text="AI助手" inactive-text="关闭AI" />
          </el-space>
        </div>

        <div class="form-container">
          <SmartFormEngine :schema="currentSchema" mode="render" :ai-enabled="aiEnabled" @submit="handleFormSubmit"
            @schema-change="handleSchemaChange" />
        </div>

        <!-- 实时数据预览 -->
        <div class="data-preview">
          <h3>📊 实时数据</h3>
          <el-card>
            <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
          </el-card>
        </div>
      </div>

      <!-- 表单设计模式 -->
      <div v-if="activeTab === 'design'" class="design-demo">
        <div class="design-tips">
          <el-alert title="设计器功能" description="拖拽字段到画布、设置条件逻辑、配置AI功能" type="info" show-icon :closable="false" />
        </div>

        <SmartFormEngine :schema="currentSchema" mode="design" @schema-change="handleSchemaChange" />
      </div>

      <!-- 数据分析模式 -->
      <div v-if="activeTab === 'analytics'" class="analytics-demo">
        <SmartFormAnalyzer />

        <!-- AI优化建议 -->
        <div class="optimization-panel">
          <h3>🤖 AI优化建议</h3>
          <div class="suggestions-grid">
            <el-card v-for="suggestion in optimizationSuggestions" :key="suggestion.id">
              <template #header>
                <div class="suggestion-header">
                  <span class="suggestion-type">{{ suggestion.type }}</span>
                  <el-tag :type="suggestion.priority === 'high' ? 'danger' : 'warning'">
                    {{ suggestion.priority }}
                  </el-tag>
                </div>
              </template>
              <p>{{ suggestion.description }}</p>
              <div class="suggestion-impact">
                <el-icon>
                  <TrendCharts />
                </el-icon>
                {{ suggestion.impact }}
              </div>
              <el-button type="primary" size="small" @click="applySuggestion(suggestion)">
                应用建议
              </el-button>
            </el-card>
          </div>
        </div>
      </div>
    </div>

    <!-- 技术特性展示 -->
    <div class="features-showcase">
      <h2>✨ 核心特性</h2>
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🧠</div>
          <h3>智能条件引擎</h3>
          <p>支持复杂的逻辑表达式，动态显示/隐藏字段</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🤖</div>
          <h3>AI驱动优化</h3>
          <p>智能字段建议、自动验证、表单优化分析</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <h3>可视化设计器</h3>
          <p>拖拽式表单设计，所见即所得</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <h3>数据分析</h3>
          <p>表单使用情况分析，用户行为洞察</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <h3>高性能渲染</h3>
          <p>虚拟滚动、懒加载，支持大型表单</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔄</div>
          <h3>实时协作</h3>
          <p>多人同时编辑，实时同步更新</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Document, Edit, DataAnalysis, TrendCharts } from '@element-plus/icons-vue'
import SmartFormEngine from '@/components/SmartForm/SmartFormEngine.vue'
import SmartFormAnalyzer from '@/components/SmartForm/SmartFormAnalyzer.vue'
import type { SmartFormSchema, OptimizationSuggestion } from '@/components/SmartForm/types'

const activeTab = ref('render')
const aiEnabled = ref(true)
const formData = reactive({})

const currentSchema = ref<SmartFormSchema>({
  id: 'demo-form',
  version: '1.0.0',
  title: '用户注册表单',
  description: '智能表单引擎演示',
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

const optimizationSuggestions = ref<OptimizationSuggestion[]>([
  {
    id: '1',
    type: 'field',
    priority: 'high',
    description: '地址字段建议拆分为省市区，提高填写成功率',
    impact: '预计提升完成率15%',
    implementation: {
      action: 'splitField',
      target: 'address'
    }
  },
  {
    id: '2',
    type: 'ux',
    priority: 'medium',
    description: '邮箱字段添加实时格式验证',
    impact: '预计减少错误率20%',
    implementation: {
      action: 'addValidation',
      target: 'email'
    }
  }
])

// 加载演示表单模板
const loadDemoSchema = (type: string) => {
  const schemas = {
    'user-registration': {
      ...currentSchema.value,
      title: '用户注册表单',
      fields: [
        {
          id: 'username',
          name: 'username',
          type: 'text',
          label: '用户名',
          required: true,
          placeholder: '请输入用户名',
          aiSuggestions: true
        },
        {
          id: 'email',
          name: 'email',
          type: 'email',
          label: '邮箱地址',
          required: true,
          placeholder: '请输入邮箱地址',
          aiSuggestions: true
        },
        {
          id: 'phone',
          name: 'phone',
          type: 'tel',
          label: '手机号码',
          required: true,
          placeholder: '请输入手机号码'
        },
        {
          id: 'company',
          name: 'company',
          type: 'text',
          label: '公司名称',
          placeholder: '请输入公司名称',
          aiSuggestions: true
        }
      ]
    },
    'job-application': {
      ...currentSchema.value,
      title: '求职申请表单',
      fields: [
        {
          id: 'name',
          name: 'name',
          type: 'text',
          label: '姓名',
          required: true,
          placeholder: '请输入姓名'
        },
        {
          id: 'position',
          name: 'position',
          type: 'select',
          label: '应聘职位',
          required: true,
          placeholder: '请选择应聘职位',
          options: [
            { label: '前端工程师', value: 'frontend' },
            { label: '后端工程师', value: 'backend' },
            { label: '全栈工程师', value: 'fullstack' }
          ]
        },
        {
          id: 'experience',
          name: 'experience',
          type: 'number',
          label: '工作年限',
          required: true,
          placeholder: '请输入工作年限'
        }
      ]
    },
    'survey': {
      ...currentSchema.value,
      title: '用户满意度调查',
      fields: [
        {
          id: 'satisfaction',
          name: 'satisfaction',
          type: 'rate',
          label: '整体满意度',
          required: true
        },
        {
          id: 'feedback',
          name: 'feedback',
          type: 'textarea',
          label: '意见反馈',
          required: false,
          placeholder: '请输入您的意见和建议'
        }
      ]
    }
  }

  currentSchema.value = schemas[type] || schemas['user-registration']

  // 清空表单数据
  Object.keys(formData).forEach(key => {
    delete formData[key]
  })

  // 初始化表单数据
  currentSchema.value.fields?.forEach(field => {
    formData[field.name] = field.defaultValue || ''
  })
}

const handleTabChange = (tab: string | number) => {
  console.log('切换到标签页:', tab)
}

const handleFormSubmit = (data: any) => {
  console.log('表单提交:', data)
  Object.assign(formData, data)
  ElMessage.success('表单提交成功！')
}

const handleSchemaChange = (schema: SmartFormSchema) => {
  currentSchema.value = schema
  console.log('表单结构更新:', schema)
}

const handleFieldChange = (field: string, value: any) => {
  formData[field] = value
}

const applySuggestion = (suggestion: OptimizationSuggestion) => {
  console.log('应用优化建议:', suggestion)
  ElMessage.success(`已应用建议: ${suggestion.description}`)
}

onMounted(() => {
  loadDemoSchema('user-registration')
})
</script>

<style scoped>
.smart-form-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.demo-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.demo-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.demo-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 30px;
}

.demo-tabs {
  max-width: 600px;
  margin: 0 auto;
}

.demo-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-bottom: 40px;
}

.demo-controls {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-container {
  margin-bottom: 30px;
}

.data-preview {
  margin-top: 20px;
}

.data-preview h3 {
  margin-bottom: 10px;
  color: #333;
}

.features-showcase {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.features-showcase h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-impact {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 10px 0;
  color: #666;
}
</style>
