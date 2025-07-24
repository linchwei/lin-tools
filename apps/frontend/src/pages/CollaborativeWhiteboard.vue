<template>
  <div class="collaborative-whiteboard h-screen flex flex-col bg-gray-50">
    <!-- 顶部工具栏 -->
    <div class="toolbar bg-white shadow-sm border-b p-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-bold text-gray-800">协作白板</h1>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">房间ID:</span>
          <el-input v-model="roomId" size="small" class="w-32" @keyup.enter="joinRoom" />
          <el-button @click="joinRoom" type="primary" size="small">加入</el-button>
          <el-button @click="createRoom" type="success" size="small">创建房间</el-button>
        </div>
      </div>

      <!-- 在线用户 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">在线用户 ({{ onlineUsers.length }}):</span>
        <div class="flex gap-1">
          <div v-for="user in onlineUsers" :key="user.id"
            class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            :style="{ backgroundColor: user.color }" :title="user.name">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
        </div>
      </div>
    </div>

    <!-- 绘图工具栏 -->
    <div class="drawing-toolbar bg-white border-b p-3 flex items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">工具:</span>
        <el-radio-group v-model="currentTool" size="small">
          <el-radio-button value="pen">画笔</el-radio-button>
          <el-radio-button value="eraser">橡皮</el-radio-button>
          <el-radio-button value="line">直线</el-radio-button>
          <el-radio-button value="rectangle">矩形</el-radio-button>
          <el-radio-button value="circle">圆形</el-radio-button>
          <el-radio-button value="text">文字</el-radio-button>
        </el-radio-group>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">颜色:</span>
        <div class="flex gap-1">
          <div v-for="color in colors" :key="color" class="w-6 h-6 rounded cursor-pointer border-2"
            :class="{ 'border-gray-800': currentColor === color, 'border-gray-300': currentColor !== color }"
            :style="{ backgroundColor: color }" @click="currentColor = color" />
        </div>
        <el-color-picker v-model="currentColor" size="small" />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">粗细:</span>
        <el-slider v-model="brushSize" :min="1" :max="20" :show-tooltip="false" class="w-20" />
        <span class="text-xs text-gray-500">{{ brushSize }}px</span>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <el-button @click="clearCanvas" size="small" type="danger">清空画布</el-button>
        <el-button @click="saveCanvas" size="small">保存</el-button>
        <el-button @click="toggleGrid" size="small">{{ showGrid ? '隐藏' : '显示' }}网格</el-button>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-container flex-1 relative overflow-hidden">
      <canvas ref="canvasRef" class="absolute inset-0 cursor-crosshair" @mousedown="startDrawing" @mousemove="draw"
        @mouseup="stopDrawing" @mouseleave="stopDrawing" @touchstart="handleTouch" @touchmove="handleTouch"
        @touchend="stopDrawing" />

      <!-- 网格背景 -->
      <canvas v-if="showGrid" ref="gridCanvasRef" class="absolute inset-0 pointer-events-none opacity-20" />

      <!-- 其他用户的光标 -->
      <div v-for="cursor in otherCursors" :key="cursor.userId" class="absolute pointer-events-none z-10" :style="{
        left: cursor.x + 'px',
        top: cursor.y + 'px',
        transform: 'translate(-50%, -50%)'
      }">
        <div class="w-4 h-4 rounded-full border-2 border-white" :style="{ backgroundColor: cursor.color }" />
        <div class="text-xs text-white bg-black bg-opacity-75 px-1 rounded mt-1">
          {{ cursor.userName }}
        </div>
      </div>
    </div>

    <!-- 连接状态 -->
    <div class="status-bar bg-gray-100 px-4 py-2 text-sm text-gray-600 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full" :class="{
          'bg-green-500': connectionStatus === 'connected',
          'bg-yellow-500': connectionStatus === 'connecting',
          'bg-red-500': connectionStatus === 'disconnected'
        }" />
        <span>{{ getStatusText() }}</span>
      </div>
      <div>{{ drawingHistory.length }} 个操作</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { WhiteboardManager } from '@/utils/whiteboardManager'
import { WebRTCManager } from '@/utils/webrtcManager'

interface User {
  id: string
  name: string
  color: string
}

interface Cursor {
  userId: string
  userName: string
  x: number
  y: number
  color: string
}

interface DrawingOperation {
  id: string
  type: 'draw' | 'erase' | 'shape' | 'text' | 'clear'
  tool: string
  color: string
  size: number
  points: { x: number; y: number }[]
  timestamp: number
  userId: string
}

const canvasRef = ref<HTMLCanvasElement>()
const gridCanvasRef = ref<HTMLCanvasElement>()
const roomId = ref('')
const currentTool = ref('pen')
const currentColor = ref('#000000')
const brushSize = ref(3)
const showGrid = ref(true)

const colors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
]

const onlineUsers = ref<User[]>([])
const otherCursors = ref<Cursor[]>([])
const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const drawingHistory = ref<DrawingOperation[]>([])

let whiteboardManager: WhiteboardManager
let webrtcManager: WebRTCManager
let isDrawing = false
let lastPoint: { x: number; y: number } | null = null

onMounted(async () => {
  await nextTick()
  if (canvasRef.value && gridCanvasRef.value) {
    initCanvas()
    whiteboardManager = new WhiteboardManager(canvasRef.value)
    webrtcManager = new WebRTCManager()

    // 设置事件监听
    webrtcManager.onUserJoined = handleUserJoined
    webrtcManager.onUserLeft = handleUserLeft
    webrtcManager.onDrawingReceived = handleDrawingReceived
    webrtcManager.onCursorMoved = handleCursorMoved
    webrtcManager.onConnectionStatusChanged = handleConnectionStatusChanged
  }
})

const initCanvas = () => {
  const canvas = canvasRef.value!
  const gridCanvas = gridCanvasRef.value!
  const container = canvas.parentElement!

  // 设置画布尺寸
  const resizeCanvas = () => {
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    gridCanvas.width = rect.width
    gridCanvas.height = rect.height

    drawGrid()
  }

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
}

const drawGrid = () => {
  const canvas = gridCanvasRef.value!
  const ctx = canvas.getContext('2d')!
  const gridSize = 20

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1

  // 绘制垂直线
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }

  // 绘制水平线
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }
}

const getMousePos = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()

  if (e instanceof TouchEvent) {
    const touch = e.touches[0] || e.changedTouches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
  }

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

const startDrawing = (e: MouseEvent) => {
  isDrawing = true
  lastPoint = getMousePos(e)

  if (currentTool.value === 'pen' || currentTool.value === 'eraser') {
    whiteboardManager.startPath(lastPoint, {
      tool: currentTool.value,
      color: currentColor.value,
      size: brushSize.value
    })
  }
}

const draw = (e: MouseEvent) => {
  if (!isDrawing || !lastPoint) return

  const currentPoint = getMousePos(e)

  // 发送光标位置给其他用户
  webrtcManager.sendCursorPosition(currentPoint)

  if (currentTool.value === 'pen' || currentTool.value === 'eraser') {
    whiteboardManager.addPointToPath(currentPoint)

    // 发送绘图数据给其他用户
    const operation: DrawingOperation = {
      id: generateId(),
      type: 'draw',
      tool: currentTool.value,
      color: currentColor.value,
      size: brushSize.value,
      points: [lastPoint, currentPoint],
      timestamp: Date.now(),
      userId: webrtcManager.userId
    }

    webrtcManager.sendDrawingOperation(operation)
    drawingHistory.value.push(operation)
  }

  lastPoint = currentPoint
}

const stopDrawing = () => {
  if (!isDrawing) return

  isDrawing = false
  lastPoint = null

  if (currentTool.value === 'pen' || currentTool.value === 'eraser') {
    whiteboardManager.endPath()
  }
}

const handleTouch = (e: TouchEvent) => {
  e.preventDefault()

  if (e.type === 'touchstart') {
    startDrawing(e as any)
  } else if (e.type === 'touchmove') {
    draw(e as any)
  }
}

const createRoom = async () => {
  try {
    connectionStatus.value = 'connecting'
    const newRoomId = await webrtcManager.createRoom()
    roomId.value = newRoomId
    ElMessage.success(`房间创建成功: ${newRoomId}`)
  } catch (error) {
    ElMessage.error('创建房间失败')
    connectionStatus.value = 'disconnected'
  }
}

const joinRoom = async () => {
  if (!roomId.value.trim()) {
    ElMessage.warning('请输入房间ID')
    return
  }

  try {
    connectionStatus.value = 'connecting'
    await webrtcManager.joinRoom(roomId.value)
    ElMessage.success('加入房间成功')
  } catch (error) {
    ElMessage.error('加入房间失败')
    connectionStatus.value = 'disconnected'
  }
}

const clearCanvas = () => {
  whiteboardManager.clear()

  const operation: DrawingOperation = {
    id: generateId(),
    type: 'clear',
    tool: 'clear',
    color: '',
    size: 0,
    points: [],
    timestamp: Date.now(),
    userId: webrtcManager.userId
  }

  webrtcManager.sendDrawingOperation(operation)
  drawingHistory.value.push(operation)
}

const saveCanvas = () => {
  const canvas = canvasRef.value!
  const link = document.createElement('a')
  link.download = `whiteboard-${Date.now()}.png`
  link.href = canvas.toDataURL()
  link.click()
}

const toggleGrid = () => {
  showGrid.value = !showGrid.value
  if (showGrid.value) {
    nextTick(() => drawGrid())
  }
}

// WebRTC 事件处理
const handleUserJoined = (user: User) => {
  onlineUsers.value.push(user)
  ElMessage.info(`${user.name} 加入了房间`)
}

const handleUserLeft = (userId: string) => {
  const user = onlineUsers.value.find(u => u.id === userId)
  onlineUsers.value = onlineUsers.value.filter(u => u.id !== userId)
  otherCursors.value = otherCursors.value.filter(c => c.userId !== userId)

  if (user) {
    ElMessage.info(`${user.name} 离开了房间`)
  }
}

const handleDrawingReceived = (operation: DrawingOperation) => {
  whiteboardManager.executeOperation(operation)
  drawingHistory.value.push(operation)
}

const handleCursorMoved = (cursor: Cursor) => {
  const existingIndex = otherCursors.value.findIndex(c => c.userId === cursor.userId)
  if (existingIndex >= 0) {
    otherCursors.value[existingIndex] = cursor
  } else {
    otherCursors.value.push(cursor)
  }
}

const handleConnectionStatusChanged = (status: typeof connectionStatus.value) => {
  connectionStatus.value = status
}

const getStatusText = () => {
  switch (connectionStatus.value) {
    case 'connected': return '已连接'
    case 'connecting': return '连接中...'
    case 'disconnected': return '未连接'
  }
}

const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

onBeforeUnmount(() => {
  webrtcManager?.disconnect()
})
</script>

<style scoped>
.canvas-container {
  background: #ffffff;
}

.cursor-crosshair {
  cursor: crosshair;
}

.cursor-crosshair[data-tool="eraser"] {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="black" stroke-width="2"/></svg>') 10 10, auto;
}
</style>