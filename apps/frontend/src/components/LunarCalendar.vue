<template>
  <div class="lunar-calendar bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
    <!-- 日历头部 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-800">{{ currentYear }}年{{ currentMonth }}月</h2>
          <p class="text-sm text-gray-500">{{ lunarYearMonth }}</p>
        </div>
        <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      <button @click="goToday" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        今天
      </button>
    </div>

    <!-- 星期标题 -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div v-for="day in weekDays" :key="day"
        class="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
        {{ day }}
      </div>
    </div>

    <!-- 日历网格 -->
    <div class="grid grid-cols-7 gap-1">
      <div v-for="date in calendarDates" :key="date.key" :class="[
        'h-16 p-1 border border-gray-100 rounded-lg cursor-pointer transition-all duration-200',
        'hover:bg-blue-50 hover:border-blue-200',
        {
          'bg-gray-50 text-gray-400': !date.isCurrentMonth,
          'bg-blue-500 text-white': date.isToday,
          'bg-blue-100 border-blue-300': date.isSelected && !date.isToday,
          'bg-red-50 border-red-200': date.isHoliday && date.isCurrentMonth,
          'bg-green-50 border-green-200': date.isFestival && date.isCurrentMonth
        }
      ]" @click="selectDate(date)">
        <div class="flex flex-col h-full justify-between">
          <div class="flex justify-between items-start">
            <span :class="[
              'text-sm font-medium',
              {
                'text-red-500': date.isHoliday && date.isCurrentMonth,
                'text-green-600': date.isFestival && date.isCurrentMonth
              }
            ]">
              {{ date.day }}
            </span>
            <span v-if="date.isToday" class="text-xs bg-white/20 px-1 rounded">今</span>
          </div>
          <div class="text-xs text-center">
            <div :class="[
              'truncate',
              {
                'text-red-500 font-medium': date.isHoliday && date.isCurrentMonth,
                'text-green-600 font-medium': date.isFestival && date.isCurrentMonth,
                'text-gray-500': !date.isHoliday && !date.isFestival
              }
            ]">
              {{ date.festival || date.lunar }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中日期详情 -->
    <div v-if="selectedDate"
      class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      <h3 class="font-semibold text-gray-800 mb-2">{{ selectedDate.year }}年{{ selectedDate.month }}月{{ selectedDate.day
        }}日</h3>
      <div class="space-y-1 text-sm text-gray-600">
        <p>农历：{{ selectedDate.lunarYear }}{{ selectedDate.lunarMonth }}{{ selectedDate.lunarDay }}</p>
        <p>星期：{{ selectedDate.weekDay }}</p>
        <p v-if="selectedDate.festival" class="text-green-600 font-medium">节日：{{ selectedDate.festival }}</p>
        <p v-if="selectedDate.solarTerm" class="text-orange-600 font-medium">节气：{{ selectedDate.solarTerm }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface CalendarDate {
  key: string
  day: number
  month: number
  year: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isHoliday: boolean
  isFestival: boolean
  lunar: string
  lunarYear: string
  lunarMonth: string
  lunarDay: string
  weekDay: string
  festival?: string
  solarTerm?: string
}

const currentDate = ref(new Date())
const selectedDate = ref<CalendarDate | null>(null)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 农历数据
const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']
const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

// 节日数据
const festivals: Record<string, string> = {
  '1-1': '元旦',
  '2-14': '情人节',
  '3-8': '妇女节',
  '3-12': '植树节',
  '4-1': '愚人节',
  '5-1': '劳动节',
  '5-4': '青年节',
  '6-1': '儿童节',
  '7-1': '建党节',
  '8-1': '建军节',
  '9-10': '教师节',
  '10-1': '国庆节',
  '12-25': '圣诞节'
}

// 农历节日
const lunarFestivals: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵节',
  '5-5': '端午节',
  '7-7': '七夕节',
  '8-15': '中秋节',
  '9-9': '重阳节',
  '12-8': '腊八节',
  '12-23': '小年'
}

// 二十四节气
const solarTerms = {
  '2-4': '立春', '2-19': '雨水',
  '3-6': '惊蛰', '3-21': '春分',
  '4-5': '清明', '4-20': '谷雨',
  '5-6': '立夏', '5-21': '小满',
  '6-6': '芒种', '6-21': '夏至',
  '7-7': '小暑', '7-23': '大暑',
  '8-8': '立秋', '8-23': '处暑',
  '9-8': '白露', '9-23': '秋分',
  '10-8': '寒露', '10-23': '霜降',
  '11-7': '立冬', '11-22': '小雪',
  '12-7': '大雪', '12-22': '冬至',
  '1-6': '小寒', '1-20': '大寒'
}

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

// 简化的农历转换（实际项目中建议使用专业的农历库）
const getLunarDate = (date: Date) => {
  // 这里使用简化的农历计算，实际项目中建议使用 lunar-javascript 等专业库
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // 简化计算，仅作演示
  const lunarYear = `${year}年`
  const lunarMonth = lunarMonths[month - 1] || '正月'
  const lunarDay = lunarDays[day - 1] || '初一'

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    short: day === 1 ? lunarMonth : lunarDay
  }
}

const lunarYearMonth = computed(() => {
  const lunar = getLunarDate(currentDate.value)
  return `农历${lunar.year}${lunar.month}`
})

const calendarDates = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const firstDayWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const dates: CalendarDate[] = []
  const today = new Date()

  // 上个月的日期
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevMonthLastDay = new Date(prevYear, prevMonth, 0).getDate()

  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(prevYear, prevMonth - 1, day)
    const lunar = getLunarDate(date)
    const monthDay = `${prevMonth}-${day}`
    const lunarMonthDay = `${prevMonth}-${day}` // 简化处理

    dates.push({
      key: `${prevYear}-${prevMonth}-${day}`,
      day,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isHoliday: !!(festivals as Record<string, string>)[monthDay],
      isFestival: !!(lunarFestivals as Record<string, string>)[lunarMonthDay],
      lunar: lunar.short,
      lunarYear: lunar.year,
      lunarMonth: lunar.month,
      lunarDay: lunar.day,
      weekDay: weekDays[date.getDay()],
      festival: festivals[monthDay] || lunarFestivals[lunarMonthDay],
      solarTerm: (solarTerms as Record<string, string>)[monthDay]
    })
  }

  // 当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const lunar = getLunarDate(date)
    const monthDay = `${month}-${day}`
    const lunarMonthDay = `${month}-${day}` // 简化处理
    const isToday = date.toDateString() === today.toDateString()

    dates.push({
      key: `${year}-${month}-${day}`,
      day,
      month,
      year,
      isCurrentMonth: true,
      isToday,
      isSelected: false,
      isHoliday: !!(festivals as Record<string, string>)[monthDay],
      isFestival: !!(lunarFestivals as Record<string, string>)[lunarMonthDay],
      lunar: lunar.short,
      lunarYear: lunar.year,
      lunarMonth: lunar.month,
      lunarDay: lunar.day,
      weekDay: weekDays[date.getDay()],
      festival: festivals[monthDay] || lunarFestivals[lunarMonthDay],
      solarTerm: (solarTerms as Record<string, string>)[monthDay]
    })
  }

  // 下个月的日期
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const remainingDays = 42 - dates.length

  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(nextYear, nextMonth - 1, day)
    const lunar = getLunarDate(date)
    const monthDay = `${nextMonth}-${day}`
    const lunarMonthDay = `${nextMonth}-${day}` // 简化处理

    dates.push({
      key: `${nextYear}-${nextMonth}-${day}`,
      day,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isHoliday: !!(festivals as Record<string, string>)[monthDay],
      isFestival: !!(lunarFestivals as Record<string, string>)[lunarMonthDay],
      lunar: lunar.short,
      lunarYear: lunar.year,
      lunarMonth: lunar.month,
      lunarDay: lunar.day,
      weekDay: weekDays[date.getDay()],
      festival: festivals[monthDay] || lunarFestivals[lunarMonthDay],
      solarTerm: (solarTerms as Record<string, string>)[monthDay]
    })
  }

  return dates
})

const prevMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const goToday = () => {
  currentDate.value = new Date()
  selectedDate.value = null
}

const selectDate = (date: CalendarDate) => {
  // 清除之前的选中状态
  calendarDates.value.forEach(d => d.isSelected = false)
  // 设置新的选中状态
  date.isSelected = true
  selectedDate.value = date
}
</script>

<style scoped>
.lunar-calendar {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lunar-calendar {
  animation: fadeIn 0.5s ease-out;
}

/* 日期格子悬停效果 */
.grid>div {
  transition: all 0.2s ease;
}

.grid>div:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
