<template>
  <div class="code-sandbox-container p-6 h-full flex flex-col">
    <div class="header mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">代码执行沙箱</h1>
      <p class="text-gray-600">安全执行JavaScript/TypeScript代码，支持Web Worker隔离</p>
    </div>

    <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 代码编辑区 -->
      <div class="code-editor-panel">
        <div class="panel-header flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">代码编辑器</h2>
          <div class="controls flex items-center gap-3">
            <el-select v-model="language" size="small" style="width: 120px">
              <el-option label="JavaScript" value="javascript" />
              <el-option label="TypeScript" value="typescript" />
            </el-select>
            <el-button type="primary" @click="executeCode" :loading="isExecuting" size="small">
              <el-icon>
                <VideoCameraIcon />
              </el-icon>
              执行代码
            </el-button>
            <el-button @click="clearCode" size="small">清空</el-button>
          </div>
        </div>

        <div class="code-editor-wrapper">
          <textarea v-model="code" class="code-editor" placeholder="在这里输入你的代码..." spellcheck="false" />
        </div>

        <!-- 执行选项 -->
        <div class="execution-options mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-sm font-medium mb-3">执行选项</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">超时时间 (ms)</label>
              <el-input-number v-model="timeout" :min="1000" :max="10000" :step="1000" size="small" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">内存限制</label>
              <el-switch v-model="memoryLimit" size="small" />
            </div>
          </div>
        </div>
      </div>

      <!-- 执行结果区 -->
      <div class="result-panel">
        <div class="panel-header flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">执行结果</h2>
          <div class="result-status">
            <el-tag v-if="lastResult" :type="lastResult.success ? 'success' : 'danger'" size="small">
              {{ lastResult.success ? '执行成功' : '执行失败' }}
            </el-tag>
            <span v-if="lastResult" class="ml-2 text-sm text-gray-500">
              {{ lastResult.executionTime.toFixed(2) }}ms
            </span>
          </div>
        </div>

        <!-- 结果输出 -->
        <div class="result-output">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="输出结果" name="result">
              <div class="output-content">
                <div v-if="lastResult?.success && lastResult.result !== undefined" class="result-value">
                  <pre>{{ formatResult(lastResult.result) }}</pre>
                </div>
                <div v-else-if="!lastResult?.success" class="error-message text-red-600">
                  <el-icon>
                    <BellIcon />
                  </el-icon>
                  {{ lastResult?.error }}
                </div>
                <div v-else class="no-result text-gray-500">
                  暂无执行结果
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="控制台日志" name="logs">
              <div class="logs-content">
                <div v-if="lastResult?.logs.length" class="logs-list">
                  <div v-for="(log, index) in lastResult.logs" :key="index" class="log-item" :class="getLogClass(log)">
                    {{ log }}
                  </div>
                </div>
                <div v-else class="no-logs text-gray-500">
                  暂无日志输出
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="执行历史" name="history">
              <div class="history-content">
                <div v-if="executionHistory.length" class="history-list">
                  <div v-for="(item, index) in executionHistory" :key="index"
                    class="history-item p-3 border-b cursor-pointer hover:bg-gray-50" @click="loadHistoryItem(item)">
                    <div class="flex items-center justify-between">
                      <span class="text-sm">{{ item.timestamp }}</span>
                      <el-tag :type="item.result.success ? 'success' : 'danger'" size="small">
                        {{ item.result.success ? '成功' : '失败' }}
                      </el-tag>
                    </div>
                    <div class="text-xs text-gray-600 mt-1 truncate">
                      {{ item.code.substring(0, 50) }}...
                    </div>
                  </div>
                </div>
                <div v-else class="no-history text-gray-500">
                  暂无执行历史
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 代码示例 -->
    <div class="examples-section mt-6">
      <h3 class="text-lg font-semibold mb-3">代码示例</h3>
      <div class="examples-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="example in codeExamples" :key="example.name"
          class="example-card p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
          @click="loadExample(example)">
          <h4 class="font-medium mb-2">{{ example.name }}</h4>
          <p class="text-sm text-gray-600 mb-2">{{ example.description }}</p>
          <div class="text-xs text-gray-500">{{ example.language }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoCameraIcon, BellIcon } from '@heroicons/vue/24/outline'
import { codeSandbox } from '@/utils/codeSandbox'

interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  logs: string[];
  executionTime: number;
}

interface HistoryItem {
  code: string;
  language: string;
  result: ExecutionResult;
  timestamp: string;
}

const language = ref<'javascript' | 'typescript'>('javascript')
const code = ref(`// 欢迎使用代码沙箱！
console.log('Hello, Sandbox!');

// 计算斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci(10):', result);

return result;`)

const timeout = ref(5000)
const memoryLimit = ref(false)
const isExecuting = ref(false)
const lastResult = ref<ExecutionResult | null>(null)
const activeTab = ref('result')
const executionHistory = ref<HistoryItem[]>([])

const codeExamples = [
  {
    name: '基础计算',
    description: '简单的数学计算示例',
    language: 'JavaScript',
    code: `// 基础数学计算
const a = 10;
const b = 20;
const sum = a + b;
console.log('Sum:', sum);
return sum;`
  },
  {
    name: '异步操作',
    description: '使用Promise和async/await',
    language: 'JavaScript',
    code: `// 异步操作示例
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('开始执行...');
await delay(1000);
console.log('1秒后执行');
return '异步操作完成';`
  },
  {
    name: 'TypeScript类型',
    description: 'TypeScript类型系统示例',
    language: 'TypeScript',
    code: `// TypeScript 类型示例
interface User {
  name: string;
  age: number;
  email?: string;
}

const user: User = {
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
};

function greetUser(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const greeting = greetUser(user);
console.log(greeting);
return greeting;`
  }
]

const executeCode = async () => {
  if (!code.value.trim()) {
    ElMessage.warning('请输入要执行的代码')
    return
  }

  isExecuting.value = true

  try {
    const result = language.value === 'javascript'
      ? await codeSandbox.executeJavaScript(code.value, { timeout: timeout.value })
      : await codeSandbox.executeTypeScript(code.value, { timeout: timeout.value })

    lastResult.value = result

    // 添加到历史记录
    executionHistory.value.unshift({
      code: code.value,
      language: language.value,
      result,
      timestamp: new Date().toLocaleString()
    })

    // 限制历史记录数量
    if (executionHistory.value.length > 10) {
      executionHistory.value = executionHistory.value.slice(0, 10)
    }

    if (result.success) {
      ElMessage.success('代码执行成功')
    } else {
      ElMessage.error('代码执行失败')
    }

  } catch (error) {
    ElMessage.error('执行出错: ' + (error as Error).message)
  } finally {
    isExecuting.value = false
  }
}

const clearCode = () => {
  code.value = ''
  lastResult.value = null
}

const formatResult = (result: any): string => {
  if (typeof result === 'object') {
    return JSON.stringify(result, null, 2)
  }
  return String(result)
}

const getLogClass = (log: string) => {
  if (log.startsWith('ERROR:')) return 'text-red-600'
  if (log.startsWith('WARN:')) return 'text-yellow-600'
  if (log.startsWith('INFO:')) return 'text-blue-600'
  return 'text-gray-700'
}

const loadExample = (example: any) => {
  code.value = example.code
  language.value = example.language.toLowerCase()
}

const loadHistoryItem = (item: HistoryItem) => {
  code.value = item.code
  language.value = item.language as 'javascript' | 'typescript'
  lastResult.value = item.result
}

onBeforeUnmount(() => {
  codeSandbox.destroy()
})
</script>

<style scoped>
.code-sandbox-container {
  max-width: 1400px;
  margin: 0 auto;
}

.code-editor {
  width: 100%;
  height: 300px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #f8f9fa;
  resize: vertical;
  outline: none;
}

.code-editor:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.result-output {
  height: 400px;
}

.output-content,
.logs-content,
.history-content {
  height: 350px;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}

.result-value pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.log-item {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

.examples-grid {
  max-height: 200px;
  overflow-y: auto;
}

.example-card {
  transition: all 0.2s ease;
}

.example-card:hover {
  transform: translateY(-2px);
  border-color: #409eff;
}
</style>