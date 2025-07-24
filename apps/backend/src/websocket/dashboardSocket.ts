import { Server as SocketIOServer } from 'socket.io'
import { Server } from 'http'

export interface DashboardData {
  metrics: {
    cpu: number
    memory: number
    network: number
    disk: number
    timestamp: number
  }
  logs: Array<{
    level: 'info' | 'warning' | 'error' | 'success'
    message: string
    timestamp: number
  }>
  status: {
    online: number
    offline: number
    total: number
  }
}

export class DashboardSocketManager {
  private io: SocketIOServer
  private dataInterval: NodeJS.Timeout | null = null
  private connectedClients = new Set<string>()

  constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      path: '/dashboard'
    })

    this.setupEventHandlers()
    this.startDataGeneration()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Dashboard client connected: ${socket.id}`)
      this.connectedClients.add(socket.id)

      // 发送初始数据
      this.sendInitialData(socket)

      // 处理心跳
      socket.on('heartbeat', (data) => {
        socket.emit('heartbeat', { timestamp: Date.now() })
      })

      // 处理客户端请求
      socket.on('request-data', (type: string) => {
        this.handleDataRequest(socket, type)
      })

      // 处理断开连接
      socket.on('disconnect', () => {
        console.log(`Dashboard client disconnected: ${socket.id}`)
        this.connectedClients.delete(socket.id)
      })
    })
  }

  private sendInitialData(socket: any) {
    // 发送历史数据
    const historicalData = this.generateHistoricalData()
    socket.emit('historical-data', historicalData)

    // 发送当前状态
    const currentStatus = this.generateStatusData()
    socket.emit('status', currentStatus)
  }

  private handleDataRequest(socket: any, type: string) {
    switch (type) {
      case 'metrics':
        socket.emit('metrics', this.generateMetricsData())
        break
      case 'logs':
        socket.emit('logs', this.generateLogsData())
        break
      case 'status':
        socket.emit('status', this.generateStatusData())
        break
      default:
        socket.emit('error', { message: 'Unknown data type' })
    }
  }

  private startDataGeneration() {
    // 每2秒生成并推送新数据
    this.dataInterval = setInterval(() => {
      if (this.connectedClients.size > 0) {
        this.broadcastMetrics()
        this.broadcastLogs()
        this.broadcastStatus()
      }
    }, 2000)
  }

  private broadcastMetrics() {
    const metrics = this.generateMetricsData()
    this.io.emit('metrics', metrics)
  }

  private broadcastLogs() {
    const logs = this.generateLogsData()
    this.io.emit('logs', logs)
  }

  private broadcastStatus() {
    const status = this.generateStatusData()
    this.io.emit('status', status)
  }

  private generateMetricsData() {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 500,
      disk: Math.random() * 100,
      timestamp: Date.now()
    }
  }

  private generateLogsData() {
    const levels = ['info', 'warning', 'error', 'success'] as const
    const messages = [
      'System startup completed',
      'Database connection established',
      'Cache updated successfully',
      'High CPU usage detected',
      'Low disk space warning',
      'Network latency spike',
      'Service restart completed',
      'Backup task finished',
      'User authentication failed',
      'API rate limit exceeded'
    ]

    return {
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: Date.now()
    }
  }

  private generateStatusData() {
    const total = 1000 + Math.floor(Math.random() * 500)
    const online = Math.floor(total * (0.7 + Math.random() * 0.2))
    
    return {
      online,
      offline: total - online,
      total,
      timestamp: Date.now()
    }
  }

  private generateHistoricalData() {
    const data = []
    const now = Date.now()
    
    for (let i = 50; i >= 0; i--) {
      data.push({
        timestamp: now - i * 2000,
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 500,
        disk: Math.random() * 100
      })
    }
    
    return data
  }

  public stop() {
    if (this.dataInterval) {
      clearInterval(this.dataInterval)
      this.dataInterval = null
    }
    this.io.close()
  }
}