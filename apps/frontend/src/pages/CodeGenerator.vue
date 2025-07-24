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
          <el-input v-model="inputCode" type="textarea" :rows="20" placeholder="请输入接口定义..." class="h-full" />
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
          <pre v-if="generatedCode"
            class="bg-white p-4 rounded border h-full overflow-auto"><code>{{ generatedCode }}</code></pre>
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

onMounted(() => {
  parseInput()
})

// 监听输出类型变化，自动重新生成代码
watch(outputType, () => {
  if (parsedAST.value) {
    generateCode()
  }
})
</script>
