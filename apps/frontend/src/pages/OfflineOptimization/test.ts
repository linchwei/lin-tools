// 离线优化功能测试文件

import { IndexedDBManager, defaultDBConfig } from '@/utils/indexedDB'
import { NetworkMonitor } from '@/utils/networkMonitor'

// 测试IndexedDB功能
export async function testIndexedDB() {
  console.log('🧪 开始测试 IndexedDB 功能...')
  
  try {
    const dbManager = new IndexedDBManager(defaultDBConfig)
    await dbManager.init()
    console.log('✅ IndexedDB 初始化成功')
    
    // 测试添加数据
    await dbManager.add('cache_data', {
      key: 'test-key',
      value: 'test-value',
      timestamp: Date.now(),
      type: 'test'
    })
    console.log('✅ 数据添加成功')
    
    // 测试获取数据
    const data = await dbManager.get('cache_data', 'test-key')
    console.log('✅ 数据获取成功:', data)
    
    // 测试获取所有数据
    const allData = await dbManager.getAll('cache_data')
    console.log('✅ 获取所有数据成功:', allData.length, '条记录')
    
    // 测试删除数据
    await dbManager.delete('cache_data', 'test-key')
    console.log('✅ 数据删除成功')
    
    // 测试存储信息
    const storageInfo = await dbManager.getStorageInfo()
    console.log('✅ 存储信息获取成功:', storageInfo)
    
    dbManager.close()
    console.log('✅ IndexedDB 测试完成')
    
    return true
  } catch (error) {
    console.error('❌ IndexedDB 测试失败:', error)
    return false
  }
}

// 测试网络监控功能
export function testNetworkMonitor() {
  console.log('🧪 开始测试网络监控功能...')
  
  try {
    const monitor = new NetworkMonitor()
    
    // 测试获取当前状态
    const status = monitor.getCurrentStatus()
    console.log('✅ 当前网络状态:', status)
    
    // 测试获取连接信息
    const connectionInfo = monitor.getConnectionInfo()
    console.log('✅ 连接信息:', connectionInfo)
    
    // 测试获取网络指标
    const metrics = monitor.getMetrics()
    console.log('✅ 网络指标:', metrics)
    
    // 测试网络质量评分
    const quality = monitor.getNetworkQuality()
    console.log('✅ 网络质量评分:', quality)
    
    // 测试是否为慢速网络
    const isSlowNetwork = monitor.isSlowNetwork()
    console.log('✅ 是否为慢速网络:', isSlowNetwork)
    
    // 测试省流模式检测
    const isSaveDataEnabled = monitor.isSaveDataEnabled()
    console.log('✅ 是否启用省流模式:', isSaveDataEnabled)
    
    // 添加状态回调测试
    monitor.addCallback((status, info) => {
      console.log('📡 网络状态变化:', status, info)
    })
    
    // 开始监控
    monitor.startMonitoring(5000) // 5秒间隔
    console.log('✅ 网络监控已启动')
    
    console.log('✅ 网络监控测试完成')
    return true
  } catch (error) {
    console.error('❌ 网络监控测试失败:', error)
    return false
  }
}

// 测试Service Worker功能
export async function testServiceWorker() {
  console.log('🧪 开始测试 Service Worker 功能...')
  
  try {
    if ('serviceWorker' in navigator) {
      console.log('✅ 浏览器支持 Service Worker')
      
      // 检查是否已注册
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        console.log('✅ Service Worker 已注册:', registration.scope)
        console.log('✅ 激活状态:', registration.active ? '已激活' : '未激活')
      } else {
        console.log('ℹ️ Service Worker 未注册')
      }
      
      // 测试缓存API
      if ('caches' in window) {
        console.log('✅ 浏览器支持 Cache API')
        
        const cacheNames = await caches.keys()
        console.log('✅ 当前缓存列表:', cacheNames)
        
        // 测试创建缓存
        const testCache = await caches.open('test-cache')
        console.log('✅ 测试缓存创建成功')
        
        // 测试缓存请求
        const testResponse = new Response('test data', {
          headers: { 'Content-Type': 'text/plain' }
        })
        await testCache.put('/test', testResponse)
        console.log('✅ 测试数据缓存成功')
        
        // 测试获取缓存
        const cachedResponse = await testCache.match('/test')
        if (cachedResponse) {
          const cachedData = await cachedResponse.text()
          console.log('✅ 缓存数据获取成功:', cachedData)
        }
        
        // 清理测试缓存
        await caches.delete('test-cache')
        console.log('✅ 测试缓存清理完成')
      } else {
        console.log('❌ 浏览器不支持 Cache API')
      }
      
      console.log('✅ Service Worker 测试完成')
      return true
    } else {
      console.log('❌ 浏览器不支持 Service Worker')
      return false
    }
  } catch (error) {
    console.error('❌ Service Worker 测试失败:', error)
    return false
  }
}

// 测试存储配额
export async function testStorageQuota() {
  console.log('🧪 开始测试存储配额...')
  
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      console.log('✅ 存储配额信息:')
      console.log('  - 已使用:', Math.round((estimate.usage || 0) / 1024 / 1024), 'MB')
      console.log('  - 总配额:', Math.round((estimate.quota || 0) / 1024 / 1024), 'MB')
      console.log('  - 使用率:', Math.round(((estimate.usage || 0) / (estimate.quota || 1)) * 100), '%')
      
      // 测试持久化存储
      if ('persist' in navigator.storage) {
        const persistent = await navigator.storage.persist()
        console.log('✅ 持久化存储:', persistent ? '已启用' : '未启用')
      }
      
      return true
    } else {
      console.log('❌ 浏览器不支持存储配额 API')
      return false
    }
  } catch (error) {
    console.error('❌ 存储配额测试失败:', error)
    return false
  }
}

// 运行所有测试
export async function runAllTests() {
  console.log('🚀 开始运行离线优化功能测试套件...')
  console.log('=' .repeat(50))
  
  const results = {
    indexedDB: false,
    networkMonitor: false,
    serviceWorker: false,
    storageQuota: false
  }
  
  // 测试IndexedDB
  results.indexedDB = await testIndexedDB()
  console.log('=' .repeat(50))
  
  // 测试网络监控
  results.networkMonitor = testNetworkMonitor()
  console.log('=' .repeat(50))
  
  // 测试Service Worker
  results.serviceWorker = await testServiceWorker()
  console.log('=' .repeat(50))
  
  // 测试存储配额
  results.storageQuota = await testStorageQuota()
  console.log('=' .repeat(50))
  
  // 输出测试结果
  console.log('📊 测试结果汇总:')
  console.log('  - IndexedDB:', results.indexedDB ? '✅ 通过' : '❌ 失败')
  console.log('  - 网络监控:', results.networkMonitor ? '✅ 通过' : '❌ 失败')
  console.log('  - Service Worker:', results.serviceWorker ? '✅ 通过' : '❌ 失败')
  console.log('  - 存储配额:', results.storageQuota ? '✅ 通过' : '❌ 失败')
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`🎯 测试通过率: ${passedTests}/${totalTests} (${Math.round(passedTests / totalTests * 100)}%)`)
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！离线优化功能正常工作。')
  } else {
    console.log('⚠️ 部分测试失败，请检查相关功能。')
  }
  
  return results
}

// 浏览器兼容性检测
export function checkBrowserCompatibility() {
  console.log('🔍 检查浏览器兼容性...')
  
  const features = {
    serviceWorker: 'serviceWorker' in navigator,
    indexedDB: 'indexedDB' in window,
    cacheAPI: 'caches' in window,
    storageAPI: 'storage' in navigator,
    networkInfo: 'connection' in navigator,
    promises: typeof Promise !== 'undefined',
    asyncAwait: true, // 现代浏览器都支持
    fetch: 'fetch' in window
  }
  
  console.log('📋 功能支持情况:')
  Object.entries(features).forEach(([feature, supported]) => {
    console.log(`  - ${feature}: ${supported ? '✅ 支持' : '❌ 不支持'}`)
  })
  
  const supportedFeatures = Object.values(features).filter(Boolean).length
  const totalFeatures = Object.keys(features).length
  const compatibilityScore = Math.round(supportedFeatures / totalFeatures * 100)
  
  console.log(`🎯 兼容性评分: ${compatibilityScore}%`)
  
  if (compatibilityScore >= 90) {
    console.log('🎉 浏览器兼容性优秀！')
  } else if (compatibilityScore >= 70) {
    console.log('✅ 浏览器兼容性良好。')
  } else {
    console.log('⚠️ 浏览器兼容性较差，部分功能可能无法正常工作。')
  }
  
  return { features, compatibilityScore }
}

// 在控制台中暴露测试函数
if (typeof window !== 'undefined') {
  (window as any).offlineOptimizationTests = {
    runAllTests,
    testIndexedDB,
    testNetworkMonitor,
    testServiceWorker,
    testStorageQuota,
    checkBrowserCompatibility
  }
  
  console.log('🛠️ 离线优化测试工具已加载！')
  console.log('使用 window.offlineOptimizationTests.runAllTests() 运行所有测试')
  console.log('使用 window.offlineOptimizationTests.checkBrowserCompatibility() 检查兼容性')
}
