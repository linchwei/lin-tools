<template>
  <div class="data-dashboard">
    <!-- 头部状态栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title">🚀 实时数据大屏</h1>
        <div class="connection-status">
          <div class="status-indicator" :class="connectionStatus">
            <div class="status-dot"></div>
            <span>{{ connectionText }}</span>
          </div>
          <div class="last-update">
            最后更新: {{ lastUpdateTime }}
          </div>
        </div>
      </div>

      <div class="header-right">
        <div class="control-buttons">
          <el-button :type="isAutoRefresh ? 'success' : 'default'" @click="toggleAutoRefresh" size="small">
            <el-icon>
              <Timer />
            </el-icon>
            {{ isAutoRefresh ? '停止自动刷新' : '开启自动刷新' }}
          </el-button>

          <el-button @click="refreshData" :loading="isRefreshing" size="small">
            <el-icon>
              <Refresh />
            </el-icon>
            手动刷新
          </el-button>

          <el-button @click="toggleFullscreen" size="small">
            <el-icon>
              <FullScreen />
            </el-icon>
            全屏
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="overview-cards">
      <div class="card-grid">
        <div class="overview-card" v-for="(card, index) in overviewCards" :key="index">
          <div class="card-icon" :style="{ backgroundColor: card.color }">
            <component :is="card.icon" />
          </div>
          <div class="card-content">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-value">
              <span class="value">{{ formatNumber(card.value) }}</span>
              <span class="unit">{{ card.unit }}</span>
            </div>
            <div class="card-trend" :class="card.trend > 0 ? 'positive' : 'negative'">
              <el-icon>
                <component :is="card.trend > 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
              {{ Math.abs(card.trend) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <div class="charts-grid">
        <!-- 实时数据趋势 -->
        <div class="chart-panel large">
          <div class="panel-header">
            <h3>📈 实时数据趋势</h3>
            <div class="chart-controls">
              <el-select v-model="selectedMetric" size="small" @change="updateLineChart">
                <el-option label="CPU使用率" value="cpu" />
                <el-option label="内存使用率" value="memory" />
                <el-option label="网络流量" value="network" />
                <el-option label="磁盘IO" value="disk" />
              </el-select>
            </div>
          </div>
          <div class="chart-content">
            <div ref="lineChartRef" class="chart-container"></div>
          </div>
        </div>

        <!-- 系统状态分布 -->
        <div class="chart-panel medium">
          <div class="panel-header">
            <h3>🔧 系统状态分布</h3>
          </div>
          <div class="chart-content">
            <div ref="pieChartRef" class="chart-container"></div>
          </div>
        </div>

        <!-- 服务器性能 -->
        <div class="chart-panel medium">
          <div class="panel-header">
            <h3>⚡ 服务器性能</h3>
          </div>
          <div class="chart-content">
            <div ref="barChartRef" class="chart-container"></div>
          </div>
        </div>

        <!-- 关键指标 -->
        <div class="metrics-panel">
          <div class="panel-header">
            <h3>📊 关键指标</h3>
            <div class="metrics-summary">
              <div class="summary-item">
                <span class="summary-label">系统状态</span>
                <el-tag :type="getSystemStatusType()" size="small">{{ getSystemStatus() }}</el-tag>
              </div>
            </div>
          </div>
          <div class="metrics-grid">
            <!-- CPU 指标 -->
            <div class="metric-card cpu-metric">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="icon-cpu">🖥️</i>
                </div>
                <div class="metric-info">
                  <h4 class="metric-title">CPU 使用率</h4>
                  <div class="metric-value">{{ currentMetrics.cpu }}%</div>
                </div>
                <div class="metric-status" :class="getMetricStatusClass(currentMetrics.cpu)">
                  <div class="status-dot"></div>
                </div>
              </div>
              <div class="metric-chart">
                <div ref="cpuGaugeRef" class="gauge-container"></div>
              </div>
              <div class="metric-footer">
                <div class="metric-trend" :class="getCpuTrend()">
                  <span class="trend-icon">{{ getCpuTrendIcon() }}</span>
                  <span class="trend-text">{{ getCpuTrendText() }}</span>
                </div>
                <div class="metric-detail">
                  <span>核心: {{ getCpuCores() }}</span>
                </div>
              </div>
            </div>

            <!-- 内存指标 -->
            <div class="metric-card memory-metric">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="icon-memory">💾</i>
                </div>
                <div class="metric-info">
                  <h4 class="metric-title">内存使用率</h4>
                  <div class="metric-value">{{ currentMetrics.memory }}%</div>
                </div>
                <div class="metric-status" :class="getMetricStatusClass(currentMetrics.memory)">
                  <div class="status-dot"></div>
                </div>
              </div>
              <div class="metric-chart">
                <div ref="memoryGaugeRef" class="gauge-container"></div>
              </div>
              <div class="metric-footer">
                <div class="metric-trend" :class="getMemoryTrend()">
                  <span class="trend-icon">{{ getMemoryTrendIcon() }}</span>
                  <span class="trend-text">{{ getMemoryTrendText() }}</span>
                </div>
                <div class="metric-detail">
                  <span>{{ getMemoryUsage() }}</span>
                </div>
              </div>
            </div>

            <!-- 磁盘指标 -->
            <div class="metric-card disk-metric">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="icon-disk">💿</i>
                </div>
                <div class="metric-info">
                  <h4 class="metric-title">磁盘使用率</h4>
                  <div class="metric-value">{{ currentMetrics.disk }}%</div>
                </div>
                <div class="metric-status" :class="getMetricStatusClass(currentMetrics.disk)">
                  <div class="status-dot"></div>
                </div>
              </div>
              <div class="metric-chart">
                <div ref="diskGaugeRef" class="gauge-container"></div>
              </div>
              <div class="metric-footer">
                <div class="metric-trend" :class="getDiskTrend()">
                  <span class="trend-icon">{{ getDiskTrendIcon() }}</span>
                  <span class="trend-text">{{ getDiskTrendText() }}</span>
                </div>
                <div class="metric-detail">
                  <span>{{ getDiskUsage() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 实时日志 -->
        <div class="logs-panel">
          <div class="panel-header">
            <h3>📝 实时日志</h3>
            <div class="log-controls">
              <el-button size="small" @click="clearLogs">清空</el-button>
              <el-switch v-model="autoScroll" size="small">
                <template #active-text>自动滚动</template>
              </el-switch>
            </div>
          </div>
          <div class="logs-content" ref="logsContainer">
            <div v-for="(log, index) in recentLogs" :key="index" class="log-item" :class="log.level">
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>

        <!-- 地理分布 -->
        <div class="chart-panel large">
          <div class="panel-header">
            <h3>🌍 全球数据中心分布</h3>
            <div class="chart-controls">
              <el-button size="small" @click="resetGeoZoom">重置视图</el-button>
              <el-switch v-model="showConnections" size="small">
                <template #active-text>显示连接</template>
              </el-switch>
            </div>
          </div>
          <div class="chart-content">
            <div ref="geoMapRef" class="chart-container geo-map-container">
              <div class="geo-legend">
                <div class="legend-item" v-for="item in geoLegend" :key="item.label">
                  <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 网络拓扑 -->
        <div class="chart-panel medium">
          <div class="panel-header">
            <h3>🔗 网络拓扑</h3>
          </div>
          <div class="chart-content">
            <div ref="networkTopologyRef" class="chart-container network-container"></div>
          </div>
        </div>

        <!-- 数据流动画 -->
        <div class="chart-panel medium">
          <div class="panel-header">
            <h3>💫 实时数据流</h3>
          </div>
          <div class="chart-content">
            <div ref="particleFlowRef" class="chart-container flow-container"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="数据详情" width="800px">
      <div class="detail-content">
        <el-table :data="detailData" height="400">
          <el-table-column prop="timestamp" label="时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column prop="metric" label="指标" width="120" />
          <el-table-column prop="value" label="数值" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status) as any">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Timer, Refresh, FullScreen, Monitor, User } from '@element-plus/icons-vue'
import { ServerIcon, WifiIcon } from '@heroicons/vue/24/outline'
import { WebSocketManager } from '@/utils/websocketManager'
import { D3Visualizer } from '@/utils/d3Visualizer'
import { AdvancedVisualizer } from '@/utils/advancedVisualizer'
import { GeoVisualizer } from '@/utils/geoVisualizer'
import { worldMapData, majorCities, connections, getAllHotspots } from '@/utils/worldMapData'

// 响应式数据
const connectionStatus = ref<'connected' | 'connecting' | 'disconnected'>('disconnected')
const lastUpdateTime = ref('')
const isAutoRefresh = ref(true)
const isRefreshing = ref(false)
const selectedMetric = ref('cpu')
const autoScroll = ref(true)
const showDetailDialog = ref(false)
const showConnections = ref(true)

// 当前指标数据
const currentMetrics = ref({
  cpu: 45,
  memory: 68,
  disk: 32
})

// 历史指标数据用于趋势分析
const previousMetrics = ref({
  cpu: 42,
  memory: 65,
  disk: 35
})

// 图表引用
const lineChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
const cpuGaugeRef = ref<HTMLElement>()
const memoryGaugeRef = ref<HTMLElement>()
const diskGaugeRef = ref<HTMLElement>()
const mapChartRef = ref<HTMLElement>()
const logsContainer = ref<HTMLElement>()
const geoMapRef = ref<HTMLElement>()
const particleFlowRef = ref<HTMLElement>()
const networkTopologyRef = ref<HTMLElement>()

// 数据
const overviewCards = ref([
  {
    title: '在线用户',
    value: 1234,
    unit: '人',
    trend: 12.5,
    color: '#4facfe',
    icon: User
  },
  {
    title: 'CPU使用率',
    value: 68.5,
    unit: '%',
    trend: -3.2,
    color: '#00f2fe',
    icon: Monitor
  },
  {
    title: '内存使用',
    value: 4.2,
    unit: 'GB',
    trend: 8.1,
    color: '#43e97b',
    icon: ServerIcon
  },
  {
    title: '网络流量',
    value: 256.8,
    unit: 'MB/s',
    trend: 15.3,
    color: '#38f9d7',
    icon: WifiIcon
  }
])

const recentLogs = ref<Array<{
  timestamp: number
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
}>>([])

const detailData = ref([])
const timeSeriesData = ref<Array<{ timestamp: number; cpu: number; memory: number; network: number; disk: number }>>([])

const mapLegend = [
  { label: '高活跃度', color: '#ff4757' },
  { label: '中活跃度', color: '#ffa502' },
  { label: '低活跃度', color: '#2ed573' }
]

const geoLegend = [
  { label: '主要数据中心', color: '#00f2fe' },
  { label: '次要节点', color: '#4facfe' },
  { label: '数据流', color: '#43e97b' },
  { label: '热点区域', color: '#ff6b6b' }
]

// WebSocket和可视化实例
let wsManager: WebSocketManager | null = null
let lineChart: D3Visualizer | null = null
let pieChart: D3Visualizer | null = null
let barChart: D3Visualizer | null = null
let cpuGauge: D3Visualizer | null = null
let memoryGauge: D3Visualizer | null = null
let diskGauge: D3Visualizer | null = null
let geoVisualizer: GeoVisualizer | null = null
let advancedVisualizer: AdvancedVisualizer | null = null
let networkVisualizer: AdvancedVisualizer | null = null

// 计算属性
const connectionText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected': return '已连接'
    case 'connecting': return '连接中...'
    case 'disconnected': return '未连接'
    default: return '未知状态'
  }
})

// 生命周期
onMounted(async () => {
  await nextTick()
  initWebSocket()
  initCharts()
  startDataGeneration()
})

onUnmounted(() => {
  wsManager?.close()
  geoVisualizer?.cleanup()
  advancedVisualizer?.cleanup()
  networkVisualizer?.cleanup()
})

// 方法
const initWebSocket = () => {
  wsManager = new WebSocketManager({
    url: 'ws://localhost:3001/dashboard',
    onOpen: () => {
      connectionStatus.value = 'connected'
      console.log('Dashboard WebSocket连接成功')
    },
    onClose: () => {
      connectionStatus.value = 'disconnected'
    },
    onError: (error) => {
      console.error('Dashboard WebSocket错误:', error)
      connectionStatus.value = 'disconnected'
    },
    onReconnect: (attempt) => {
      connectionStatus.value = 'connecting'
      console.log(`Dashboard WebSocket重连尝试: ${attempt}`)
    }
  })

  // 监听不同类型的数据
  wsManager.on('metrics', handleMetricsData)
  wsManager.on('logs', handleLogsData)
  wsManager.on('status', handleStatusData)

  wsManager.connect().catch(error => {
    console.error('WebSocket连接失败:', error)
    // 如果WebSocket连接失败，使用模拟数据
    startDataGeneration()
  })
}

const initCharts = () => {
  if (!lineChartRef.value || !pieChartRef.value || !barChartRef.value) return

  // 初始化图表
  lineChart = new D3Visualizer(lineChartRef.value, {
    width: lineChartRef.value.clientWidth,
    height: 300,
    colors: ['#4facfe', '#00f2fe']
  })

  pieChart = new D3Visualizer(pieChartRef.value, {
    width: pieChartRef.value.clientWidth,
    height: 300,
    colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#ff6b6b']
  })

  barChart = new D3Visualizer(barChartRef.value, {
    width: barChartRef.value.clientWidth,
    height: 300,
    colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7']
  })

  // 初始化仪表盘
  if (cpuGaugeRef.value) {
    cpuGauge = new D3Visualizer(cpuGaugeRef.value, {
      width: 200,
      height: 150,
      colors: ['#4facfe']
    })
  }

  if (memoryGaugeRef.value) {
    memoryGauge = new D3Visualizer(memoryGaugeRef.value, {
      width: 200,
      height: 150,
      colors: ['#00f2fe']
    })
  }

  if (diskGaugeRef.value) {
    diskGauge = new D3Visualizer(diskGaugeRef.value, {
      width: 200,
      height: 150,
      colors: ['#43e97b']
    })
  }

  // 初始化地理可视化
  if (geoMapRef.value) {
    geoVisualizer = new GeoVisualizer(geoMapRef.value, {
      width: geoMapRef.value.clientWidth,
      height: 400,
      colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#ff6b6b'],
      enableZoom: true,
      showGraticule: true
    })

    // 渲染世界地图
    geoVisualizer.renderWorldMap(worldMapData)

    // 渲染城市点
    geoVisualizer.renderCityPoints(majorCities, {
      radius: 6,
      color: '#00f2fe',
      showLabels: true
    })

    // 渲染热点
    const hotspots = getAllHotspots()
    geoVisualizer.renderHeatmapPoints(hotspots, {
      maxRadius: 30
    })

    // 渲染连接线
    if (showConnections.value) {
      geoVisualizer.renderConnections(connections, {
        strokeWidth: 2,
        animated: true
      })
    }
  }

  // 初始化粒子流可视化
  if (particleFlowRef.value) {
    advancedVisualizer = new AdvancedVisualizer(
      particleFlowRef.value,
      particleFlowRef.value.clientWidth,
      300
    )

    // 创建数据流动画
    initParticleFlow()
  }

  // 初始化网络拓扑
  if (networkTopologyRef.value) {
    networkVisualizer = new AdvancedVisualizer(
      networkTopologyRef.value,
      networkTopologyRef.value.clientWidth,
      300
    )

    // 创建网络拓扑
    initNetworkTopology()
  }

  // 初始渲染
  updateCharts()
}

const startDataGeneration = () => {
  // 生成初始数据
  generateTimeSeriesData()

  if (isAutoRefresh.value) {
    setInterval(() => {
      generateTimeSeriesData()
      updateCharts()
      updateOverviewCards()
      updateMetrics()
      generateLogs()
      lastUpdateTime.value = new Date().toLocaleTimeString()
    }, 2000)
  }
}

const generateTimeSeriesData = () => {
  const now = Date.now()
  const newData = {
    timestamp: now,
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    network: Math.random() * 500,
    disk: Math.random() * 100
  }

  timeSeriesData.value.push(newData)

  // 保持最近50个数据点
  if (timeSeriesData.value.length > 50) {
    timeSeriesData.value.shift()
  }
}

const generateLogs = () => {
  const levels = ['info', 'warning', 'error', 'success'] as const
  const messages = [
    '用户登录成功',
    '数据库连接正常',
    '缓存更新完成',
    '系统负载较高',
    '磁盘空间不足',
    '网络延迟异常',
    '服务重启完成',
    '备份任务执行'
  ]

  const newLog = {
    timestamp: Date.now(),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)]
  }

  recentLogs.value.push(newLog)

  // 保持最近100条日志
  if (recentLogs.value.length > 100) {
    recentLogs.value.shift()
  }

  // 自动滚动到底部
  if (autoScroll.value && logsContainer.value) {
    nextTick(() => {
      logsContainer.value!.scrollTop = logsContainer.value!.scrollHeight
    })
  }
}

const updateCharts = () => {
  if (!timeSeriesData.value.length) return

  // 更新折线图
  updateLineChart()

  // 更新饼图
  const statusData = [
    { name: '正常', value: 65 },
    { name: '警告', value: 20 },
    { name: '错误', value: 10 },
    { name: '离线', value: 5 }
  ]
  pieChart?.renderPieChart(statusData, { valueKey: 'value', labelKey: 'name' })

  // 更新柱状图
  const serverData = [
    { name: '服务器1', value: Math.random() * 100 },
    { name: '服务器2', value: Math.random() * 100 },
    { name: '服务器3', value: Math.random() * 100 },
    { name: '服务器4', value: Math.random() * 100 }
  ]
  barChart?.renderBarChart(serverData, { xKey: 'name', yKey: 'value' })

  // 更新仪表盘
  const latestData = timeSeriesData.value[timeSeriesData.value.length - 1]
  if (latestData) {
    cpuGauge?.renderGauge(latestData.cpu, { title: 'CPU使用率', unit: '%' })
    memoryGauge?.renderGauge(latestData.memory, { title: '内存使用率', unit: '%' })
    diskGauge?.renderGauge(latestData.disk, { title: '磁盘使用率', unit: '%' })
  }
}

const updateLineChart = () => {
  if (!lineChart || !timeSeriesData.value.length) return

  const chartData = timeSeriesData.value.map(item => ({
    timestamp: item.timestamp,
    value: item[selectedMetric.value as keyof typeof item] as number,
    name: selectedMetric.value
  }))

  lineChart.renderLineChart(chartData, { xKey: 'timestamp', yKey: 'value' })
}

const updateOverviewCards = () => {
  if (!timeSeriesData.value.length) return

  const latestData = timeSeriesData.value[timeSeriesData.value.length - 1]

  overviewCards.value[1].value = Number(latestData.cpu.toFixed(1))
  overviewCards.value[2].value = Number((latestData.memory * 8 / 100).toFixed(1))
  overviewCards.value[3].value = Number((latestData.network / 4).toFixed(1))

  // 随机更新趋势
  overviewCards.value.forEach(card => {
    card.trend = (Math.random() - 0.5) * 20
  })
}

const handleMetricsData = (data: any) => {
  console.log('收到指标数据:', data)
  // 处理实时指标数据
}

const handleLogsData = (data: any) => {
  console.log('收到日志数据:', data)
  // 处理实时日志数据
}

const handleStatusData = (data: any) => {
  console.log('收到状态数据:', data)
  // 处理状态更新
}

const toggleAutoRefresh = () => {
  isAutoRefresh.value = !isAutoRefresh.value
  if (isAutoRefresh.value) {
    startDataGeneration()
  }
}

const refreshData = async () => {
  isRefreshing.value = true
  try {
    // 模拟数据刷新
    await new Promise(resolve => setTimeout(resolve, 1000))
    generateTimeSeriesData()
    updateCharts()
    updateOverviewCards()
    lastUpdateTime.value = new Date().toLocaleTimeString()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    isRefreshing.value = false
  }
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

const clearLogs = () => {
  recentLogs.value = []
  ElMessage.success('日志已清空')
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatDateTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const types: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    '正常': 'success',
    '警告': 'warning',
    '错误': 'danger',
    '离线': 'info'
  }
  return types[status] || 'info'
}

// 地理可视化相关方法
const resetGeoZoom = () => {
  if (geoVisualizer) {
    geoVisualizer.resetZoom()
  }
}

// 初始化粒子流动画
const initParticleFlow = () => {
  if (!advancedVisualizer) return

  // 创建多个数据流路径
  const paths = [
    'M50,150 Q200,50 350,150',
    'M50,100 Q200,200 350,100',
    'M50,200 Q200,100 350,200'
  ]

  paths.forEach((pathData, index) => {
    setTimeout(() => {
      advancedVisualizer!.createParticleFlow({
        pathData,
        particleCount: 8,
        speed: 2,
        particleSize: 3,
        colors: ['#4facfe', '#00f2fe', '#43e97b'],
        duration: 3000
      })
    }, index * 1000)
  })

  // 创建脉冲动画
  const pulsePoints = [
    [100, 150],
    [300, 100],
    [200, 200]
  ]

  pulsePoints.forEach((center, index) => {
    setTimeout(() => {
      advancedVisualizer!.createPulseAnimation({
        center: center as [number, number],
        maxRadius: 30,
        duration: 2000,
        color: '#00f2fe',
        opacity: 0.6,
        strokeWidth: 2
      })
    }, index * 500)
  })
}

// 初始化网络拓扑
const initNetworkTopology = () => {
  if (!networkVisualizer) return

  // 创建网络节点连接
  const nodes = [
    { x: 100, y: 100, name: '主节点' },
    { x: 200, y: 50, name: '节点A' },
    { x: 300, y: 100, name: '节点B' },
    { x: 200, y: 150, name: '节点C' },
    { x: 250, y: 200, name: '节点D' }
  ]

  // 创建连接线
  const connections = [
    { source: nodes[0], target: nodes[1] },
    { source: nodes[0], target: nodes[2] },
    { source: nodes[0], target: nodes[3] },
    { source: nodes[1], target: nodes[2] },
    { source: nodes[2], target: nodes[4] }
  ]

  connections.forEach((connection, index) => {
    setTimeout(() => {
      networkVisualizer!.createDataFlow(
        [connection.source.x, connection.source.y],
        [connection.target.x, connection.target.y],
        [{ name: `数据包${index + 1}`, value: Math.random() * 100 }]
      )
    }, index * 800)
  })

  // 添加节点脉冲
  nodes.forEach((node, index) => {
    setTimeout(() => {
      networkVisualizer!.createPulseAnimation({
        center: [node.x, node.y],
        maxRadius: 20,
        duration: 1500,
        color: '#43e97b',
        opacity: 0.7,
        strokeWidth: 1
      })
    }, index * 300)
  })
}

// 系统状态相关方法
const getSystemStatus = () => {
  const avgUsage = (currentMetrics.value.cpu + currentMetrics.value.memory + currentMetrics.value.disk) / 3
  if (avgUsage < 50) return '正常'
  if (avgUsage < 80) return '警告'
  return '危险'
}

const getSystemStatusType = (): 'success' | 'warning' | 'danger' => {
  const status = getSystemStatus()
  if (status === '正常') return 'success'
  if (status === '警告') return 'warning'
  return 'danger'
}

// 指标状态样式
const getMetricStatusClass = (value: number) => {
  if (value < 50) return 'status-normal'
  if (value < 80) return 'status-warning'
  return 'status-danger'
}

// CPU 相关方法
const getCpuTrend = () => {
  const diff = currentMetrics.value.cpu - previousMetrics.value.cpu
  if (diff > 2) return 'trend-up'
  if (diff < -2) return 'trend-down'
  return 'trend-stable'
}

const getCpuTrendIcon = () => {
  const trend = getCpuTrend()
  if (trend === 'trend-up') return '↗️'
  if (trend === 'trend-down') return '↘️'
  return '➡️'
}

const getCpuTrendText = () => {
  const diff = Math.abs(currentMetrics.value.cpu - previousMetrics.value.cpu)
  const trend = getCpuTrend()
  if (trend === 'trend-up') return `上升 ${diff.toFixed(1)}%`
  if (trend === 'trend-down') return `下降 ${diff.toFixed(1)}%`
  return '稳定'
}

const getCpuCores = () => {
  return '8核心'
}

// 内存相关方法
const getMemoryTrend = () => {
  const diff = currentMetrics.value.memory - previousMetrics.value.memory
  if (diff > 2) return 'trend-up'
  if (diff < -2) return 'trend-down'
  return 'trend-stable'
}

const getMemoryTrendIcon = () => {
  const trend = getMemoryTrend()
  if (trend === 'trend-up') return '↗️'
  if (trend === 'trend-down') return '↘️'
  return '➡️'
}

const getMemoryTrendText = () => {
  const diff = Math.abs(currentMetrics.value.memory - previousMetrics.value.memory)
  const trend = getMemoryTrend()
  if (trend === 'trend-up') return `上升 ${diff.toFixed(1)}%`
  if (trend === 'trend-down') return `下降 ${diff.toFixed(1)}%`
  return '稳定'
}

const getMemoryUsage = () => {
  const used = (currentMetrics.value.memory / 100 * 16).toFixed(1)
  return `${used}GB / 16GB`
}

// 磁盘相关方法
const getDiskTrend = () => {
  const diff = currentMetrics.value.disk - previousMetrics.value.disk
  if (diff > 2) return 'trend-up'
  if (diff < -2) return 'trend-down'
  return 'trend-stable'
}

const getDiskTrendIcon = () => {
  const trend = getDiskTrend()
  if (trend === 'trend-up') return '↗️'
  if (trend === 'trend-down') return '↘️'
  return '➡️'
}

const getDiskTrendText = () => {
  const diff = Math.abs(currentMetrics.value.disk - previousMetrics.value.disk)
  const trend = getDiskTrend()
  if (trend === 'trend-up') return `上升 ${diff.toFixed(1)}%`
  if (trend === 'trend-down') return `下降 ${diff.toFixed(1)}%`
  return '稳定'
}

const getDiskUsage = () => {
  const used = (currentMetrics.value.disk / 100 * 500).toFixed(0)
  return `${used}GB / 500GB`
}

// 更新指标数据
const updateMetrics = () => {
  // 保存之前的数据用于趋势分析
  previousMetrics.value = { ...currentMetrics.value }

  // 模拟数据变化
  currentMetrics.value.cpu = Math.max(0, Math.min(100, currentMetrics.value.cpu + (Math.random() - 0.5) * 10))
  currentMetrics.value.memory = Math.max(0, Math.min(100, currentMetrics.value.memory + (Math.random() - 0.5) * 8))
  currentMetrics.value.disk = Math.max(0, Math.min(100, currentMetrics.value.disk + (Math.random() - 0.5) * 3))
}

// 响应式处理
const handleResize = () => {
  nextTick(() => {
    if (lineChartRef.value) {
      lineChart?.resize(lineChartRef.value.clientWidth, 300)
    }
    if (pieChartRef.value) {
      pieChart?.resize(pieChartRef.value.clientWidth, 300)
    }
    if (barChartRef.value) {
      barChart?.resize(barChartRef.value.clientWidth, 300)
    }
    if (geoMapRef.value) {
      geoVisualizer?.resize(geoMapRef.value.clientWidth, 400)
    }
    if (particleFlowRef.value) {
      advancedVisualizer?.resize(particleFlowRef.value.clientWidth, 300)
    }
    if (networkTopologyRef.value) {
      networkVisualizer?.resize(networkTopologyRef.value.clientWidth, 300)
    }
    updateCharts()
  })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.data-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.connection-status {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.connected .status-dot {
  background: #00f2fe;
  box-shadow: 0 0 10px #00f2fe;
}

.status-indicator.connecting .status-dot {
  background: #ffa502;
  animation: pulse 1.5s infinite;
}

.status-indicator.disconnected .status-dot {
  background: #ff4757;
}

.last-update {
  font-size: 12px;
  color: #8892b0;
}

.control-buttons {
  display: flex;
  gap: 12px;
}

.overview-cards {
  margin-bottom: 30px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.overview-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(79, 172, 254, 0.2);
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #8892b0;
  margin-bottom: 8px;
}

.card-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.value {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
}

.unit {
  font-size: 14px;
  color: #8892b0;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.card-trend.positive {
  color: #00f2fe;
}

.card-trend.negative {
  color: #ff4757;
}

.charts-container {
  margin-bottom: 30px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

.chart-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-panel:hover {
  box-shadow: 0 10px 30px rgba(79, 172, 254, 0.1);
}

.chart-panel.large {
  grid-column: span 8;
}

.chart-panel.medium {
  grid-column: span 4;
}

/* 关键指标面板样式 */
.metrics-panel {
  grid-column: span 12;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  overflow: hidden;
}

.metrics-summary {
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.logs-panel {
  grid-column: span 6;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.chart-content {
  padding: 20px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

/* 指标网格布局 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 24px;
}

/* 指标卡片样式 */
.metric-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(79, 172, 254, 0.2);
  border-color: rgba(79, 172, 254, 0.3);
}

.metric-card:hover::before {
  opacity: 1;
}

/* CPU 指标特殊样式 */
.cpu-metric::before {
  background: linear-gradient(90deg, #ff6b6b 0%, #ffa502 100%);
}

.cpu-metric:hover {
  box-shadow: 0 12px 32px rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.3);
}

/* 内存指标特殊样式 */
.memory-metric::before {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.memory-metric:hover {
  box-shadow: 0 12px 32px rgba(79, 172, 254, 0.2);
  border-color: rgba(79, 172, 254, 0.3);
}

/* 磁盘指标特殊样式 */
.disk-metric::before {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.disk-metric:hover {
  box-shadow: 0 12px 32px rgba(67, 233, 123, 0.2);
  border-color: rgba(67, 233, 123, 0.3);
}

/* 指标头部 */
.metric-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.metric-info {
  flex: 1;
}

.metric-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.metric-value {
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.metric-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.status-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-normal .status-dot {
  background: #43e97b;
  box-shadow: 0 0 8px rgba(67, 233, 123, 0.6);
}

.status-warning .status-dot {
  background: #ffa502;
  box-shadow: 0 0 8px rgba(255, 165, 2, 0.6);
}

.status-danger .status-dot {
  background: #ff4757;
  box-shadow: 0 0 8px rgba(255, 71, 87, 0.6);
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

/* 指标图表区域 */
.metric-chart {
  margin: 16px 0;
}

.gauge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
}

/* 指标底部信息 */
.metric-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.trend-up {
  color: #ff4757;
}

.trend-down {
  color: #43e97b;
}

.trend-stable {
  color: rgba(255, 255, 255, 0.7);
}

.trend-icon {
  font-size: 14px;
}

.metric-detail {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.logs-content {
  height: 300px;
  overflow-y: auto;
  padding: 0 20px 20px;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;
  font-family: 'Monaco', monospace;
}

.log-time {
  color: #8892b0;
  min-width: 80px;
}

.log-level {
  min-width: 60px;
  font-weight: 600;
}

.log-item.info .log-level {
  color: #00f2fe;
}

.log-item.warning .log-level {
  color: #ffa502;
}

.log-item.error .log-level {
  color: #ff4757;
}

.log-item.success .log-level {
  color: #2ed573;
}

.log-message {
  flex: 1;
  color: #ccd6f6;
}

.map-container {
  position: relative;
}

.map-legend {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.log-controls,
.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 地理可视化样式 */
.geo-map-container {
  position: relative;
  overflow: hidden;
}

.geo-legend {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 网络拓扑样式 */
.network-container {
  background: radial-gradient(circle at center, rgba(79, 172, 254, 0.1) 0%, transparent 70%);
  border-radius: 8px;
  overflow: hidden;
}

/* 粒子流样式 */
.flow-container {
  background: linear-gradient(45deg, rgba(79, 172, 254, 0.05) 0%, rgba(0, 242, 254, 0.05) 100%);
  border-radius: 8px;
  overflow: hidden;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-panel.large {
    grid-column: span 12;
  }

  .chart-panel.medium {
    grid-column: span 6;
  }

  .metrics-panel,
  .logs-panel {
    grid-column: span 12;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .header-left {
    flex-direction: column;
    gap: 15px;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-panel.large,
  .chart-panel.medium,
  .metrics-panel,
  .logs-panel {
    grid-column: span 1;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* 滚动条样式 */
.logs-content::-webkit-scrollbar {
  width: 6px;
}

.logs-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.logs-content::-webkit-scrollbar-thumb {
  background: rgba(79, 172, 254, 0.5);
  border-radius: 3px;
}

.logs-content::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 172, 254, 0.7);
}
</style>
