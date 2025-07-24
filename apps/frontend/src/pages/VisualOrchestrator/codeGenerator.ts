// 代码生成器 - 将可视化流程转换为可执行代码

import type { FlowNode, Connection } from './nodeTypes'

export interface FlowData {
  nodes: FlowNode[]
  connections: Connection[]
  metadata?: {
    name?: string
    version?: string
    [key: string]: any
  }
}

export interface ExecutionStep {
  nodeId: string
  nodeName: string
  status: 'pending' | 'running' | 'success' | 'error'
  message: string
  timestamp: string
  data?: any
  error?: any
}

export interface ExecutionResult {
  success: boolean
  steps: ExecutionStep[]
  result?: any
  error?: any
}

// 生成Vue组件代码
export function generateVueComponent(flowData: FlowData): string {
  const { nodes, connections } = flowData
  
  // 生成组件模板
  const template = generateTemplate(nodes, connections)
  
  // 生成脚本部分
  const script = generateScript(nodes, connections)
  
  // 生成样式部分
  const style = generateStyle()
  
  return `<template>
${template}
</template>

<script setup lang="ts">
${script}
</script>

<style scoped>
${style}
</style>`
}

// 生成JavaScript代码
export function generateJavaScript(flowData: FlowData): string {
  const { nodes, connections } = flowData
  
  let code = `// 自动生成的流程执行代码
// 生成时间: ${new Date().toISOString()}

class FlowExecutor {
  constructor() {
    this.variables = new Map();
    this.results = new Map();
  }

  async execute(input = null) {
    console.log('开始执行流程...');
    
    try {
      // 初始化变量
      this.variables.set('input', input);
      
      // 执行流程
      const result = await this.executeFlow();
      
      console.log('流程执行完成:', result);
      return result;
    } catch (error) {
      console.error('流程执行失败:', error);
      throw error;
    }
  }

  async executeFlow() {
`

  // 生成节点执行代码
  const startNode = nodes.find(n => n.type === 'start')
  if (startNode) {
    code += generateNodeExecutionCode(startNode, nodes, connections, 2)
  }

  code += `
    return this.results.get('final_result') || null;
  }

  // 工具方法
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async httpRequest(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    return response.json();
  }

  evaluateCondition(condition, context) {
    try {
      // 简单的条件评估（生产环境需要更安全的实现）
      const func = new Function('context', \`with(context) { return \${condition}; }\`);
      return func(context);
    } catch (error) {
      console.error('条件评估失败:', error);
      return false;
    }
  }
}

// 导出执行器
export default FlowExecutor;

// 使用示例
// const executor = new FlowExecutor();
// executor.execute({ message: 'Hello World' }).then(result => {
//   console.log('执行结果:', result);
// });`

  return code
}

// 执行流程
export async function executeFlow(flowData: FlowData): Promise<ExecutionResult> {
  const { nodes, connections } = flowData
  const steps: ExecutionStep[] = []
  const variables = new Map<string, any>()
  
  try {
    // 查找开始节点
    const startNode = nodes.find(n => n.type === 'start')
    if (!startNode) {
      throw new Error('未找到开始节点')
    }

    // 执行流程
    await executeNode(startNode, nodes, connections, variables, steps)
    
    return {
      success: true,
      steps,
      result: variables.get('final_result')
    }
  } catch (error) {
    return {
      success: false,
      steps,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// 执行单个节点
async function executeNode(
  node: FlowNode,
  allNodes: FlowNode[],
  connections: Connection[],
  variables: Map<string, any>,
  steps: ExecutionStep[]
): Promise<any> {
  const step: ExecutionStep = {
    nodeId: node.id,
    nodeName: node.name,
    status: 'running',
    message: `正在执行节点: ${node.name}`,
    timestamp: new Date().toISOString()
  }
  
  steps.push(step)
  
  try {
    let result: any = null
    
    // 根据节点类型执行不同逻辑
    switch (node.type) {
      case 'start':
        result = await executeStartNode(node, variables)
        break
      case 'end':
        result = await executeEndNode(node, variables)
        break
      case 'variable':
        result = await executeVariableNode(node, variables)
        break
      case 'log':
        result = await executeLogNode(node, variables)
        break
      case 'condition':
        result = await executeConditionNode(node, variables)
        break
      case 'transform':
        result = await executeTransformNode(node, variables)
        break
      case 'http':
        result = await executeHttpNode(node, variables)
        break
      case 'delay':
        result = await executeDelayNode(node, variables)
        break
      default:
        throw new Error(`不支持的节点类型: ${node.type}`)
    }
    
    step.status = 'success'
    step.message = `节点执行成功: ${node.name}`
    step.data = result
    
    // 执行下一个节点
    const nextNodes = getNextNodes(node, connections, allNodes, result)
    for (const nextNode of nextNodes) {
      await executeNode(nextNode, allNodes, connections, variables, steps)
    }
    
    return result
  } catch (error) {
    step.status = 'error'
    step.message = `节点执行失败: ${error instanceof Error ? error.message : String(error)}`
    step.error = error
    throw error
  }
}

// 节点执行函数
async function executeStartNode(node: FlowNode, variables: Map<string, any>): Promise<any> {
  const message = node.config.message || '流程开始'
  console.log(message)
  variables.set('start_message', message)
  return message
}

async function executeEndNode(node: FlowNode, variables: Map<string, any>): Promise<any> {
  const message = node.config.message || '流程结束'
  console.log(message)
  variables.set('final_result', message)
  return message
}

async function executeVariableNode(node: FlowNode, variables: Map<string, any>): Promise<any> {
  const { name, type, defaultValue } = node.config
  let value = defaultValue
  
  // 类型转换
  switch (type) {
    case 'number':
      value = Number(value) || 0
      break
    case 'boolean':
      value = Boolean(value)
      break
    case 'object':
      try {
        value = JSON.parse(value || '{}')
      } catch {
        value = {}
      }
      break
    case 'array':
      try {
        value = JSON.parse(value || '[]')
      } catch {
        value = []
      }
      break
    default:
      value = String(value || '')
  }
  
  variables.set(name, value)
  return value
}

async function executeLogNode(node: FlowNode, variables: Map<string, any>): Promise<any> {
  const { level, prefix } = node.config
  const message = variables.get('input') || ''
  const logMessage = `${prefix} ${message}`
  
  switch (level) {
    case 'error':
      console.error(logMessage)
      break
    case 'warn':
      console.warn(logMessage)
      break
    case 'debug':
      console.debug(logMessage)
      break
    default:
      console.log(logMessage)
  }
  
  return logMessage
}

async function executeConditionNode(node: FlowNode, variables: Map<string, any>): Promise<any> {
  const { condition } = node.config
  const input = variables.get('input')
  
  try {
    // 简单的条件评估（生产环境需要更安全的实现）
    const result = eval(condition.replace(/input/g, JSON.stringify(input)))
    return result
  } catch (error) {
    console.error('条件评估失败:', error)
    return false
  }
}

async function executeTransformNode(node: FlowNode, variables: Map<string, any>): Promise<any> {
  const { transformType, customCode } = node.config
  const input = variables.get('input')
  
  switch (transformType) {
    case 'parseJSON':
      return JSON.parse(String(input))
    case 'stringifyJSON':
      return JSON.stringify(input)
    case 'toNumber':
      return Number(input)
    case 'toString':
      return String(input)
    case 'custom':
      try {
        // 执行自定义代码（生产环境需要更安全的实现）
        const func = new Function('input', customCode)
        return func(input)
      } catch (error) {
        throw new Error(`自定义转换失败: ${error}`)
      }
    default:
      return input
  }
}

async function executeHttpNode(node: FlowNode, variables: Map<string, any>): Promise<any> {
  const { method, headers, timeout } = node.config
  const url = variables.get('url') || node.config.url
  const data = variables.get('data')
  
  const options: RequestInit = {
    method,
    headers: JSON.parse(headers || '{}'),
    signal: AbortSignal.timeout(timeout || 5000)
  }
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data)
  }
  
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

async function executeDelayNode(node: FlowNode, variables: Map<string, any>): Promise<any> {
  const { duration } = node.config
  const input = variables.get('input')
  
  await new Promise(resolve => setTimeout(resolve, duration || 1000))
  return input
}

// 获取下一个节点
function getNextNodes(
  currentNode: FlowNode,
  connections: Connection[],
  allNodes: FlowNode[],
  result?: any
): FlowNode[] {
  const nextConnections = connections.filter(c => c.sourceNodeId === currentNode.id)
  const nextNodes: FlowNode[] = []
  
  for (const connection of nextConnections) {
    const nextNode = allNodes.find(n => n.id === connection.targetNodeId)
    if (nextNode) {
      // 对于条件节点，根据结果选择分支
      if (currentNode.type === 'condition') {
        if ((result && connection.sourcePortId === 'true') || 
            (!result && connection.sourcePortId === 'false')) {
          nextNodes.push(nextNode)
        }
      } else {
        nextNodes.push(nextNode)
      }
    }
  }
  
  return nextNodes
}

// 生成模板代码
function generateTemplate(nodes: FlowNode[], connections: Connection[]): string {
  return `  <div class="flow-component">
    <h2>自动生成的流程组件</h2>
    <div class="flow-controls">
      <el-button @click="executeFlow" type="primary" :loading="executing">
        执行流程
      </el-button>
      <el-button @click="resetFlow">重置</el-button>
    </div>
    
    <div v-if="result" class="flow-result">
      <h3>执行结果:</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <div v-if="error" class="flow-error">
      <h3>执行错误:</h3>
      <p>{{ error }}</p>
    </div>
  </div>`
}

// 生成脚本代码
function generateScript(nodes: FlowNode[], connections: Connection[]): string {
  return `import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const executing = ref(false)
const result = ref(null)
const error = ref(null)

const executeFlow = async () => {
  executing.value = true
  error.value = null
  result.value = null
  
  try {
    // 这里是生成的流程执行逻辑
    const flowResult = await runGeneratedFlow()
    result.value = flowResult
    ElMessage.success('流程执行成功')
  } catch (err) {
    error.value = err.message
    ElMessage.error('流程执行失败')
  } finally {
    executing.value = false
  }
}

const resetFlow = () => {
  result.value = null
  error.value = null
}

const runGeneratedFlow = async () => {
  // 自动生成的流程逻辑
  console.log('执行生成的流程...')
  return { message: '流程执行完成', timestamp: new Date().toISOString() }
}`
}

// 生成样式代码
function generateStyle(): string {
  return `.flow-component {
  padding: 20px;
}

.flow-controls {
  margin-bottom: 20px;
}

.flow-result,
.flow-error {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.flow-result {
  background: #f0f9ff;
  border: 1px solid #e1f5fe;
}

.flow-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
}`
}

// 生成节点执行代码
function generateNodeExecutionCode(
  node: FlowNode,
  allNodes: FlowNode[],
  connections: Connection[],
  indent: number
): string {
  const spaces = ' '.repeat(indent)
  let code = `${spaces}// 执行节点: ${node.name}\n`
  
  switch (node.type) {
    case 'start':
      code += `${spaces}console.log('${node.config.message || '流程开始'}');\n`
      break
    case 'end':
      code += `${spaces}this.results.set('final_result', '${node.config.message || '流程结束'}');\n`
      code += `${spaces}return this.results.get('final_result');\n`
      break
    case 'log':
      code += `${spaces}console.log('${node.config.prefix || '[LOG]'}', this.variables.get('input'));\n`
      break
    default:
      code += `${spaces}// TODO: 实现 ${node.type} 节点逻辑\n`
  }
  
  // 查找下一个节点
  const nextConnections = connections.filter(c => c.sourceNodeId === node.id)
  for (const connection of nextConnections) {
    const nextNode = allNodes.find(n => n.id === connection.targetNodeId)
    if (nextNode) {
      code += generateNodeExecutionCode(nextNode, allNodes, connections, indent)
    }
  }
  
  return code
}
