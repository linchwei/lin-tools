// 网络状态监控工具

export interface NetworkInfo {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface NetworkMetrics {
  stability: number;
  availability: number;
  averageSpeed: number;
  averageLatency: number;
}

export interface NetworkEvent {
  type: 'online' | 'offline' | 'slow' | 'fast';
  timestamp: number;
  info?: NetworkInfo;
}

export type NetworkStatusCallback = (status: 'online' | 'offline' | 'slow', info?: NetworkInfo) => void;

export class NetworkMonitor {
  private callbacks: Set<NetworkStatusCallback> = new Set();
  private currentStatus: 'online' | 'offline' | 'slow' = 'online';
  private connectionInfo: NetworkInfo | null = null;
  private metrics: NetworkMetrics = {
    stability: 100,
    availability: 100,
    averageSpeed: 0,
    averageLatency: 0
  };
  private eventHistory: NetworkEvent[] = [];
  private speedTests: number[] = [];
  private latencyTests: number[] = [];
  private isMonitoring = false;
  private monitorInterval: number | null = null;

  constructor() {
    this.init();
  }

  // 初始化监控
  private init(): void {
    // 监听在线/离线事件
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // 监听连接变化
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', this.handleConnectionChange.bind(this));
      this.updateConnectionInfo();
    }

    // 初始状态
    this.currentStatus = navigator.onLine ? 'online' : 'offline';
    this.addEvent(this.currentStatus);
  }

  // 开始监控
  startMonitoring(interval: number = 30000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitorInterval = window.setInterval(() => {
      this.performNetworkTest();
    }, interval);

    console.log('网络监控已启动');
  }

  // 停止监控
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    console.log('网络监控已停止');
  }

  // 添加状态回调
  addCallback(callback: NetworkStatusCallback): void {
    this.callbacks.add(callback);
  }

  // 移除状态回调
  removeCallback(callback: NetworkStatusCallback): void {
    this.callbacks.delete(callback);
  }

  // 获取当前状态
  getCurrentStatus(): 'online' | 'offline' | 'slow' {
    return this.currentStatus;
  }

  // 获取连接信息
  getConnectionInfo(): NetworkInfo | null {
    return this.connectionInfo;
  }

  // 获取网络指标
  getMetrics(): NetworkMetrics {
    return { ...this.metrics };
  }

  // 获取事件历史
  getEventHistory(limit?: number): NetworkEvent[] {
    return limit ? this.eventHistory.slice(-limit) : [...this.eventHistory];
  }

  // 处理在线事件
  private handleOnline(): void {
    this.currentStatus = 'online';
    this.addEvent('online');
    this.notifyCallbacks();
    console.log('网络已连接');
  }

  // 处理离线事件
  private handleOffline(): void {
    this.currentStatus = 'offline';
    this.addEvent('offline');
    this.notifyCallbacks();
    console.log('网络已断开');
  }

  // 处理连接变化
  private handleConnectionChange(): void {
    this.updateConnectionInfo();
    this.evaluateNetworkQuality();
  }

  // 更新连接信息
  private updateConnectionInfo(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.connectionInfo = {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || '4g',
        downlink: connection.downlink || 10,
        rtt: connection.rtt || 100,
        saveData: connection.saveData || false
      };
    }
  }

  // 评估网络质量
  private evaluateNetworkQuality(): void {
    if (!this.connectionInfo) return;

    const { effectiveType, downlink, rtt } = this.connectionInfo;
    
    // 根据有效类型和指标判断网络质量
    let isSlowNetwork = false;

    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      isSlowNetwork = true;
    } else if (effectiveType === '3g' && (downlink < 1.5 || rtt > 300)) {
      isSlowNetwork = true;
    } else if (downlink < 0.5 || rtt > 500) {
      isSlowNetwork = true;
    }

    const newStatus = isSlowNetwork ? 'slow' : 'online';
    
    if (newStatus !== this.currentStatus && this.currentStatus !== 'offline') {
      this.currentStatus = newStatus;
      this.addEvent(newStatus);
      this.notifyCallbacks();
    }
  }

  // 执行网络测试
  private async performNetworkTest(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      // 速度测试
      const speedResult = await this.testSpeed();
      if (speedResult > 0) {
        this.speedTests.push(speedResult);
        if (this.speedTests.length > 10) {
          this.speedTests.shift();
        }
      }

      // 延迟测试
      const latencyResult = await this.testLatency();
      if (latencyResult > 0) {
        this.latencyTests.push(latencyResult);
        if (this.latencyTests.length > 10) {
          this.latencyTests.shift();
        }
      }

      // 更新指标
      this.updateMetrics();

    } catch (error) {
      console.error('网络测试失败:', error);
    }
  }

  // 测试网络速度
  private async testSpeed(): Promise<number> {
    const testUrl = '/favicon.ico?' + Date.now(); // 使用小文件测试
    const startTime = performance.now();

    try {
      const response = await fetch(testUrl, { 
        cache: 'no-cache',
        method: 'HEAD'
      });
      
      if (response.ok) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 估算速度 (假设文件大小为1KB)
        const speed = 1024 / (duration / 1000); // bytes per second
        return speed / 1024; // KB/s
      }
    } catch (error) {
      console.error('速度测试失败:', error);
    }

    return 0;
  }

  // 测试网络延迟
  private async testLatency(): Promise<number> {
    const testUrl = '/favicon.ico?' + Date.now();
    const startTime = performance.now();

    try {
      const response = await fetch(testUrl, { 
        cache: 'no-cache',
        method: 'HEAD'
      });
      
      if (response.ok) {
        const endTime = performance.now();
        return endTime - startTime;
      }
    } catch (error) {
      console.error('延迟测试失败:', error);
    }

    return 0;
  }

  // 更新指标
  private updateMetrics(): void {
    // 计算平均速度
    if (this.speedTests.length > 0) {
      this.metrics.averageSpeed = this.speedTests.reduce((a, b) => a + b, 0) / this.speedTests.length;
    }

    // 计算平均延迟
    if (this.latencyTests.length > 0) {
      this.metrics.averageLatency = this.latencyTests.reduce((a, b) => a + b, 0) / this.latencyTests.length;
    }

    // 计算稳定性（基于延迟变化）
    if (this.latencyTests.length >= 3) {
      const variance = this.calculateVariance(this.latencyTests);
      this.metrics.stability = Math.max(0, 100 - (variance / 10));
    }

    // 计算可用性（基于成功率）
    const recentEvents = this.eventHistory.slice(-20);
    const onlineEvents = recentEvents.filter(e => e.type === 'online' || e.type === 'fast').length;
    this.metrics.availability = recentEvents.length > 0 ? (onlineEvents / recentEvents.length) * 100 : 100;
  }

  // 计算方差
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // 添加事件
  private addEvent(type: NetworkEvent['type']): void {
    const event: NetworkEvent = {
      type,
      timestamp: Date.now(),
      info: this.connectionInfo ? { ...this.connectionInfo } : undefined
    };

    this.eventHistory.push(event);

    // 限制历史记录数量
    if (this.eventHistory.length > 100) {
      this.eventHistory.shift();
    }
  }

  // 通知回调
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.currentStatus, this.connectionInfo || undefined);
      } catch (error) {
        console.error('网络状态回调执行失败:', error);
      }
    });
  }

  // 获取网络质量评分
  getNetworkQuality(): number {
    if (this.currentStatus === 'offline') return 0;
    if (this.currentStatus === 'slow') return 30;

    let score = 100;

    if (this.connectionInfo) {
      const { effectiveType, downlink, rtt } = this.connectionInfo;

      // 根据有效类型调整分数
      switch (effectiveType) {
        case 'slow-2g':
          score = 20;
          break;
        case '2g':
          score = 40;
          break;
        case '3g':
          score = 60;
          break;
        case '4g':
          score = 80;
          break;
      }

      // 根据下行速度调整
      if (downlink < 0.5) score -= 20;
      else if (downlink < 1) score -= 10;
      else if (downlink > 10) score += 10;

      // 根据延迟调整
      if (rtt > 500) score -= 20;
      else if (rtt > 300) score -= 10;
      else if (rtt < 50) score += 10;
    }

    // 根据稳定性调整
    score = (score + this.metrics.stability) / 2;

    return Math.max(0, Math.min(100, score));
  }

  // 检查是否为慢速网络
  isSlowNetwork(): boolean {
    return this.currentStatus === 'slow' || this.getNetworkQuality() < 50;
  }

  // 检查是否启用了省流模式
  isSaveDataEnabled(): boolean {
    return this.connectionInfo?.saveData || false;
  }

  // 获取网络类型
  getNetworkType(): string {
    return this.connectionInfo?.type || 'unknown';
  }

  // 获取有效网络类型
  getEffectiveType(): string {
    return this.connectionInfo?.effectiveType || '4g';
  }

  // 销毁监控器
  destroy(): void {
    this.stopMonitoring();
    
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.removeEventListener('change', this.handleConnectionChange.bind(this));
    }

    this.callbacks.clear();
    this.eventHistory = [];
    this.speedTests = [];
    this.latencyTests = [];

    console.log('网络监控器已销毁');
  }
}

// 创建全局实例
export const networkMonitor = new NetworkMonitor();
