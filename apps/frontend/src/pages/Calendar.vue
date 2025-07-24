<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          📅 农历日历
        </h1>
        <p class="text-gray-600 text-lg">包含农历、节日、节气的智能日历</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 主日历 -->
        <div class="lg:col-span-2">
          <LunarCalendar />
        </div>

        <!-- 侧边栏信息 -->
        <div class="space-y-6">
          <!-- 今日信息 -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span class="mr-2">🌟</span>今日信息
            </h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">公历</span>
                <span class="font-medium">{{ todayInfo.solar }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">农历</span>
                <span class="font-medium">{{ todayInfo.lunar }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">星期</span>
                <span class="font-medium">{{ todayInfo.weekDay }}</span>
              </div>
              <div v-if="todayInfo.festival" class="flex justify-between">
                <span class="text-gray-600">节日</span>
                <span class="font-medium text-red-500">{{ todayInfo.festival }}</span>
              </div>
              <div v-if="todayInfo.solarTerm" class="flex justify-between">
                <span class="text-gray-600">节气</span>
                <span class="font-medium text-orange-500">{{ todayInfo.solarTerm }}</span>
              </div>
            </div>
          </div>

          <!-- 近期节日 -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span class="mr-2">🎉</span>近期节日
            </h3>
            <div class="space-y-3">
              <div v-for="festival in upcomingFestivals" :key="festival.date" 
                   class="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                <div>
                  <div class="font-medium text-gray-800">{{ festival.name }}</div>
                  <div class="text-sm text-gray-500">{{ festival.date }}</div>
                </div>
                <div class="text-sm text-red-500 font-medium">
                  {{ festival.daysLeft }}天后
                </div>
              </div>
            </div>
          </div>

          <!-- 节气信息 -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span class="mr-2">🌱</span>节气信息
            </h3>
            <div class="space-y-3">
              <div v-for="term in upcomingSolarTerms" :key="term.date"
                   class="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div>
                  <div class="font-medium text-gray-800">{{ term.name }}</div>
                  <div class="text-sm text-gray-500">{{ term.date }}</div>
                </div>
                <div class="text-sm text-green-500 font-medium">
                  {{ term.daysLeft }}天后
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LunarCalendar from '@/components/LunarCalendar.vue'

const today = new Date()

// 今日信息
const todayInfo = computed(() => {
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  
  return {
    solar: `${year}年${month}月${day}日`,
    lunar: '农历腊月初八', // 简化处理
    weekDay: weekDays[today.getDay()],
    festival: month === 12 && day === 25 ? '圣诞节' : null,
    solarTerm: month === 12 && day === 22 ? '冬至' : null
  }
})

// 近期节日
const upcomingFestivals = ref([
  { name: '元旦', date: '2024年1月1日', daysLeft: 15 },
  { name: '春节', date: '2024年2月10日', daysLeft: 55 },
  { name: '元宵节', date: '2024年2月24日', daysLeft: 69 }
])

// 近期节气
const upcomingSolarTerms = ref([
  { name: '小寒', date: '2024年1月6日', daysLeft: 20 },
  { name: '大寒', date: '2024年1月20日', daysLeft: 34 },
  { name: '立春', date: '2024年2月4日', daysLeft: 49 }
])
</script>