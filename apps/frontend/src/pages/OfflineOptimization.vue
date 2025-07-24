<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-8">
    <!-- 页面头部 -->
    <div class="text-center mb-12 text-white relative">
      <h1 class="text-5xl font-extrabold mb-4 text-shadow-lg">
        📱 离线优化方案
      </h1>
      <p class="text-xl opacity-90 max-w-4xl mx-auto mb-8 leading-relaxed">
        基于Service Worker + IndexedDB的现代化离线优化解决方案，支持增量更新和网络自适应
      </p>

      <!-- 网络状态指示器 -->
      <div
        class="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20"
        :class="{
          'border-green-400/50': networkStatus === 'online',
          'border-red-400/50': networkStatus === 'offline',
          'border-yellow-400/50': networkStatus === 'slow'
        }">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full animate-pulse" :class="{
            'bg-green-400': networkStatus === 'online',
            'bg-red-400': networkStatus === 'offline',
            'bg-yellow-400': networkStatus === 'slow'
          }"></div>
          <span class="font-semibold text-sm">{{ getNetworkStatusText() }}</span>
        </div>
        <div v-if="connectionInfo" class="flex gap-4 text-sm opacity-80">
          <span class="uppercase font-semibold">{{ connectionInfo.effectiveType }}</span>
          <span>{{ Math.round(connectionInfo.downlink) }}Mbps</span>
        </div>
      </div>
    </div>

    <!-- 功能选项卡 -->
    <div class="max-w-7xl mx-auto mb-12">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">
          <el-tab-pane label="Service Worker" name="sw">
            <template #label>
              <span class="flex items-center gap-2 px-4 py-2">
                <el-icon>
                  <Setting />
                </el-icon>
                Service Worker
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="IndexedDB" name="idb">
            <template #label>
              <span class="flex items-center gap-2 px-4 py-2">
                <el-icon>
                  <DataBoard />
                </el-icon>
                IndexedDB
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="增量更新" name="update">
            <template #label>
              <span class="flex items-center gap-2 px-4 py-2">
                <el-icon>
                  <Refresh />
                </el-icon>
                增量更新
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="网络自适应" name="adaptive">
            <template #label>
              <span class="flex items-center gap-2 px-4 py-2">
                <el-icon>
                  <Connection />
                </el-icon>
                网络自适应
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 动态组件加载区域 -->
    <div class="max-w-7xl mx-auto">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 min-h-[600px]">
        <Suspense>
          <template #default>
            <Transition name="component-slide" mode="out-in" appear>
              <component :is="currentComponent" :key="activeTab" />
            </Transition>
          </template>
          <template #fallback>
            <div class="flex items-center justify-center h-96">
              <div class="text-center text-white">
                <div class="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4">
                </div>
                <p class="text-lg font-medium">加载中...</p>
              </div>
            </div>
          </template>
        </Suspense>
      </div>
    </div>

    <!-- 全局状态面板 -->
    <GlobalStatus />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import {
  Setting,
  DataBoard,
  Refresh,
  Connection
} from '@element-plus/icons-vue'
import { useNetworkStatus } from '@/components/OfflineOptimization/composables/useNetworkStatus'

// 导入全局状态组件
const GlobalStatus = defineAsyncComponent(() => import('@/components/OfflineOptimization/GlobalStatus.vue'))

// 动态导入功能组件
const ServiceWorkerManager = defineAsyncComponent(() => import('@/components/OfflineOptimization/ServiceWorkerManager.vue'))
const IndexedDBManager = defineAsyncComponent(() => import('@/components/OfflineOptimization/IndexedDBManager.vue'))
const IncrementalUpdate = defineAsyncComponent(() => import('@/components/OfflineOptimization/IncrementalUpdate.vue'))
const NetworkAdaptive = defineAsyncComponent(() => import('@/components/OfflineOptimization/NetworkAdaptive.vue'))

// 使用网络状态composable
const { networkStatus, connectionInfo, getNetworkStatusText } = useNetworkStatus()

// 当前激活的tab
const activeTab = ref('sw')

// 动态组件映射
const componentMap = {
  sw: ServiceWorkerManager,
  idb: IndexedDBManager,
  update: IncrementalUpdate,
  adaptive: NetworkAdaptive
}

// 当前组件
const currentComponent = computed(() => componentMap[activeTab.value as keyof typeof componentMap])

// 处理tab切换
const handleTabChange = (tab: string | number) => {
  console.log('切换到标签页:', tab)
}
</script>

<style lang="scss" scoped>
// 文本阴影效果
.text-shadow-lg {
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

// 自定义tabs样式
:deep(.custom-tabs) {
  .el-tabs__header {
    margin: 0;
    border-bottom: none;
  }

  .el-tabs__nav-wrap {
    background: transparent;
  }

  .el-tabs__nav {
    border: none;
    background: transparent;
  }

  .el-tabs__item {
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    margin-right: 8px;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    &.is-active {
      background: rgba(255, 255, 255, 0.9);
      color: #6366f1;
      font-weight: 600;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .el-tabs__active-bar {
    display: none;
  }
}

// 组件切换动画
.component-slide-enter-active,
.component-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.component-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.component-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.component-slide-enter-to,
.component-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

// 响应式设计
@media (max-width: 768px) {
  .min-h-screen {
    padding: 1rem;
  }

  h1 {
    font-size: 2.5rem !important;
  }

  p {
    font-size: 1rem !important;
  }

  :deep(.custom-tabs .el-tabs__item) {
    margin-right: 4px;
    padding: 8px 12px;
    font-size: 0.875rem;
  }
}
</style>
