export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export interface WebSocketConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  onMessage?: (message: WebSocketMessage) => void
  onReconnect?: (attempt: number) => void
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectAttempts = 0
  private heartbeatTimer: number | null = null
  private reconnectTimer: number | null = null
  private isManualClose = false
  private messageHandlers = new Map<string, Function[]>()

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...config
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url)
        
        this.ws.onopen = () => {
          console.log('WebSocket连接成功')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.config.onOpen?.()
          resolve()
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket连接关闭', event)
          this.stopHeartbeat()
          this.config.onClose?.()
          
          if (!this.isManualClose && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket错误', error)
          this.config.onError?.(error)
          reject(error)
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('解析WebSocket消息失败', error)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleMessage(message: WebSocketMessage) {
    this.config.onMessage?.(message)
    
    // 触发特定类型的处理器
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => handler(message.data))
    }
  }

  private startHeartbeat() {
    if (this.config.heartbeatInterval && this.config.heartbeatInterval > 0) {
      this.heartbeatTimer = window.setInterval(() => {
        this.send('heartbeat', { timestamp: Date.now() })
      }, this.config.heartbeatInterval)
    }
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++
      console.log(`尝试重连 (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`)
      this.config.onReconnect?.(this.reconnectAttempts)
      this.connect().catch(() => {
        // 重连失败，继续尝试
      })
    }, this.config.reconnectInterval)
  }

  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      }
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  on(type: string, handler: Function) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)!.push(handler)
  }

  off(type: string, handler?: Function) {
    if (handler) {
      const handlers = this.messageHandlers.get(type)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    } else {
      this.messageHandlers.delete(type)
    }
  }

  close() {
    this.isManualClose = true
    this.stopHeartbeat()
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  get readyState() {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }
}