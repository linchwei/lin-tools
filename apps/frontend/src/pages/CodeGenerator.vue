<template>
  <div class="code-generator h-full flex flex-col">
    <div class="header bg-white border-b p-4">
      <h1 class="text-2xl font-bold text-gray-800">AI代码生成器</h1>
      <p class="text-gray-600 mt-1">基于接口定义自动生成CRUD代码</p>
    </div>

    <div class="flex-1 flex">
      <!-- 左侧输入区 -->
      <div class="w-1/2 border-r flex flex-col">
        <div class="p-4 border-b">
          <div class="flex gap-2 mb-4">
            <el-select v-model="inputType" class="w-32">
              <el-option label="TypeScript接口" value="interface" />
              <el-option label="JSON Schema" value="schema" />
              <el-option label="OpenAPI" value="openapi" />
            </el-select>
            <el-button @click="parseInput" type="primary">解析</el-button>
            <el-button @click="generateCode" type="success">生成代码</el-button>
          </div>
        </div>

        <div class="flex-1 p-4">
          <div class="relative h-full">
            <textarea v-model="inputCode" @input="highlightInput"
              class="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-transparent text-transparent caret-gray-800 resize-none outline-none z-10"
              placeholder="请输入接口定义..." spellcheck="false" />
            <pre class="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-gray-50 border rounded overflow-auto"><code 
              ref="inputHighlight" 
              :class="`language-${getInputLanguage()}`"
              v-html="highlightedInput"
            ></code></pre>
          </div>
        </div>
      </div>

      <!-- 右侧生成区 -->
      <div class="w-1/2 flex flex-col">
        <div class="p-4 border-b">
          <div class="flex gap-2">
            <el-select v-model="outputType" class="w-40">
              <el-option label="Vue组件" value="vue" />
              <el-option label="Koa路由" value="koa" />
              <el-option label="Prisma模型" value="prisma" />
            </el-select>
            <el-button @click="copyCode" :disabled="!generatedCode">复制代码</el-button>
            <el-button @click="downloadCode" :disabled="!generatedCode">下载</el-button>
          </div>
        </div>

        <div class="flex-1 p-4 bg-gray-50">
          <pre v-if="generatedCode" class="bg-white p-4 rounded border h-full overflow-auto"><code 
            ref="outputHighlight"
            :class="`language-${getOutputLanguage()}`"
            v-html="highlightedOutput"
          ></code></pre>
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            生成的代码将显示在这里
          </div>
        </div>
      </div>
    </div>

    <!-- 底部AST可视化 -->
    <div class="h-64 border-t bg-white p-4">
      <h3 class="text-lg font-semibold mb-2">AST结构可视化</h3>
      <div ref="astContainer" class="h-48 border rounded bg-gray-50"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElButton, ElSelect, ElOption, ElInput } from 'element-plus'
import { parseTypeScript } from '@/utils/astParser'
import { generateVueComponent, generateKoaRoute, generatePrismaModel } from '@/utils/codeGenerator'
import { visualizeAST } from '@/utils/astVisualizer'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-json'

const inputType = ref('interface')
const outputType = ref('vue')
const inputCode = ref(`interface User {
  id: number
  name: string
  email: string
  age?: number
  createdAt: Date
  updatedAt: Date
}`)

const generatedCode = ref('')
const parsedAST = ref<any>(null)
const astContainer = ref<HTMLElement>()
const inputHighlight = ref<HTMLElement>()
const outputHighlight = ref<HTMLElement>()
const highlightedInput = ref('')
const highlightedOutput = ref('')

const parseInput = () => {
  try {
    parsedAST.value = parseTypeScript(inputCode.value)
    if (astContainer.value) {
      visualizeAST(parsedAST.value, astContainer.value)
    }
    ElMessage.success('解析成功')
  } catch (error) {
    ElMessage.error('解析失败: ' + (error as Error).message)
  }
}

const generateCode = () => {
  if (!parsedAST.value) {
    ElMessage.warning('请先解析输入代码')
    return
  }

  try {
    switch (outputType.value) {
      case 'vue':
        generatedCode.value = generateVueComponent(parsedAST.value)
        break
      case 'koa':
        generatedCode.value = generateKoaRoute(parsedAST.value)
        break
      case 'prisma':
        generatedCode.value = generatePrismaModel(parsedAST.value)
        break
    }
    highlightOutput()
    ElMessage.success('代码生成成功')
  } catch (error) {
    ElMessage.error('生成失败: ' + (error as Error).message)
  }
}

const copyCode = async () => {
  await navigator.clipboard.writeText(generatedCode.value)
  ElMessage.success('已复制到剪贴板')
}

const downloadCode = () => {
  const blob = new Blob([generatedCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `generated-${outputType.value}.${getFileExtension()}`
  a.click()
  URL.revokeObjectURL(url)
}

const getFileExtension = () => {
  const extensions = {
    vue: 'vue',
    react: 'tsx',
    koa: 'ts',
    prisma: 'prisma'
  }
  return extensions[outputType.value as keyof typeof extensions] || 'txt'
}

const highlightInput = () => {
  const language = getInputLanguage()
  highlightedInput.value = Prism.highlight(inputCode.value, Prism.languages[language], language)
}

const highlightOutput = () => {
  if (!generatedCode.value) return
  const language = getOutputLanguage()
  highlightedOutput.value = Prism.highlight(generatedCode.value, Prism.languages[language], language)
}

const getInputLanguage = () => {
  const languages = {
    interface: 'typescript',
    schema: 'json',
    openapi: 'json'
  }
  return languages[inputType.value as keyof typeof languages] || 'typescript'
}

const getOutputLanguage = () => {
  const languages = {
    vue: 'markup',
    koa: 'typescript',
    prisma: 'typescript'
  }
  return languages[outputType.value as keyof typeof languages] || 'typescript'
}

onMounted(() => {
  parseInput()
  highlightInput()
})

watch(inputType, highlightInput)
watch(outputType, () => {
  if (parsedAST.value) {
    generateCode()
  }
})
watch(inputCode, highlightInput)
</script>

<style scoped>
.relative textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
}

.relative pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
  margin: 0;
}

pre code {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
</style>
