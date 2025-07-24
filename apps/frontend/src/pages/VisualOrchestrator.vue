<template>
  <div class="visual-orchestrator">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h1 class="page-title">🎨 可视化编排引擎</h1>
        <div class="toolbar-actions">
          <el-button type="primary" @click="createNewFlow">
            <el-icon>
              <Plus />
            </el-icon>
            新建流程
          </el-button>
          <el-button @click="saveFlow" :loading="saving">
            <el-icon>
              <Document />
            </el-icon>
            保存
          </el-button>
          <el-button @click="exportFlow">
            <el-icon>
              <Download />
            </el-icon>
            导出
          </el-button>
          <el-button @click="importFlow">
            <el-icon>
              <Upload />
            </el-icon>
            导入
          </el-button>
          <el-dropdown @command="loadExample">
            <el-button>
              示例流程
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="simple-data-processing">简单数据处理</el-dropdown-item>
                <el-dropdown-item command="http-api-workflow">HTTP API 工作流</el-dropdown-item>
                <el-dropdown-item command="data-processing-pipeline">数据处理管道</el-dropdown-item>
                <el-dropdown-item command="parallel-processing">并行处理流程</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button @click="runFlow" type="success" :disabled="!canRun">
            <el-icon>
              <VideoPlay />
            </el-icon>
            运行
          </el-button>
        </div>
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button @click="zoomIn">
            <el-icon>
              <ZoomIn />
            </el-icon>
          </el-button>
          <el-button @click="resetZoom">{{ Math.round(zoom * 100) }}%</el-button>
          <el-button @click="zoomOut">
            <el-icon>
              <ZoomOut />
            </el-icon>
          </el-button>
        </el-button-group>
        <el-button @click="toggleMinimap" :type="showMinimap ? 'primary' : ''">
          <el-icon>
            <Monitor />
          </el-icon>
          小地图
        </el-button>
        <el-button @click="applyAutoLayout">
          <el-icon>
            <Grid />
          </el-icon>
          自动布局
        </el-button>
      </div>
    </div>

    <div class="orchestrator-container">
      <!-- 左侧节点面板 -->
      <div class="node-panel">
        <div class="panel-header">
          <h3>节点库</h3>
          <el-input v-model="nodeSearchText" placeholder="搜索节点..." size="small" clearable>
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="node-categories">
          <el-collapse v-model="activeCategories" accordion>
            <el-collapse-item v-for="category in filteredNodeCategories" :key="category.name" :title="category.title"
              :name="category.name">
              <div class="node-list">
                <div v-for="nodeType in category.nodes" :key="nodeType.type" class="node-item" :draggable="true"
                  @dragstart="handleNodeDragStart($event, nodeType)" @dragend="handleNodeDragEnd">
                  <div class="node-icon" :style="{ backgroundColor: nodeType.color }">
                    <i :class="nodeType.icon"></i>
                  </div>
                  <div class="node-info">
                    <div class="node-name">{{ nodeType.name }}</div>
                    <div class="node-desc">{{ nodeType.description }}</div>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 中间画布区域 -->
      <div class="canvas-container" ref="canvasContainer">
        <div class="canvas-wrapper" :style="{ transform: `scale(${zoom}) translate(${panX}px, ${panY}px)` }"
          @mousedown="handleCanvasMouseDown" @mousemove="handleCanvasMouseMove" @mouseup="handleCanvasMouseUp"
          @wheel="handleCanvasWheel">
          <!-- SVG画布 -->
          <svg class="canvas-svg" :width="canvasWidth" :height="canvasHeight" @drop="handleCanvasDrop"
            @dragover="handleCanvasDragOver">
            <!-- 网格背景 -->
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="1" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <!-- 连接线 -->
            <g class="connections">
              <path v-for="connection in connections" :key="connection.id" :d="getConnectionPath(connection)"
                class="connection-path" :class="{
                  'connection-active': connection.id === activeConnection,
                  'connection-error': connection.hasError
                }" @click="selectConnection(connection)" />

              <!-- 连接线箭头 -->
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>
            </g>

            <!-- 临时连接线 -->
            <path v-if="tempConnection" :d="tempConnection.path" class="temp-connection" stroke="#409eff"
              stroke-width="2" fill="none" stroke-dasharray="5,5" />
          </svg>

          <!-- 节点容器 -->
          <div class="nodes-container">
            <div v-for="node in nodes" :key="node.id" class="flow-node" :class="{
              'node-selected': node.id === selectedNode,
              'node-running': runningNodes.includes(node.id),
              'node-error': node.hasError
            }" :style="{
              left: node.x + 'px',
              top: node.y + 'px',
              backgroundColor: getNodeTypeConfig(node.type)?.color || '#f0f0f0'
            }" @mousedown="handleNodeMouseDown($event, node)" @click="selectNode(node)">
              <!-- 节点头部 -->
              <div class="node-header">
                <div class="node-icon">
                  <i :class="getNodeTypeConfig(node.type)?.icon"></i>
                </div>
                <div class="node-title">{{ node.name || getNodeTypeConfig(node.type)?.name }}</div>
                <div class="node-actions">
                  <el-button size="small" text @click.stop="editNode(node)">
                    <el-icon>
                      <Edit />
                    </el-icon>
                  </el-button>
                  <el-button size="small" text @click.stop="deleteNode(node.id)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </div>

              <!-- 节点内容 -->
              <div class="node-content">
                <div class="node-description">
                  {{ node.description || getNodeTypeConfig(node.type)?.description }}
                </div>

                <!-- 节点参数预览 -->
                <div v-if="node.config && Object.keys(node.config).length > 0" class="node-params">
                  <div v-for="(value, key) in node.config" :key="key" class="param-item">
                    <span class="param-key">{{ key }}:</span>
                    <span class="param-value">{{ formatParamValue(value) }}</span>
                  </div>
                </div>
              </div>

              <!-- 输入端口 -->
              <div class="input-ports">
                <div v-for="port in getNodeInputPorts(node)" :key="port.id" class="port input-port"
                  :data-port-id="port.id" :data-node-id="node.id"
                  @mousedown.stop="handlePortMouseDown($event, node, port, 'input')">
                  <div class="port-dot"></div>
                  <div class="port-label">{{ port.name }}</div>
                </div>
              </div>

              <!-- 输出端口 -->
              <div class="output-ports">
                <div v-for="port in getNodeOutputPorts(node)" :key="port.id" class="port output-port"
                  :data-port-id="port.id" :data-node-id="node.id"
                  @mousedown.stop="handlePortMouseDown($event, node, port, 'output')">
                  <div class="port-dot"></div>
                  <div class="port-label">{{ port.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 小地图 -->
        <div v-if="showMinimap" class="minimap">
          <div class="minimap-content">
            <svg class="minimap-svg" width="200" height="150">
              <rect width="100%" height="100%" fill="#f5f5f5" stroke="#ddd" />
              <!-- 小地图中的节点 -->
              <rect v-for="node in nodes" :key="node.id" :x="node.x * minimapScale" :y="node.y * minimapScale"
                :width="120 * minimapScale" :height="80 * minimapScale"
                :fill="getNodeTypeConfig(node.type)?.color || '#f0f0f0'" stroke="#666" stroke-width="1" />
              <!-- 视口框 -->
              <rect :x="viewportX" :y="viewportY" :width="viewportWidth" :height="viewportHeight" fill="none"
                stroke="#409eff" stroke-width="2" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <div class="panel-header">
          <h3>属性面板</h3>
        </div>

        <div v-if="selectedNode" class="node-properties">
          <el-form :model="selectedNodeConfig" label-position="top" size="small">
            <el-form-item label="节点名称">
              <el-input v-model="selectedNodeConfig.name" @change="updateNodeConfig" />
            </el-form-item>

            <el-form-item label="描述">
              <el-input v-model="selectedNodeConfig.description" type="textarea" :rows="2" @change="updateNodeConfig" />
            </el-form-item>

            <!-- 动态配置项 -->
            <div v-for="configItem in getNodeConfigSchema(selectedNode.type)" :key="configItem.key">
              <el-form-item :label="configItem.label">
                <!-- 文本输入 -->
                <el-input v-if="configItem.type === 'text'" v-model="selectedNodeConfig.config[configItem.key]"
                  :placeholder="configItem.placeholder" @change="updateNodeConfig" />

                <!-- 数字输入 -->
                <el-input-number v-else-if="configItem.type === 'number'"
                  v-model="selectedNodeConfig.config[configItem.key]" :min="configItem.min" :max="configItem.max"
                  @change="updateNodeConfig" />

                <!-- 选择器 -->
                <el-select v-else-if="configItem.type === 'select'" v-model="selectedNodeConfig.config[configItem.key]"
                  :placeholder="configItem.placeholder" @change="updateNodeConfig">
                  <el-option v-for="option in configItem.options" :key="option.value" :label="option.label"
                    :value="option.value" />
                </el-select>

                <!-- 开关 -->
                <el-switch v-else-if="configItem.type === 'boolean'" v-model="selectedNodeConfig.config[configItem.key]"
                  @change="updateNodeConfig" />

                <!-- 代码编辑器 -->
                <el-input v-else-if="configItem.type === 'code'" v-model="selectedNodeConfig.config[configItem.key]"
                  type="textarea" :rows="4" placeholder="请输入代码..." @change="updateNodeConfig" />
              </el-form-item>
            </div>
          </el-form>
        </div>

        <div v-else-if="activeConnection" class="connection-properties">
          <h4>连接属性</h4>
          <el-form size="small">
            <el-form-item label="连接类型">
              <el-select v-model="connectionConfig.type">
                <el-option label="数据流" value="data" />
                <el-option label="控制流" value="control" />
                <el-option label="条件分支" value="condition" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="connectionConfig.type === 'condition'" label="条件表达式">
              <el-input v-model="connectionConfig.condition" placeholder="例如: value > 10" type="textarea" :rows="2" />
            </el-form-item>
          </el-form>
        </div>

        <div v-else class="empty-selection">
          <el-empty description="请选择节点或连接线来编辑属性" />
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <span>节点: {{ nodes.length }}</span>
        <span>连接: {{ connections.length }}</span>
        <span v-if="selectedNode">已选择: {{ selectedNode.name || getNodeTypeConfig(selectedNode.type)?.name }}</span>
      </div>
      <div class="status-right">
        <span>缩放: {{ Math.round(zoom * 100) }}%</span>
        <span>{{ canvasWidth }} × {{ canvasHeight }}</span>
      </div>
    </div>

    <!-- 运行结果对话框 -->
    <el-dialog v-model="showRunDialog" title="流程执行结果" width="60%">
      <div class="run-result">
        <el-timeline>
          <el-timeline-item v-for="(step, index) in executionSteps" :key="index"
            :type="step.status === 'success' ? 'success' : step.status === 'error' ? 'danger' : 'primary'"
            :timestamp="step.timestamp">
            <div class="step-content">
              <h4>{{ step.nodeName }}</h4>
              <p>{{ step.message }}</p>
              <div v-if="step.data" class="step-data">
                <pre>{{ JSON.stringify(step.data, null, 2) }}</pre>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <!-- 导出对话框 -->
    <el-dialog v-model="showExportDialog" title="导出流程" width="50%">
      <el-tabs v-model="exportTab">
        <el-tab-pane label="JSON配置" name="json">
          <el-input v-model="exportedJson" type="textarea" :rows="15" readonly />
          <div style="margin-top: 10px;">
            <el-button @click="copyToClipboard(exportedJson)">复制到剪贴板</el-button>
            <el-button @click="downloadJson">下载JSON文件</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Vue组件" name="vue">
          <el-input v-model="exportedVue" type="textarea" :rows="15" readonly />
          <div style="margin-top: 10px;">
            <el-button @click="copyToClipboard(exportedVue)">复制到剪贴板</el-button>
            <el-button @click="downloadVue">下载Vue文件</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="JavaScript代码" name="js">
          <el-input v-model="exportedJs" type="textarea" :rows="15" readonly />
          <div style="margin-top: 10px;">
            <el-button @click="copyToClipboard(exportedJs)">复制到剪贴板</el-button>
            <el-button @click="downloadJs">下载JS文件</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Plus, Document, Download, Upload, VideoPlay, ZoomIn, ZoomOut, Monitor,
  Search, Edit, Delete, ArrowDown, Grid
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入节点类型定义和工具函数
import { nodeTypes, type FlowNode, type Connection, type NodeType } from './VisualOrchestrator/nodeTypes'
import { generateVueComponent, generateJavaScript, executeFlow } from './VisualOrchestrator/codeGenerator'
import { autoLayout } from './VisualOrchestrator/layoutEngine'
import { createExampleFlow } from './VisualOrchestrator/examples'

// 基础状态
const canvasContainer = ref<HTMLElement>()
const canvasWidth = ref(2000)
const canvasHeight = ref(1500)
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)

// 节点和连接
const nodes = ref<FlowNode[]>([])
const connections = ref<Connection[]>([])
const selectedNode = ref<FlowNode | null>(null)
const activeConnection = ref<string | null>(null)

// 界面状态
const saving = ref(false)
const showMinimap = ref(true)
const showRunDialog = ref(false)
const showExportDialog = ref(false)
const exportTab = ref('json')
const nodeSearchText = ref('')
const activeCategories = ref(['basic'])

// 拖拽状态
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const dragNode = ref<FlowNode | null>(null)
const tempConnection = ref<{ path: string } | null>(null)
const connectingPort = ref<{ node: FlowNode; port: any; type: 'input' | 'output' } | null>(null)

// 运行状态
const runningNodes = ref<string[]>([])
const executionSteps = ref<any[]>([])

// 配置状态
const selectedNodeConfig = ref<any>({})
const connectionConfig = ref<any>({})

// 导出内容
const exportedJson = ref('')
const exportedVue = ref('')
const exportedJs = ref('')

// 计算属性
const canRun = computed(() => nodes.value.length > 0)
const minimapScale = computed(() => 0.1)
const viewportX = computed(() => -panX.value * minimapScale.value)
const viewportY = computed(() => -panY.value * minimapScale.value)
const viewportWidth = computed(() => (canvasContainer.value?.clientWidth || 800) * minimapScale.value / zoom.value)
const viewportHeight = computed(() => (canvasContainer.value?.clientHeight || 600) * minimapScale.value / zoom.value)

const filteredNodeCategories = computed(() => {
  if (!nodeSearchText.value) return nodeTypes

  return nodeTypes.map(category => ({
    ...category,
    nodes: category.nodes.filter(node =>
      node.name.toLowerCase().includes(nodeSearchText.value.toLowerCase()) ||
      node.description.toLowerCase().includes(nodeSearchText.value.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0)
})

// 工具函数
const getNodeTypeConfig = (type: string): NodeType | undefined => {
  for (const category of nodeTypes) {
    const nodeType = category.nodes.find(n => n.type === type)
    if (nodeType) return nodeType
  }
  return undefined
}

const getNodeInputPorts = (node: FlowNode) => {
  const config = getNodeTypeConfig(node.type)
  return config?.inputs || []
}

const getNodeOutputPorts = (node: FlowNode) => {
  const config = getNodeTypeConfig(node.type)
  return config?.outputs || []
}

const getNodeConfigSchema = (type: string) => {
  const config = getNodeTypeConfig(type)
  return config?.configSchema || []
}

const formatParamValue = (value: any): string => {
  if (typeof value === 'string' && value.length > 20) {
    return value.substring(0, 20) + '...'
  }
  return String(value)
}

// 节点拖拽事件
const handleNodeDragStart = (event: DragEvent, nodeType: NodeType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeType))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

const handleNodeDragEnd = () => {
  // 拖拽结束处理
}

const handleCanvasDrop = (event: DragEvent) => {
  event.preventDefault()
  const data = event.dataTransfer?.getData('application/json')
  if (data) {
    const nodeType = JSON.parse(data) as NodeType
    const rect = (event.target as Element).getBoundingClientRect()
    const x = (event.clientX - rect.left) / zoom.value - panX.value
    const y = (event.clientY - rect.top) / zoom.value - panY.value

    createNode(nodeType, x, y)
  }
}

const handleCanvasDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

// 画布交互事件
const handleCanvasMouseDown = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    isDragging.value = true
    dragStartPos.value = { x: event.clientX, y: event.clientY }
    selectedNode.value = null
    activeConnection.value = null
  }
}

const handleCanvasMouseMove = (event: MouseEvent) => {
  if (isDragging.value && !dragNode.value) {
    const deltaX = event.clientX - dragStartPos.value.x
    const deltaY = event.clientY - dragStartPos.value.y
    panX.value += deltaX / zoom.value
    panY.value += deltaY / zoom.value
    dragStartPos.value = { x: event.clientX, y: event.clientY }
  }

  if (dragNode.value) {
    const rect = canvasContainer.value?.getBoundingClientRect()
    if (rect) {
      dragNode.value.x = (event.clientX - rect.left) / zoom.value - panX.value - 60
      dragNode.value.y = (event.clientY - rect.top) / zoom.value - panY.value - 40
    }
  }

  if (connectingPort.value) {
    updateTempConnection(event)
  }
}

const handleCanvasMouseUp = () => {
  isDragging.value = false
  dragNode.value = null
  if (connectingPort.value) {
    connectingPort.value = null
    tempConnection.value = null
  }
}

const handleCanvasWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.1, Math.min(3, zoom.value * delta))
}

// 节点操作
const createNode = (nodeType: NodeType, x: number, y: number) => {
  const newNode: FlowNode = {
    id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: nodeType.type,
    name: nodeType.name,
    description: nodeType.description,
    x: x - 60,
    y: y - 40,
    config: {},
    hasError: false
  }

  nodes.value.push(newNode)
  selectNode(newNode)
  ElMessage.success(`已添加节点: ${nodeType.name}`)
}

const selectNode = (node: FlowNode) => {
  selectedNode.value = node
  activeConnection.value = null
  selectedNodeConfig.value = {
    name: node.name,
    description: node.description,
    config: { ...node.config }
  }
}

const handleNodeMouseDown = (event: MouseEvent, node: FlowNode) => {
  event.stopPropagation()
  dragNode.value = node
  selectNode(node)
}

const editNode = (node: FlowNode) => {
  selectNode(node)
}

const deleteNode = (nodeId: string) => {
  ElMessageBox.confirm('确定要删除这个节点吗？', '确认删除', {
    type: 'warning'
  }).then(() => {
    nodes.value = nodes.value.filter(n => n.id !== nodeId)
    connections.value = connections.value.filter(c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId)
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = null
    }
    ElMessage.success('节点已删除')
  }).catch(() => { })
}

const updateNodeConfig = () => {
  if (selectedNode.value) {
    selectedNode.value.name = selectedNodeConfig.value.name
    selectedNode.value.description = selectedNodeConfig.value.description
    selectedNode.value.config = { ...selectedNodeConfig.value.config }
  }
}

// 连接线操作
const handlePortMouseDown = (event: MouseEvent, node: FlowNode, port: any, type: 'input' | 'output') => {
  event.stopPropagation()
  connectingPort.value = { node, port, type }
  updateTempConnection(event)
}

const updateTempConnection = (event: MouseEvent) => {
  if (!connectingPort.value || !canvasContainer.value) return

  const rect = canvasContainer.value.getBoundingClientRect()
  const startX = connectingPort.value.node.x + (connectingPort.value.type === 'output' ? 120 : 0)
  const startY = connectingPort.value.node.y + 40
  const endX = (event.clientX - rect.left) / zoom.value - panX.value
  const endY = (event.clientY - rect.top) / zoom.value - panY.value

  tempConnection.value = {
    path: createConnectionPath(startX, startY, endX, endY)
  }
}

const createConnectionPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const dx = x2 - x1
  const dy = y2 - y1
  const cx1 = x1 + dx * 0.5
  const cy1 = y1
  const cx2 = x2 - dx * 0.5
  const cy2 = y2

  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
}

const getConnectionPath = (connection: Connection): string => {
  const sourceNode = nodes.value.find(n => n.id === connection.sourceNodeId)
  const targetNode = nodes.value.find(n => n.id === connection.targetNodeId)

  if (!sourceNode || !targetNode) return ''

  const x1 = sourceNode.x + 120
  const y1 = sourceNode.y + 40
  const x2 = targetNode.x
  const y2 = targetNode.y + 40

  return createConnectionPath(x1, y1, x2, y2)
}

const selectConnection = (connection: Connection) => {
  activeConnection.value = connection.id
  selectedNode.value = null
  connectionConfig.value = { ...connection }
}

// 工具栏操作
const createNewFlow = () => {
  ElMessageBox.confirm('创建新流程将清空当前内容，是否继续？', '确认操作', {
    type: 'warning'
  }).then(() => {
    nodes.value = []
    connections.value = []
    selectedNode.value = null
    activeConnection.value = null
    ElMessage.success('已创建新流程')
  }).catch(() => { })
}

const saveFlow = async () => {
  saving.value = true
  try {
    const flowData = {
      nodes: nodes.value,
      connections: connections.value,
      metadata: {
        name: '未命名流程',
        version: '1.0.0',
        createdAt: new Date().toISOString()
      }
    }

    // 这里可以调用API保存到服务器
    localStorage.setItem('visual_orchestrator_flow', JSON.stringify(flowData))
    ElMessage.success('流程已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const exportFlow = () => {
  const flowData = {
    nodes: nodes.value,
    connections: connections.value,
    metadata: {
      name: '导出流程',
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    }
  }

  exportedJson.value = JSON.stringify(flowData, null, 2)
  exportedVue.value = generateVueComponent(flowData)
  exportedJs.value = generateJavaScript(flowData)
  showExportDialog.value = true
}

const importFlow = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const flowData = JSON.parse(e.target?.result as string)
          nodes.value = flowData.nodes || []
          connections.value = flowData.connections || []
          ElMessage.success('流程导入成功')
        } catch (error) {
          ElMessage.error('导入失败：文件格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const loadExample = (exampleId: string) => {
  const exampleFlow = createExampleFlow(exampleId)
  if (exampleFlow) {
    nodes.value = exampleFlow.nodes
    connections.value = exampleFlow.connections
    selectedNode.value = null
    activeConnection.value = null
    ElMessage.success(`已加载示例流程`)
  } else {
    ElMessage.error('示例流程加载失败')
  }
}

const runFlow = async () => {
  if (nodes.value.length === 0) {
    ElMessage.warning('请先添加节点')
    return
  }

  try {
    runningNodes.value = []
    executionSteps.value = []

    const result = await executeFlow({ nodes: nodes.value, connections: connections.value })
    executionSteps.value = result.steps
    showRunDialog.value = true

    ElMessage.success('流程执行完成')
  } catch (error) {
    ElMessage.error('流程执行失败')
  }
}

// 视图控制
const zoomIn = () => {
  zoom.value = Math.min(3, zoom.value * 1.2)
}

const zoomOut = () => {
  zoom.value = Math.max(0.1, zoom.value / 1.2)
}

const resetZoom = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

const toggleMinimap = () => {
  showMinimap.value = !showMinimap.value
}

const applyAutoLayout = () => {
  if (nodes.value.length === 0) {
    ElMessage.warning('请先添加节点')
    return
  }

  try {
    const layoutResult = autoLayout(nodes.value, connections.value, {
      nodeWidth: 120,
      nodeHeight: 80,
      horizontalSpacing: 100,
      verticalSpacing: 80,
      direction: 'TB'
    })

    // 更新节点位置
    for (const layoutNode of layoutResult.nodes) {
      const node = nodes.value.find(n => n.id === layoutNode.id)
      if (node) {
        node.x = layoutNode.x + 200 // 添加偏移量避免负坐标
        node.y = layoutNode.y + 100
      }
    }

    ElMessage.success('自动布局完成')
  } catch (error) {
    ElMessage.error('自动布局失败')
    console.error('自动布局错误:', error)
  }
}

// 工具函数
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadJson = () => {
  const blob = new Blob([exportedJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'flow.json'
  a.click()
  URL.revokeObjectURL(url)
}

const downloadVue = () => {
  const blob = new Blob([exportedVue.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'FlowComponent.vue'
  a.click()
  URL.revokeObjectURL(url)
}

const downloadJs = () => {
  const blob = new Blob([exportedJs.value], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'flow.js'
  a.click()
  URL.revokeObjectURL(url)
}

// 生命周期
onMounted(() => {
  // 尝试加载保存的流程
  const saved = localStorage.getItem('visual_orchestrator_flow')
  if (saved) {
    try {
      const flowData = JSON.parse(saved)
      nodes.value = flowData.nodes || []
      connections.value = flowData.connections || []
    } catch (error) {
      console.error('加载保存的流程失败:', error)
    }
  }

  // 添加全局事件监听
  document.addEventListener('mousemove', handleCanvasMouseMove)
  document.addEventListener('mouseup', handleCanvasMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleCanvasMouseMove)
  document.removeEventListener('mouseup', handleCanvasMouseUp)
})
</script>

<style scoped>
.visual-orchestrator {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow: hidden;
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 主容器样式 */
.orchestrator-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧节点面板 */
.node-panel {
  width: 280px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.node-categories {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  background: white;
}

.node-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transform: translateY(-1px);
}

.node-item:active {
  cursor: grabbing;
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.node-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 画布容器 */
.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #fafbfc;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
  transition: transform 0.1s ease;
}

.canvas-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.canvas-svg .connections {
  pointer-events: all;
}

.connection-path {
  stroke: #666;
  stroke-width: 2;
  fill: none;
  marker-end: url(#arrowhead);
  cursor: pointer;
  transition: all 0.2s ease;
}

.connection-path:hover {
  stroke: #409eff;
  stroke-width: 3;
}

.connection-active {
  stroke: #409eff !important;
  stroke-width: 3 !important;
}

.connection-error {
  stroke: #f56c6c !important;
  stroke-dasharray: 5, 5;
}

.temp-connection {
  pointer-events: none;
}

/* 节点容器 */
.nodes-container {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.flow-node {
  position: absolute;
  width: 120px;
  min-height: 80px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: move;
  pointer-events: all;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.flow-node:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transform: translateY(-2px);
}

.node-selected {
  border-color: #409eff !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
}

.node-running {
  border-color: #67c23a !important;
  animation: pulse 1.5s infinite;
}

.node-error {
  border-color: #f56c6c !important;
  background: #fef0f0 !important;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #e4e7ed;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px 6px 0 0;
}

.node-header .node-icon {
  width: 20px;
  height: 20px;
  font-size: 12px;
  margin-right: 6px;
}

.node-title {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.flow-node:hover .node-actions {
  opacity: 1;
}

.node-content {
  padding: 8px;
  font-size: 11px;
  color: #606266;
  line-height: 1.3;
}

.node-description {
  margin-bottom: 6px;
}

.node-params {
  border-top: 1px solid #f0f0f0;
  padding-top: 6px;
}

.param-item {
  display: flex;
  margin-bottom: 2px;
}

.param-key {
  font-weight: 500;
  margin-right: 4px;
  color: #909399;
}

.param-value {
  color: #606266;
  word-break: break-all;
}

/* 端口样式 */
.input-ports,
.output-ports {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-ports {
  left: -8px;
}

.output-ports {
  right: -8px;
}

.port {
  display: flex;
  align-items: center;
  cursor: crosshair;
  position: relative;
}

.input-port {
  flex-direction: row;
}

.output-port {
  flex-direction: row-reverse;
}

.port-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  border: 2px solid white;
  transition: all 0.2s ease;
}

.port:hover .port-dot {
  background: #409eff;
  transform: scale(1.2);
}

.port-label {
  font-size: 10px;
  color: #909399;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 3px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.input-port .port-label {
  margin-left: 8px;
}

.output-port .port-label {
  margin-right: 8px;
}

.port:hover .port-label {
  opacity: 1;
}

/* 小地图 */
.minimap {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.minimap-content {
  padding: 8px;
}

.minimap-svg {
  display: block;
}

/* 右侧属性面板 */
.property-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.node-properties,
.connection-properties {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.empty-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

/* 底部状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: white;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
  color: #909399;
}

.status-left,
.status-right {
  display: flex;
  gap: 16px;
}

/* 运行结果对话框 */
.run-result {
  max-height: 400px;
  overflow-y: auto;
}

.step-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.step-content p {
  margin: 0 0 8px 0;
  color: #606266;
}

.step-data {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
}

.step-data pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .node-panel {
    width: 240px;
  }

  .property-panel {
    width: 260px;
  }
}

@media (max-width: 768px) {
  .toolbar-actions {
    flex-wrap: wrap;
    gap: 4px;
  }

  .toolbar-actions .el-button {
    padding: 8px 12px;
    font-size: 12px;
  }

  .node-panel,
  .property-panel {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 20;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .node-panel.active,
  .property-panel.active {
    transform: translateX(0);
  }
}

/* 滚动条样式 */
.node-categories::-webkit-scrollbar,
.node-properties::-webkit-scrollbar,
.connection-properties::-webkit-scrollbar,
.run-result::-webkit-scrollbar {
  width: 6px;
}

.node-categories::-webkit-scrollbar-track,
.node-properties::-webkit-scrollbar-track,
.connection-properties::-webkit-scrollbar-track,
.run-result::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.node-categories::-webkit-scrollbar-thumb,
.node-properties::-webkit-scrollbar-thumb,
.connection-properties::-webkit-scrollbar-thumb,
.run-result::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.node-categories::-webkit-scrollbar-thumb:hover,
.node-properties::-webkit-scrollbar-thumb:hover,
.connection-properties::-webkit-scrollbar-thumb:hover,
.run-result::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
