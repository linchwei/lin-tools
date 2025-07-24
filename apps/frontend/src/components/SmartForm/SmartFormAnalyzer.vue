<template>
  <div class="form-analyzer">
    <div class="analyzer-header">
      <h3>📊 表单智能分析</h3>
      <el-button @click="runAnalysis" :loading="analyzing">
        {{ analyzing ? '分析中...' : '开始分析' }}
      </el-button>
    </div>

    <div v-if="analytics" class="analytics-dashboard">
      <!-- 完成率分析 -->
      <div class="metric-card">
        <h4>完成率</h4>
        <div class="metric-value">{{ analytics.completionRate }}%</div>
        <div class="metric-chart">
          <canvas ref="completionChart"></canvas>
        </div>
      </div>

      <!-- 字段难度分析 -->
      <div class="metric-card">
        <h4>字段难度</h4>
        <div class="field-difficulty">
          <div v-for="field in analytics.fieldDifficulty" :key="field.name" class="difficulty-item">
            <span>{{ field.label }}</span>
            <div class="difficulty-bar">
              <div class="difficulty-fill" :style="{ width: field.difficulty + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI优化建议 -->
      <div class="suggestions-card">
        <h4>🤖 AI优化建议</h4>
        <div v-for="suggestion in analytics.suggestions" :key="suggestion.id" class="suggestion-item">
          <div class="suggestion-type">{{ suggestion.type }}</div>
          <div class="suggestion-desc">{{ suggestion.description }}</div>
          <el-button size="small" @click="applySuggestion(suggestion)">
            应用建议
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Chart } from 'chart.js/auto'
import type { FormAnalytics, OptimizationSuggestion } from './types'

const analyzing = ref(false)
const analytics = ref<FormAnalytics | null>(null)
const completionChart = ref<HTMLCanvasElement>()

const runAnalysis = async () => {
  analyzing.value = true

  // 模拟AI分析过程
  await new Promise(resolve => setTimeout(resolve, 2000))

  analytics.value = {
    completionRate: 78,
    averageTime: 120,
    fieldDifficulty: [
      { name: 'email', label: '邮箱', difficulty: 25, abandonRate: 5 },
      { name: 'phone', label: '电话', difficulty: 45, abandonRate: 12 },
      { name: 'address', label: '地址', difficulty: 80, abandonRate: 35 }
    ],
    suggestions: [
      {
        id: '1',
        type: 'field',
        priority: 'high',
        description: '地址字段可以拆分为省市区三个字段，提高填写成功率',
        impact: '预计提升完成率15%',
        implementation: {
          action: 'splitField',
          target: 'address',
          value: ['province', 'city', 'district']
        }
      },
      {
        id: '2',
        type: 'ux',
        priority: 'medium',
        description: '建议在邮箱字段添加格式提示，减少输入错误',
        impact: '预计减少错误率20%',
        implementation: {
          action: 'addHint',
          target: 'email',
          value: 'example@domain.com'
        }
      }
    ],
    userBehavior: {
      mostSkipped: ['address', 'phone'],
      mostCorrected: ['email', 'phone'],
      timeSpent: {
        email: 15,
        phone: 25,
        address: 60
      }
    }
  }

  analyzing.value = false

  // 绘制图表
  nextTick(() => {
    drawCompletionChart()
  })
}

const applySuggestion = (suggestion: OptimizationSuggestion) => {
  console.log('应用建议:', suggestion)
  // 这里实现建议应用逻辑
}

const drawCompletionChart = () => {
  if (!completionChart.value || !analytics.value) return

  new Chart(completionChart.value, {
    type: 'doughnut',
    data: {
      labels: ['已完成', '未完成'],
      datasets: [{
        data: [analytics.value.completionRate, 100 - analytics.value.completionRate],
        backgroundColor: ['#10B981', '#EF4444']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}
</script>
