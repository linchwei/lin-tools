<template>
  <div class="smart-form-ai" :class="{ 'ai-expanded': expanded }">
    <!-- AI助手头部 -->
    <div class="ai-header" @click="toggleExpanded">
      <div class="ai-avatar">
        <div class="ai-pulse"></div>
        🤖
      </div>
      <div class="ai-title">
        <h4>AI智能助手</h4>
        <span class="ai-status" :class="aiStatus">{{ getStatusText() }}</span>
      </div>
      <div class="ai-toggle">
        <el-icon :class="{ 'rotated': expanded }">
          <ArrowDown />
        </el-icon>
      </div>
    </div>

    <!-- AI助手内容 -->
    <div class="ai-content" v-show="expanded">
      <!-- 实时建议 -->
      <div class="ai-section" v-if="currentSuggestions.length > 0">
        <div class="section-header">
          <el-icon>
            💡
          </el-icon>
          <span>智能建议</span>
          <el-tag size="small" type="info">{{ currentSuggestions.length }}</el-tag>
        </div>
        <div class="suggestions-list">
          <div v-for="suggestion in currentSuggestions" :key="suggestion.id" class="suggestion-card"
            :class="suggestion.priority">
            <div class="suggestion-header">
              <div class="suggestion-type">{{ suggestion.type }}</div>
              <div class="suggestion-confidence">
                <el-progress :percentage="Math.round(suggestion.confidence * 100)" :stroke-width="4" :show-text="false"
                  :color="getConfidenceColor(suggestion.confidence)" />
                <span class="confidence-text">{{ Math.round(suggestion.confidence * 100) }}%</span>
              </div>
            </div>
            <p class="suggestion-text">{{ suggestion.text }}</p>
            <div class="suggestion-reasoning">
              <el-icon>
                <InfoFilled />
              </el-icon>
              <span>{{ suggestion.reasoning }}</span>
            </div>
            <div class="suggestion-actions">
              <el-button size="small" type="primary" @click="applySuggestion(suggestion)"
                :loading="suggestion.applying">
                应用建议
              </el-button>
              <el-button size="small" @click="dismissSuggestion(suggestion.id)">
                忽略
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 字段分析 -->
      <div class="ai-section" v-if="fieldAnalysis.length > 0">
        <div class="section-header">
          <el-icon>
            📊
          </el-icon>
          <span>字段分析</span>
        </div>
        <div class="analysis-list">
          <div v-for="analysis in fieldAnalysis" :key="analysis.fieldId" class="analysis-item">
            <div class="analysis-field">{{ analysis.fieldName }}</div>
            <div class="analysis-metrics">
              <div class="metric">
                <span class="metric-label">完成率</span>
                <span class="metric-value">{{ analysis.completionRate }}%</span>
              </div>
              <div class="metric">
                <span class="metric-label">错误率</span>
                <span class="metric-value">{{ analysis.errorRate }}%</span>
              </div>
            </div>
            <div class="analysis-suggestion" v-if="analysis.suggestion">
              <el-icon>
                <Warning />
              </el-icon>
              <span>{{ analysis.suggestion }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI聊天界面 -->
      <div class="ai-section">
        <div class="section-header">
          <el-icon>
            💬
          </el-icon>
          <span>AI对话</span>
        </div>
        <div class="chat-container">
          <div class="chat-messages" ref="chatMessages">
            <div v-for="message in chatMessages" :key="message.id" class="chat-message" :class="message.type">
              <div class="message-avatar">
                {{ message.type === 'user' ? '👤' : '🤖' }}
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.text }}</div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
          </div>
          <div class="chat-input">
            <el-input v-model="chatInput" placeholder="询问AI助手..." @keyup.enter="sendMessage" :disabled="chatLoading">
              <template #append>
                <el-button @click="sendMessage" :loading="chatLoading" type="primary">
                  发送
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- AI设置 -->
      <div class="ai-section">
        <div class="section-header">
          <el-icon>
            <Setting />
          </el-icon>
          <span>AI设置</span>
        </div>
        <div class="ai-settings">
          <div class="setting-item">
            <span>智能建议</span>
            <el-switch v-model="settings.suggestions" @change="updateSettings" />
          </div>
          <div class="setting-item">
            <span>自动完成</span>
            <el-switch v-model="settings.autoComplete" @change="updateSettings" />
          </div>
          <div class="setting-item">
            <span>实时验证</span>
            <el-switch v-model="settings.realTimeValidation" @change="updateSettings" />
          </div>
          <div class="setting-item">
            <span>学习模式</span>
            <el-switch v-model="settings.learningMode" @change="updateSettings" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  ArrowDown,
  InfoFilled,
  Warning,
  Setting
} from '@element-plus/icons-vue'
import type { SmartFormSchema } from './types'
import { AIEngine } from './engines/AIEngine'

interface Props {
  schema: SmartFormSchema
  formData: Record<string, any>
}

interface AISuggestion {
  id: string
  type: string
  text: string
  reasoning: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
  applying?: boolean
}

interface FieldAnalysis {
  fieldId: string
  fieldName: string
  completionRate: number
  errorRate: number
  suggestion?: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  text: string
  timestamp: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'suggestion': [suggestion: any]
  'optimize': [optimization: any]
  'field-focus': [fieldId: string]
}>()

// AI引擎实例
const aiEngine = new AIEngine()

// 响应式数据
const expanded = ref(false)
const aiStatus = ref<'idle' | 'thinking' | 'active'>('idle')
const chatMessages = ref<ChatMessage[]>([
  {
    id: '1',
    type: 'ai',
    text: '你好！我是AI智能助手，可以帮助您优化表单设计和填写体验。有什么需要帮助的吗？',
    timestamp: Date.now()
  }
])
const chatInput = ref('')
const chatLoading = ref(false)
const chatMessages_ref = ref<HTMLElement>()

// AI建议
const currentSuggestions = ref<AISuggestion[]>([
  {
    id: '1',
    type: '字段优化',
    text: '建议为邮箱字段添加实时格式验证',
    reasoning: '基于用户输入模式分析，邮箱字段错误率较高',
    confidence: 0.85,
    priority: 'high'
  },
  {
    id: '2',
    type: '用户体验',
    text: '可以为手机号字段添加自动补全功能',
    reasoning: '检测到用户在手机号输入上有重复模式',
    confidence: 0.72,
    priority: 'medium'
  },
  {
    id: '3',
    type: '表单布局',
    text: '建议调整字段顺序以提高填写效率',
    reasoning: '基于用户行为分析，当前顺序可能不够直观',
    confidence: 0.68,
    priority: 'low'
  }
])

// 字段分析
const fieldAnalysis = ref<FieldAnalysis[]>([
  {
    fieldId: 'email',
    fieldName: '邮箱地址',
    completionRate: 85,
    errorRate: 15,
    suggestion: '建议添加邮箱格式提示'
  },
  {
    fieldId: 'phone',
    fieldName: '手机号码',
    completionRate: 92,
    errorRate: 8
  },
  {
    fieldId: 'company',
    fieldName: '公司名称',
    completionRate: 78,
    errorRate: 5,
    suggestion: '可以添加公司名称自动补全'
  }
])

// AI设置
const settings = ref({
  suggestions: true,
  autoComplete: true,
  realTimeValidation: true,
  learningMode: true
})

// 计算属性
const getStatusText = () => {
  switch (aiStatus.value) {
    case 'thinking':
      return '思考中...'
    case 'active':
      return '活跃'
    default:
      return '待机'
  }
}

// 方法
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return '#67c23a'
  if (confidence >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

const applySuggestion = async (suggestion: AISuggestion) => {
  suggestion.applying = true
  aiStatus.value = 'thinking'

  try {
    // 模拟应用建议的过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('suggestion', {
      type: suggestion.type,
      action: 'apply',
      data: suggestion
    })

    // 从建议列表中移除已应用的建议
    currentSuggestions.value = currentSuggestions.value.filter(s => s.id !== suggestion.id)

    // 添加成功消息到聊天
    addChatMessage('ai', `已成功应用建议：${suggestion.text}`)

  } catch (error) {
    addChatMessage('ai', '抱歉，应用建议时出现错误，请稍后重试。')
  } finally {
    suggestion.applying = false
    aiStatus.value = 'idle'
  }
}

const dismissSuggestion = (suggestionId: string) => {
  currentSuggestions.value = currentSuggestions.value.filter(s => s.id !== suggestionId)
  addChatMessage('ai', '已忽略该建议。如果需要，您可以随时询问我获取更多建议。')
}

const sendMessage = async () => {
  if (!chatInput.value.trim() || chatLoading.value) return

  const userMessage = chatInput.value.trim()
  chatInput.value = ''

  // 添加用户消息
  addChatMessage('user', userMessage)

  chatLoading.value = true
  aiStatus.value = 'thinking'

  try {
    // 模拟AI响应
    await new Promise(resolve => setTimeout(resolve, 1500))

    const aiResponse = await generateAIResponse(userMessage)
    addChatMessage('ai', aiResponse)

  } catch (error) {
    addChatMessage('ai', '抱歉，我现在无法回应。请稍后再试。')
  } finally {
    chatLoading.value = false
    aiStatus.value = 'idle'
  }
}

const addChatMessage = (type: 'user' | 'ai', text: string) => {
  chatMessages.value.push({
    id: Date.now().toString(),
    type,
    text,
    timestamp: Date.now()
  })

  // 滚动到底部
  nextTick(() => {
    if (chatMessages_ref.value) {
      chatMessages_ref.value.scrollTop = chatMessages_ref.value.scrollHeight
    }
  })
}

const generateAIResponse = async (userMessage: string): Promise<string> => {
  const message = userMessage.toLowerCase()

  if (message.includes('建议') || message.includes('优化')) {
    return '我建议您可以：1. 为必填字段添加明显的标识；2. 使用更直观的字段标签；3. 添加输入提示和验证反馈。需要我详细说明某个建议吗？'
  }

  if (message.includes('验证') || message.includes('校验')) {
    return '表单验证很重要！我建议使用实时验证，在用户输入时立即反馈。对于邮箱、手机号等字段，可以添加格式检查和存在性验证。'
  }

  if (message.includes('布局') || message.includes('设计')) {
    return '好的表单布局应该遵循从上到下、从左到右的阅读习惯。相关字段应该分组，重要字段放在显眼位置。您想了解具体的布局建议吗？'
  }

  if (message.includes('用户体验') || message.includes('体验')) {
    return '提升用户体验的关键是减少用户的认知负担。建议：1. 使用清晰的标签；2. 提供输入示例；3. 及时的错误提示；4. 合理的字段顺序。'
  }

  return '我理解您的问题。作为AI助手，我可以帮您分析表单结构、优化用户体验、提供字段建议等。您可以具体告诉我需要什么帮助吗？'
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const updateSettings = () => {
  // 更新AI设置
  emit('optimize', {
    type: 'settings',
    data: settings.value
  })
}

// 监听表单数据变化
watch(() => props.formData, (newData, oldData) => {
  if (settings.value.learningMode) {
    analyzeFormChanges(newData, oldData)
  }
}, { deep: true })

const analyzeFormChanges = (newData: Record<string, any>, oldData: Record<string, any>) => {
  if (!oldData) return

  // 分析字段变化并更新AI建议
  Object.keys(newData).forEach(key => {
    if (newData[key] !== oldData[key]) {
      aiEngine.analyzeFieldChange(key, newData[key], props.schema)

      // 可能生成新的建议
      if (Math.random() > 0.7) { // 30%概率生成新建议
        generateNewSuggestion(key, newData[key])
      }
    }
  })
}

const generateNewSuggestion = (fieldId: string, value: any) => {
  const suggestions = [
    {
      id: Date.now().toString(),
      type: '智能建议',
      text: `检测到您在${fieldId}字段的输入模式，建议添加自动补全功能`,
      reasoning: '基于您的输入行为分析',
      confidence: 0.75,
      priority: 'medium' as const
    }
  ]

  currentSuggestions.value.unshift(...suggestions)

  // 限制建议数量
  if (currentSuggestions.value.length > 5) {
    currentSuggestions.value = currentSuggestions.value.slice(0, 5)
  }
}
</script>

<style scoped>
/* AI助手容器 */
.smart-form-ai {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 380px;
  max-height: 80vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: all 0.3s ease;
  overflow: hidden;
}

.smart-form-ai.ai-expanded {
  width: 420px;
  max-height: 90vh;
}

/* AI助手头部 */
.ai-header {
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.ai-header:hover {
  background: rgba(255, 255, 255, 0.15);
}

.ai-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.ai-pulse {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #00f2fe;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

.ai-title {
  flex: 1;
}

.ai-title h4 {
  margin: 0 0 4px 0;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.ai-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.ai-status.idle {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
}

.ai-status.thinking {
  color: #ffa502;
  background: rgba(255, 165, 2, 0.2);
  animation: thinking 1.5s infinite;
}

.ai-status.active {
  color: #00f2fe;
  background: rgba(0, 242, 254, 0.2);
}

@keyframes thinking {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.ai-toggle {
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.3s ease;
}

.ai-toggle.rotated {
  transform: rotate(180deg);
}

/* AI助手内容 */
.ai-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 20px 20px;
}

.ai-content::-webkit-scrollbar {
  width: 6px;
}

.ai-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.ai-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* AI区域 */
.ai-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

/* 建议列表 */
.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.suggestion-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.suggestion-card.high {
  border-left: 4px solid #ff4757;
}

.suggestion-card.medium {
  border-left: 4px solid #ffa502;
}

.suggestion-card.low {
  border-left: 4px solid #2ed573;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.suggestion-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
}

.suggestion-confidence {
  display: flex;
  align-items: center;
  gap: 8px;
}

.confidence-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.suggestion-text {
  color: white;
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
}

.suggestion-reasoning {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-bottom: 12px;
}

.suggestion-actions {
  display: flex;
  gap: 8px;
}

/* 字段分析 */
.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-item {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.analysis-field {
  color: white;
  font-weight: 600;
  margin-bottom: 8px;
}

.analysis-metrics {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.analysis-suggestion {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  background: rgba(255, 165, 2, 0.2);
  padding: 8px;
  border-radius: 8px;
}

/* 聊天界面 */
.chat-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

.chat-messages {
  max-height: 300px;
  overflow-y: auto;
  padding: 16px;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 80%;
}

.chat-message.user .message-content {
  text-align: right;
}

.message-text {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 16px;
  color: white;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.chat-message.user .message-text {
  background: rgba(0, 242, 254, 0.3);
}

.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.chat-input {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* AI设置 */
.ai-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .smart-form-ai {
    right: 10px;
    width: 320px;
    max-height: 70vh;
  }

  .smart-form-ai.ai-expanded {
    width: 350px;
    max-height: 80vh;
  }

  .ai-header {
    padding: 16px;
  }

  .ai-content {
    padding: 0 16px 16px;
  }

  .suggestion-card,
  .analysis-item {
    padding: 12px;
  }

  .chat-messages {
    max-height: 200px;
  }
}

@media (max-width: 480px) {
  .smart-form-ai {
    right: 5px;
    width: 280px;
    max-height: 60vh;
  }

  .smart-form-ai.ai-expanded {
    width: 300px;
    max-height: 70vh;
  }

  .ai-avatar {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .ai-title h4 {
    font-size: 16px;
  }

  .suggestion-actions {
    flex-direction: column;
    gap: 6px;
  }

  .analysis-metrics {
    flex-direction: column;
    gap: 8px;
  }
}

/* 动画效果 */
.suggestion-card,
.analysis-item {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.chat-message {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>