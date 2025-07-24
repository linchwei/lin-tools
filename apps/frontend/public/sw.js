// Service Worker - 离线优化方案
const CACHE_NAME = 'offline-optimization-v1.0.0';
const CACHE_VERSION = '1.0.0';

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // 添加其他静态资源
];

// 需要缓存的API路径模式
const API_CACHE_PATTERNS = [
  /^\/api\/data\//,
  /^\/api\/config\//,
  /^\/api\/user\//
];

// 图片资源模式
const IMAGE_CACHE_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /^\/images\//,
  /^\/assets\/images\//
];

// 缓存策略配置
const CACHE_STRATEGIES = {
  static: 'cache-first',      // 静态资源：缓存优先
  api: 'network-first',       // API数据：网络优先
  images: 'cache-first'       // 图片资源：缓存优先
};

// 缓存过期时间（毫秒）
const CACHE_EXPIRY = {
  static: 7 * 24 * 60 * 60 * 1000,    // 7天
  api: 60 * 60 * 1000,                // 1小时
  images: 30 * 24 * 60 * 60 * 1000    // 30天
};

// 安装事件
self.addEventListener('install', event => {
  console.log('Service Worker 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('静态资源缓存完成');
        // 强制激活新的 Service Worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('缓存静态资源失败:', error);
      })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  console.log('Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // 删除旧版本的缓存
            if (cacheName !== CACHE_NAME) {
              console.log('删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker 激活完成');
        // 立即控制所有客户端
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // 只处理 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 确定缓存策略
  let strategy = 'network-first'; // 默认策略
  
  if (isStaticResource(url)) {
    strategy = CACHE_STRATEGIES.static;
  } else if (isApiRequest(url)) {
    strategy = CACHE_STRATEGIES.api;
  } else if (isImageResource(url)) {
    strategy = CACHE_STRATEGIES.images;
  }
  
  // 应用相应的缓存策略
  switch (strategy) {
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
    case 'network-first':
      event.respondWith(networkFirst(request));
      break;
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    case 'network-only':
      event.respondWith(networkOnly(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// 缓存优先策略
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // 检查缓存是否过期
      const cacheTime = await getCacheTime(request);
      const now = Date.now();
      const maxAge = getCacheMaxAge(request);
      
      if (cacheTime && (now - cacheTime) < maxAge) {
        console.log('从缓存返回:', request.url);
        return cachedResponse;
      }
    }
    
    // 缓存未命中或已过期，从网络获取
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cacheResponse(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('缓存优先策略失败:', error);
    
    // 网络失败时返回缓存（即使过期）
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回离线页面
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// 网络优先策略
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cacheResponse(request, networkResponse.clone());
    }
    
    console.log('从网络返回:', request.url);
    return networkResponse;
  } catch (error) {
    console.log('网络请求失败，尝试缓存:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回离线页面
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// 过期重新验证策略
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // 后台更新缓存
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cacheResponse(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.error('后台更新失败:', error);
    });
  
  // 立即返回缓存（如果有）
  if (cachedResponse) {
    console.log('从缓存返回（后台更新）:', request.url);
    return cachedResponse;
  }
  
  // 没有缓存时等待网络响应
  return networkResponsePromise;
}

// 仅网络策略
async function networkOnly(request) {
  return fetch(request);
}

// 缓存响应
async function cacheResponse(request, response) {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    // 添加时间戳到响应头
    const responseWithTimestamp = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'sw-cache-time': Date.now().toString()
      }
    });
    
    await cache.put(request, responseWithTimestamp);
    console.log('已缓存:', request.url);
  } catch (error) {
    console.error('缓存响应失败:', error);
  }
}

// 获取缓存时间
async function getCacheTime(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      const cacheTime = cachedResponse.headers.get('sw-cache-time');
      return cacheTime ? parseInt(cacheTime) : null;
    }
  } catch (error) {
    console.error('获取缓存时间失败:', error);
  }
  return null;
}

// 获取缓存最大存活时间
function getCacheMaxAge(request) {
  const url = new URL(request.url);
  
  if (isStaticResource(url)) {
    return CACHE_EXPIRY.static;
  } else if (isApiRequest(url)) {
    return CACHE_EXPIRY.api;
  } else if (isImageResource(url)) {
    return CACHE_EXPIRY.images;
  }
  
  return CACHE_EXPIRY.api; // 默认
}

// 判断是否为静态资源
function isStaticResource(url) {
  return url.pathname.endsWith('.html') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.json') ||
         url.pathname === '/' ||
         url.pathname.startsWith('/assets/');
}

// 判断是否为API请求
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// 判断是否为图片资源
function isImageResource(url) {
  return IMAGE_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// 处理消息
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage({ type: 'CACHE_STATS', data: stats });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache(data.cacheName).then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'UPDATE_CACHE_STRATEGY':
      updateCacheStrategy(data.strategies);
      break;
      
    default:
      console.log('未知消息类型:', type);
  }
});

// 获取缓存统计信息
async function getCacheStats() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    let totalSize = 0;
    let fileCount = requests.length;
    
    // 估算缓存大小（简化计算）
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
    
    return {
      totalSize: formatBytes(totalSize),
      fileCount,
      cacheName: CACHE_NAME,
      version: CACHE_VERSION
    };
  } catch (error) {
    console.error('获取缓存统计失败:', error);
    return {
      totalSize: '0 MB',
      fileCount: 0,
      cacheName: CACHE_NAME,
      version: CACHE_VERSION
    };
  }
}

// 清除指定缓存
async function clearCache(cacheName) {
  try {
    if (cacheName) {
      await caches.delete(cacheName);
    } else {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    console.log('缓存已清除:', cacheName || '全部');
  } catch (error) {
    console.error('清除缓存失败:', error);
  }
}

// 更新缓存策略
function updateCacheStrategy(strategies) {
  Object.assign(CACHE_STRATEGIES, strategies);
  console.log('缓存策略已更新:', CACHE_STRATEGIES);
}

// 格式化字节大小
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 后台同步
self.addEventListener('sync', event => {
  console.log('后台同步事件:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 执行后台同步
async function doBackgroundSync() {
  try {
    // 这里可以执行数据同步逻辑
    console.log('执行后台同步...');
    
    // 示例：同步离线时的操作
    const syncData = await getOfflineActions();
    if (syncData.length > 0) {
      await syncOfflineActions(syncData);
    }
  } catch (error) {
    console.error('后台同步失败:', error);
  }
}

// 获取离线操作
async function getOfflineActions() {
  // 从 IndexedDB 获取离线时的操作
  return [];
}

// 同步离线操作
async function syncOfflineActions(actions) {
  // 将离线操作同步到服务器
  for (const action of actions) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      });
    } catch (error) {
      console.error('同步操作失败:', action, error);
    }
  }
}

// 推送通知
self.addEventListener('push', event => {
  console.log('收到推送消息:', event);
  
  const options = {
    body: '您有新的更新可用',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'update-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'update',
        title: '立即更新'
      },
      {
        action: 'dismiss',
        title: '稍后提醒'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('应用更新', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', event => {
  console.log('通知被点击:', event);
  
  event.notification.close();
  
  if (event.action === 'update') {
    // 处理更新操作
    event.waitUntil(
      clients.openWindow('/?update=true')
    );
  }
});

console.log('Service Worker 已加载, 版本:', CACHE_VERSION);
