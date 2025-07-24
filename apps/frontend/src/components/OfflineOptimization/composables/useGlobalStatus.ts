import { ref, reactive, computed } from 'vue'
import { useNetworkStatus } from './useNetworkStatus'

// 全局状态管理composable
export function useGlobalStatus() {
  const { networkStatus, getNetworkStatusText } = useNetworkStatus()

  // Service Worker状态
  const swStatus = reactive({
    registered: false,
    activated: false,
    updateAvailable: false,
    version: 'v1.0.0'
  })

  // 数据库状态
  const dbStatus = reactive({
    connected: false,
    usage: '0 MB',
    quota: '0 MB'
  })

  // 更新状态
  const updateStatus = reactive({
    currentVersion: 'v1.0.0',
    latestVersion: 'v1.0.0',
    status: 'up-to-date' as 'up-to-date' | 'checking' | 'downloading' | 'ready' | 'updating',
    hasUpdate: false
  })

  // 获取更新状态文本
  const getUpdateStatusText = () => {
    switch (updateStatus.status) {
      case 'up-to-date': return '最新版本'
      case 'checking': return '检查中'
      case 'downloading': return '下载中'
      case 'ready': return '准备更新'
      case 'updating': return '更新中'
      default: return '未知'
    }
  }

  // 全局状态项
  const globalStatusItems = computed(() => [
    {
      icon: '🔧',
      title: 'Service Worker',
      value: swStatus.registered ? '运行中' : '未启用',
      status: swStatus.registered ? 'success' : 'error'
    },
    {
      icon: '💾',
      title: '本地存储',
      value: dbStatus.usage,
      status: 'info'
    },
    {
      icon: '🔄',
      title: '更新状态',
      value: getUpdateStatusText(),
      status: updateStatus.status === 'up-to-date' ? 'success' : 'warning'
    },
    {
      icon: '🌐',
      title: '网络状态',
      value: getNetworkStatusText(),
      status: networkStatus.value === 'online' ? 'success' : 
              networkStatus.value === 'slow' ? 'warning' : 'error'
    }
  ])

  // 更新Service Worker状态
  const updateSWStatus = (status: Partial<typeof swStatus>) => {
    Object.assign(swStatus, status)
  }

  // 更新数据库状态
  const updateDBStatus = (status: Partial<typeof dbStatus>) => {
    Object.assign(dbStatus, status)
  }

  // 更新版本状态
  const updateVersionStatus = (status: Partial<typeof updateStatus>) => {
    Object.assign(updateStatus, status)
  }

  return {
    // 状态
    swStatus,
    dbStatus,
    updateStatus,
    globalStatusItems,
    
    // 方法
    getUpdateStatusText,
    updateSWStatus,
    updateDBStatus,
    updateVersionStatus
  }
}
