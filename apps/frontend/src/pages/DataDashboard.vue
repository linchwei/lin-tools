<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- 动态加载的组件 -->
    <Suspense>
      <template #default>
        <div class="p-6 space-y-8">
          <!-- 头部控制栏 -->
          <DashboardHeader />

          <!-- 数据概览卡片 -->
          <OverviewCards />

          <!-- 实时数据趋势图 -->
          <RealtimeTrendChart />

          <!-- 第二行：四个组件 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemStatusChart />
            <ServerPerformanceChart />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricsPanel />
            <RealtimeLogs />
          </div>

          <!-- 地理分布图 -->
          <GeoDistributionMap />

          <!-- 网络可视化区域 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NetworkTopology />
            <DataFlowAnimation />
          </div>
        </div>
      </template>

      <template #fallback>
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4">
            </div>
            <p class="text-white text-lg">加载数据大屏中...</p>
          </div>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 动态导入组件，确保首次加载速度
const DashboardHeader = defineAsyncComponent(() => import('@/components/DataDashboard/DashboardHeader.vue'))
const OverviewCards = defineAsyncComponent(() => import('@/components/DataDashboard/OverviewCards.vue'))
const RealtimeTrendChart = defineAsyncComponent(() => import('@/components/DataDashboard/RealtimeTrendChart.vue'))
const SystemStatusChart = defineAsyncComponent(() => import('@/components/DataDashboard/SystemStatusChart.vue'))
const ServerPerformanceChart = defineAsyncComponent(() => import('@/components/DataDashboard/ServerPerformanceChart.vue'))
const MetricsPanel = defineAsyncComponent(() => import('@/components/DataDashboard/MetricsPanel.vue'))
const RealtimeLogs = defineAsyncComponent(() => import('@/components/DataDashboard/RealtimeLogs.vue'))
const GeoDistributionMap = defineAsyncComponent(() => import('@/components/DataDashboard/GeoDistributionMap.vue'))
const NetworkTopology = defineAsyncComponent(() => import('@/components/DataDashboard/NetworkTopology.vue'))
const DataFlowAnimation = defineAsyncComponent(() => import('@/components/DataDashboard/DataFlowAnimation.vue'))

// 所有组件已创建完成
</script>

<style lang="scss" scoped>
// 使用Tailwind CSS，减少自定义样式</style>
