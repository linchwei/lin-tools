<template>
  <div class="bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden">
    <!-- 头部 -->
    <div class="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-8 border-b border-gray-200/60">
      <h3 class="text-3xl font-bold text-gray-800 mb-3 flex items-center gap-3">
        🧮 大数据计算演示
      </h3>
      <p class="text-gray-600 text-lg">使用Web Worker进行大数据计算，不阻塞UI线程</p>
    </div>

    <!-- 控制面板 -->
    <div class="p-8 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- 数据量控制 -->
        <div class="control-group">
          <label class="block text-sm font-semibold text-gray-700 mb-3">数据量：</label>
          <el-slider :model-value="computationSize"
            @update:model-value="eventHandlers['update:computationSize']?.($event)" :min="100000" :max="10000000"
            :step="100000" show-input class="mb-3" />
          <span class="text-sm text-gray-600 font-medium">
            {{ formatNumber(computationSize) }} 个数据点
          </span>
        </div>

        <!-- 算法选择 -->
        <div class="control-group">
          <label class="block text-sm font-semibold text-gray-700 mb-3">计算算法：</label>
          <el-select :model-value="algorithm" @update:model-value="eventHandlers['update:algorithm']?.($event)"
            class="w-full">
            <el-option label="质数计算" value="prime" />
            <el-option label="斐波那契数列" value="fibonacci" />
            <el-option label="矩阵乘法" value="matrix" />
            <el-option label="排序算法" value="sort" />
          </el-select>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-wrap gap-4 justify-center">
        <el-button type="primary" size="large" @click="startMainThreadComputation" :loading="mainThreadRunning"
          class="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          主线程计算
        </el-button>
        <el-button type="success" size="large" @click="startWorkerComputation" :loading="workerRunning"
          class="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          Worker计算
        </el-button>
        <el-button size="large" @click="clearResults"
          class="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          清除结果
        </el-button>
      </div>
    </div>

    <!-- 性能对比 -->
    <div class="p-8">
      <h4 class="text-2xl font-bold text-gray-800 mb-6 text-center">⚡ 性能对比</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- 主线程结果 -->
        <div class="result-card main-thread">
          <h5 class="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
            🔴 主线程
          </h5>
          <div class="space-y-3">
            <div class="metric">
              <span class="label">执行时间：</span>
              <span class="value">{{ mainThreadTime }}ms</span>
            </div>
            <div class="metric">
              <span class="label">UI阻塞：</span>
              <span class="value blocked">是</span>
            </div>
            <div class="metric">
              <span class="label">结果：</span>
              <span class="value">{{ mainThreadResult }}</span>
            </div>
          </div>
        </div>

        <!-- Worker结果 -->
        <div class="result-card worker-thread">
          <h5 class="text-xl font-semibold text-green-600 mb-4 flex items-center gap-2">
            🟢 Worker线程
          </h5>
          <div class="space-y-3">
            <div class="metric">
              <span class="label">执行时间：</span>
              <span class="value">{{ workerTime }}ms</span>
            </div>
            <div class="metric">
              <span class="label">UI阻塞：</span>
              <span class="value smooth">否</span>
            </div>
            <div class="metric">
              <span class="label">结果：</span>
              <span class="value">{{ workerResult }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- UI响应性测试 -->
    <div class="p-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-gray-200/60">
      <h4 class="text-xl font-bold text-gray-800 mb-4">🎯 UI响应性测试</h4>
      <p class="text-gray-600 mb-6">在计算过程中，尝试与下面的元素交互：</p>

      <div class="flex flex-wrap items-center gap-6 justify-center">
        <el-button @click="testClick" size="large" class="px-6 py-3 rounded-xl">
          点击测试
        </el-button>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600">滑块测试：</span>
          <el-slider :model-value="testSlider" @update:model-value="eventHandlers['update:testSlider']?.($event)"
            class="w-32" />
        </div>
        <div class="rotating-element" :class="{ paused: isPaused }">
          🔄
        </div>
      </div>

      <p class="text-center mt-4 text-lg font-semibold text-blue-600">
        点击次数: {{ clickCount }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { ElButton, ElSlider, ElSelect, ElOption } from 'element-plus'

// Props
interface Props {
  computationSize: number
  algorithm: string
  mainThreadRunning: boolean
  workerRunning: boolean
  mainThreadTime: number
  workerTime: number
  mainThreadResult: string
  workerResult: string
  testSlider: number
  clickCount: number
  isPaused: boolean
}

const props = withDefaults(defineProps<Props>(), {
  computationSize: 1000000,
  algorithm: 'prime',
  mainThreadRunning: false,
  workerRunning: false,
  mainThreadTime: 0,
  workerTime: 0,
  mainThreadResult: '',
  workerResult: '',
  testSlider: 50,
  clickCount: 0,
  isPaused: false
})

// Emits
const emit = defineEmits([
  'update:computationSize',
  'update:algorithm',
  'update:testSlider',
  'startMainThread',
  'startWorker',
  'clearResults',
  'testClick'
])

// 注入事件处理器
const eventHandlers = inject('eventHandlers', {}) as Record<string, Function>

// 直接使用props，不需要本地响应式数据

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num)
}

const startMainThreadComputation = () => eventHandlers['startMainThread']?.()
const startWorkerComputation = () => eventHandlers['startWorker']?.()
const clearResults = () => eventHandlers['clearResults']?.()
const testClick = () => eventHandlers['testClick']?.()
</script>

<style lang="scss" scoped>
.control-group {
  margin-bottom: 1rem;
}

.result-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 2px solid;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  &.main-thread {
    border-color: #fecaca;

    &:hover {
      border-color: #fca5a5;
    }
  }

  &.worker-thread {
    border-color: #bbf7d0;

    &:hover {
      border-color: #86efac;
    }
  }
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .label {
    color: #4b5563;
    font-weight: 500;
  }

  .value {
    font-weight: 700;
    color: #1f2937;

    &.blocked {
      color: #dc2626;
    }

    &.smooth {
      color: #16a34a;
    }
  }
}

.rotating-element {
  font-size: 1.5rem;
  animation: spin 1s linear infinite;

  &.paused {
    animation-play-state: paused;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .flex {
    flex-direction: column;
    align-items: center;
  }
}
</style>
