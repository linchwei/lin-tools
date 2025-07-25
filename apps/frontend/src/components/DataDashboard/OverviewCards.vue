<template>
  <!-- 数据概览卡片 -->
  <div class="mb-8">
    <div class="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <div v-for="(card, index) in overviewCards" :key="index"
        class="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 transition-all duration-300 relative overflow-hidden flex items-center gap-5 hover:-translate-y-1 hover:shadow-2xl">
        <!-- 顶部渐变条 -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>

        <!-- 图标 -->
        <div class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl text-white flex-shrink-0"
          :style="{ backgroundColor: card.color }">
          <component :is="card.icon" />
        </div>

        <!-- 内容 -->
        <div class="flex-1">
          <div class="text-sm text-slate-400 mb-2">{{ card.title }}</div>
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-3xl font-bold text-white">{{ formatNumber(card.value) }}</span>
            <span class="text-sm text-slate-400">{{ card.unit }}</span>
          </div>
          <div class="flex items-center gap-1 text-xs font-medium"
            :class="card.trend > 0 ? 'text-cyan-400' : 'text-red-400'">
            <el-icon>
              <ArrowUp v-if="card.trend > 0" />
              <ArrowDown v-else />
            </el-icon>
            {{ Math.abs(card.trend) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, Monitor, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ServerIcon, WifiIcon } from '@heroicons/vue/24/outline'

// 响应式数据 - 直接从原文件复制
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

// 格式化数值 - 从原文件复制
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>

<style lang="scss" scoped>
// 只保留必要的自定义样式，不使用Tailwind的@apply
.bg-white\/5:hover {
  box-shadow: 0 20px 40px rgba(79, 172, 254, 0.2);
}
</style>
