<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
    <div class="container mx-auto max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">🧮 计算器</h1>
        <p class="text-slate-300">功能齐全的科学计算器</p>
      </div>

      <div class="bg-black/30 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
        <!-- 显示屏 -->
        <div class="bg-black/50 rounded-2xl p-6 mb-6 border border-white/10">
          <div class="text-right">
            <div class="text-slate-400 text-sm h-6 overflow-hidden">{{ history }}</div>
            <div class="text-white text-3xl font-mono mt-2 min-h-[2.5rem] flex items-center justify-end">
              {{ display }}
            </div>
          </div>
        </div>

        <!-- 按钮区域 -->
        <div class="grid grid-cols-4 gap-3">
          <!-- 第一行：清除和删除 -->
          <button @click="clear" class="btn btn-secondary col-span-2">AC</button>
          <button @click="deleteLast" class="btn btn-secondary">⌫</button>
          <button @click="inputOperator('/')" class="btn btn-operator">÷</button>

          <!-- 第二行：数字7-9和乘法 -->
          <button @click="inputNumber('7')" class="btn btn-number">7</button>
          <button @click="inputNumber('8')" class="btn btn-number">8</button>
          <button @click="inputNumber('9')" class="btn btn-number">9</button>
          <button @click="inputOperator('*')" class="btn btn-operator">×</button>

          <!-- 第三行：数字4-6和减法 -->
          <button @click="inputNumber('4')" class="btn btn-number">4</button>
          <button @click="inputNumber('5')" class="btn btn-number">5</button>
          <button @click="inputNumber('6')" class="btn btn-number">6</button>
          <button @click="inputOperator('-')" class="btn btn-operator">−</button>

          <!-- 第四行：数字1-3和加法 -->
          <button @click="inputNumber('1')" class="btn btn-number">1</button>
          <button @click="inputNumber('2')" class="btn btn-number">2</button>
          <button @click="inputNumber('3')" class="btn btn-number">3</button>
          <button @click="inputOperator('+')" class="btn btn-operator">+</button>

          <!-- 第五行：0、小数点和等号 -->
          <button @click="inputNumber('0')" class="btn btn-number col-span-2">0</button>
          <button @click="inputDot" class="btn btn-number">.</button>
          <button @click="calculate" class="btn btn-equals">=</button>
        </div>

        <!-- 科学计算按钮 -->
        <div class="mt-4 pt-4 border-t border-white/10">
          <div class="grid grid-cols-4 gap-2">
            <button @click="inputFunction('sin')" class="btn btn-function text-sm">sin</button>
            <button @click="inputFunction('cos')" class="btn btn-function text-sm">cos</button>
            <button @click="inputFunction('tan')" class="btn btn-function text-sm">tan</button>
            <button @click="inputFunction('log')" class="btn btn-function text-sm">log</button>
            
            <button @click="inputFunction('sqrt')" class="btn btn-function text-sm">√</button>
            <button @click="inputOperator('^')" class="btn btn-function text-sm">x²</button>
            <button @click="inputBracket('(')" class="btn btn-function text-sm">(</button>
            <button @click="inputBracket(')')" class="btn btn-function text-sm">)</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const display = ref('0')
const history = ref('')
const currentInput = ref('')
const operator = ref('')
const previousInput = ref('')
const shouldResetDisplay = ref(false)

// 输入数字
const inputNumber = (num: string) => {
  if (shouldResetDisplay.value) {
    display.value = num
    shouldResetDisplay.value = false
  } else {
    display.value = display.value === '0' ? num : display.value + num
  }
}

// 输入小数点
const inputDot = () => {
  if (shouldResetDisplay.value) {
    display.value = '0.'
    shouldResetDisplay.value = false
  } else if (!display.value.includes('.')) {
    display.value += '.'
  }
}

// 输入运算符
const inputOperator = (op: string) => {
  if (previousInput.value && operator.value && !shouldResetDisplay.value) {
    calculate()
  }
  
  previousInput.value = display.value
  operator.value = op
  shouldResetDisplay.value = true
  
  const opSymbol = getOperatorSymbol(op)
  history.value = `${display.value} ${opSymbol}`
}

// 输入函数
const inputFunction = (func: string) => {
  const value = parseFloat(display.value)
  let result = 0
  
  try {
    switch (func) {
      case 'sin':
        result = Math.sin(value * Math.PI / 180)
        break
      case 'cos':
        result = Math.cos(value * Math.PI / 180)
        break
      case 'tan':
        result = Math.tan(value * Math.PI / 180)
        break
      case 'log':
        result = Math.log10(value)
        break
      case 'sqrt':
        result = Math.sqrt(value)
        break
      default:
        return
    }
    
    display.value = formatResult(result)
    history.value = `${func}(${value}) =`
    shouldResetDisplay.value = true
  } catch (error) {
    display.value = 'Error'
    shouldResetDisplay.value = true
  }
}

// 输入括号
const inputBracket = (bracket: string) => {
  if (shouldResetDisplay.value) {
    display.value = bracket
    shouldResetDisplay.value = false
  } else {
    display.value += bracket
  }
}

// 计算结果
const calculate = () => {
  if (!previousInput.value || !operator.value) return
  
  const prev = parseFloat(previousInput.value)
  const current = parseFloat(display.value)
  let result = 0
  
  try {
    switch (operator.value) {
      case '+':
        result = prev + current
        break
      case '-':
        result = prev - current
        break
      case '*':
        result = prev * current
        break
      case '/':
        if (current === 0) {
          throw new Error('除零错误')
        }
        result = prev / current
        break
      case '^':
        result = Math.pow(prev, current)
        break
      default:
        return
    }
    
    const opSymbol = getOperatorSymbol(operator.value)
    history.value = `${previousInput.value} ${opSymbol} ${display.value} =`
    display.value = formatResult(result)
    
    previousInput.value = ''
    operator.value = ''
    shouldResetDisplay.value = true
  } catch (error) {
    display.value = 'Error'
    shouldResetDisplay.value = true
  }
}

// 清除
const clear = () => {
  display.value = '0'
  history.value = ''
  currentInput.value = ''
  operator.value = ''
  previousInput.value = ''
  shouldResetDisplay.value = false
}

// 删除最后一位
const deleteLast = () => {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1)
  } else {
    display.value = '0'
  }
}

// 格式化结果
const formatResult = (result: number): string => {
  if (isNaN(result) || !isFinite(result)) {
    return 'Error'
  }
  
  // 保留最多10位小数，去除末尾的0
  const formatted = parseFloat(result.toFixed(10)).toString()
  
  // 如果结果太长，使用科学计数法
  if (formatted.length > 12) {
    return result.toExponential(6)
  }
  
  return formatted
}

// 获取运算符显示符号
const getOperatorSymbol = (op: string): string => {
  const symbols: Record<string, string> = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
    '^': '^'
  }
  return symbols[op] || op
}

// 键盘事件监听
const handleKeyPress = (event: KeyboardEvent) => {
  const key = event.key
  
  if (/[0-9]/.test(key)) {
    inputNumber(key)
  } else if (key === '.') {
    inputDot()
  } else if (['+', '-', '*', '/'].includes(key)) {
    inputOperator(key)
  } else if (key === 'Enter' || key === '=') {
    calculate()
  } else if (key === 'Escape' || key === 'c' || key === 'C') {
    clear()
  } else if (key === 'Backspace') {
    deleteLast()
  }
}

// 挂载键盘事件
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.btn {
  @apply h-14 rounded-xl font-semibold text-lg transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20;
}

.btn-number {
  @apply bg-slate-700/50 hover:bg-slate-600/50 text-white border border-slate-600/30 hover:border-slate-500/50;
}

.btn-operator {
  @apply bg-orange-500/80 hover:bg-orange-400/80 text-white border border-orange-400/30 hover:border-orange-300/50;
}

.btn-equals {
  @apply bg-orange-500 hover:bg-orange-400 text-white border border-orange-400/30 hover:border-orange-300/50;
}

.btn-secondary {
  @apply bg-slate-600/50 hover:bg-slate-500/50 text-white border border-slate-500/30 hover:border-slate-400/50;
}

.btn-function {
  @apply bg-purple-600/50 hover:bg-purple-500/50 text-white border border-purple-500/30 hover:border-purple-400/50;
}

/* 按钮按下效果 */
.btn:active {
  @apply scale-95 brightness-90;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .btn {
    @apply h-12 text-base;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.container > div {
  animation: fadeIn 0.5s ease-out;
}
</style>