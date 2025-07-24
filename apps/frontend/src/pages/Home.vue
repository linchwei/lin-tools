<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 py-8">
        <!-- 头部区域 -->
        <div class="text-center mb-12 px-8">
            <h1 class="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                🚀 Lin Tools
            </h1>
            <p class="text-2xl text-white/90 mb-8">
                现代化的数据可视化与工具集合平台
            </p>

            <!-- 搜索栏 -->
            <div class="max-w-2xl mx-auto mb-8">
                <div class="relative bg-white/10 backdrop-blur-md rounded-full border border-white/20
                           p-5 flex items-center transition-all duration-300 hover:bg-white/15
                           focus-within:bg-white/15 focus-within:border-white/40 focus-within:shadow-2xl">
                    <span class="text-xl mr-3 text-white/70">🔍</span>
                    <input v-model="searchKeyword" type="text" placeholder="搜索功能..."
                        class="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 text-lg"
                        @input="handleSearch" />
                    <button v-if="searchKeyword" @click="clearSearch" class="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1
                               transition-all duration-200 text-xl">
                        ✕
                    </button>
                </div>
            </div>

            <!-- 快速筛选 -->
            <div class="flex justify-center gap-3 flex-wrap max-w-4xl mx-auto">
                <button v-for="filter in quickFilters" :key="filter.key" @click="setActiveFilter(filter.key)" class="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2
                           cursor-pointer transition-all duration-300 flex items-center gap-2
                           text-white/80 text-sm hover:bg-white/15 hover:border-white/40
                           hover:-translate-y-1 hover:shadow-lg" :class="{
                            'bg-white/20 border-white/50 text-white shadow-lg': activeFilter === filter.key
                        }">
                    <span class="text-base">{{ filter.icon }}</span>
                    <span>{{ filter.name }}</span>
                    <span class="bg-white/20 rounded-full px-2 py-0.5 text-xs font-semibold">
                        {{ filter.count }}
                    </span>
                </button>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="max-w-7xl mx-auto px-8">
            <!-- 特色功能区域 -->
            <div v-if="!searchKeyword && activeFilter === 'all'" class="mb-16">
                <h2 class="flex items-center gap-3 text-3xl font-bold text-white mb-8 drop-shadow-md">
                    <span class="text-4xl">⭐</span>
                    特色功能
                </h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    <div v-for="entry in featuredEntries" :key="entry.id" @click="navigateTo(entry.path)" class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-blue-400/50
                               cursor-pointer transition-all duration-300 hover:-translate-y-2
                               hover:shadow-2xl hover:border-blue-300/70 hover:bg-white/15
                               transform scale-105 relative overflow-hidden group">

                        <!-- 卡片头部 -->
                        <div class="flex justify-between items-start mb-4">
                            <div class="text-5xl mb-2">{{ entry.icon }}</div>
                            <div v-if="entry.status"
                                class="text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide" :style="{
                                    color: statusConfig[entry.status].color,
                                    backgroundColor: statusConfig[entry.status].bgColor
                                }">
                                {{ statusConfig[entry.status].name }}
                            </div>
                        </div>

                        <!-- 卡片内容 -->
                        <h3 class="text-2xl font-semibold text-white mb-3 leading-tight">
                            {{ entry.title }}
                        </h3>
                        <p class="text-white/80 leading-relaxed mb-4 text-base">
                            {{ entry.description }}
                        </p>

                        <!-- 标签 -->
                        <div class="flex gap-2 mb-4 flex-wrap">
                            <span v-for="tag in entry.tags.slice(0, 3)" :key="tag" class="bg-blue-400/30 text-white px-3 py-1 rounded-full text-sm
                                       font-medium border border-blue-400/40">
                                {{ tag }}
                            </span>
                        </div>

                        <!-- 卡片底部 -->
                        <div class="flex justify-between items-center mt-auto">
                            <div v-if="entry.difficulty" class="flex items-center gap-1 text-sm text-white/70">
                                <span class="text-base">{{ difficultyConfig[entry.difficulty].icon }}</span>
                                <span>{{ difficultyConfig[entry.difficulty].name }}</span>
                            </div>
                        </div>

                        <!-- 悬停效果 -->
                        <div class="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                   rounded-2xl"></div>
                    </div>
                </div>
            </div>

            <!-- 分类展示区域 -->
            <div class="space-y-12">
                <div v-for="category in displayCategories" :key="category" class="mb-12">
                    <h2 class="flex items-center gap-3 text-3xl font-bold text-white mb-8 drop-shadow-md">
                        <span class="text-4xl">{{ categoryConfig[category].icon }}</span>
                        {{ categoryConfig[category].name }}
                        <span class="text-xl text-white/70 font-medium">
                            ({{ getEntriesByCategory(category).length }})
                        </span>
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div v-for="entry in getFilteredEntriesByCategory(category)" :key="entry.id"
                            @click="navigateTo(entry.path)" class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20
                                   cursor-pointer transition-all duration-300 hover:-translate-y-2
                                   hover:shadow-xl hover:border-white/40 hover:bg-white/15
                                   relative overflow-hidden group">

                            <!-- 卡片头部 -->
                            <div class="flex justify-between items-start mb-4">
                                <div class="text-4xl mb-2">{{ entry.icon }}</div>
                                <div v-if="entry.status"
                                    class="text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide" :style="{
                                        color: statusConfig[entry.status].color,
                                        backgroundColor: statusConfig[entry.status].bgColor
                                    }">
                                    {{ statusConfig[entry.status].name }}
                                </div>
                            </div>

                            <!-- 卡片内容 -->
                            <h3 class="text-xl font-semibold text-white mb-3 leading-tight">
                                {{ entry.title }}
                            </h3>
                            <p class="text-white/80 leading-relaxed mb-4 text-sm">
                                {{ entry.description }}
                            </p>

                            <!-- 标签 -->
                            <div class="flex gap-2 mb-4 flex-wrap">
                                <span v-for="tag in entry.tags.slice(0, 2)" :key="tag" class="bg-white/20 text-white px-2 py-1 rounded-full text-xs
                                           font-medium border border-white/30">
                                    {{ tag }}
                                </span>
                            </div>

                            <!-- 卡片底部 -->
                            <div class="flex justify-between items-center mt-auto">
                                <div v-if="entry.difficulty" class="flex items-center gap-1 text-xs text-white/70">
                                    <span class="text-sm">{{ difficultyConfig[entry.difficulty].icon }}</span>
                                    <span>{{ difficultyConfig[entry.difficulty].name }}</span>
                                </div>
                            </div>

                            <!-- 悬停效果 -->
                            <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                       rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 搜索结果 -->
            <div v-if="searchKeyword" class="mb-16">
                <h2 class="flex items-center gap-3 text-3xl font-bold text-white mb-8 drop-shadow-md">
                    <span class="text-4xl">🔍</span>
                    搜索结果
                    <span class="text-xl text-white/70 font-medium">({{ searchResults.length }})</span>
                </h2>
                <div v-if="searchResults.length === 0" class="text-center py-16 text-white/80">
                    <div class="text-6xl mb-4">😔</div>
                    <p class="text-xl mb-2">没有找到相关功能</p>
                    <p class="text-lg text-white/60">试试其他关键词吧</p>
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div v-for="entry in searchResults" :key="entry.id" @click="navigateTo(entry.path)" class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20
                               cursor-pointer transition-all duration-300 hover:-translate-y-2
                               hover:shadow-xl hover:border-white/40 hover:bg-white/15
                               relative overflow-hidden group">

                        <!-- 卡片头部 -->
                        <div class="flex justify-between items-start mb-4">
                            <div class="text-4xl mb-2">{{ entry.icon }}</div>
                            <div class="text-sm text-white/70 bg-white/10 px-2 py-1 rounded-full">
                                {{ categoryConfig[entry.category].name }}
                            </div>
                        </div>

                        <!-- 卡片内容 -->
                        <h3 class="text-xl font-semibold text-white mb-3 leading-tight">
                            {{ entry.title }}
                        </h3>
                        <p class="text-white/80 leading-relaxed mb-4 text-sm">
                            {{ entry.description }}
                        </p>

                        <!-- 标签 -->
                        <div class="flex gap-2 flex-wrap">
                            <span v-for="tag in entry.tags.slice(0, 2)" :key="tag" class="bg-white/20 text-white px-2 py-1 rounded-full text-xs
                                       font-medium border border-white/30">
                                {{ tag }}
                            </span>
                        </div>

                        <!-- 悬停效果 -->
                        <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                   rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 统计信息 -->
        <div class="flex justify-center gap-16 flex-wrap mt-16 px-8">
            <div class="text-center text-white">
                <div class="text-4xl font-bold mb-2 drop-shadow-md">{{ homeEntries.length }}+</div>
                <div class="text-lg opacity-80">功能模块</div>
            </div>
            <div class="text-center text-white">
                <div class="text-4xl font-bold mb-2 drop-shadow-md">Vue 3</div>
                <div class="text-lg opacity-80">现代框架</div>
            </div>
            <div class="text-center text-white">
                <div class="text-4xl font-bold mb-2 drop-shadow-md">D3.js</div>
                <div class="text-lg opacity-80">数据可视化</div>
            </div>
            <div class="text-center text-white">
                <div class="text-4xl font-bold mb-2 drop-shadow-md">TypeScript</div>
                <div class="text-lg opacity-80">类型安全</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    homeEntries,
    getFeaturedEntries,
    getEntriesByCategory,
    searchEntries,
    categoryConfig,
    statusConfig,
    difficultyConfig,
    type HomeEntry
} from '@/config/homeEntries'

const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const activeFilter = ref('all')
const searchResults = ref<HomeEntry[]>([])

// 计算属性
const featuredEntries = computed(() => getFeaturedEntries())

const quickFilters = computed(() => [
    { key: 'all', name: '全部', icon: '🏠', count: homeEntries.length },
    { key: 'featured', name: '特色', icon: '⭐', count: featuredEntries.value.length },
    { key: 'new', name: '最新', icon: '🆕', count: homeEntries.filter(e => e.status === 'new').length },
    { key: 'hot', name: '热门', icon: '🔥', count: homeEntries.filter(e => e.status === 'hot').length },
    { key: 'tool', name: '工具', icon: '🛠️', count: getEntriesByCategory('tool').length },
    { key: 'visualization', name: '可视化', icon: '📊', count: getEntriesByCategory('visualization').length }
])

const displayCategories = computed(() => {
    if (searchKeyword.value) return []

    switch (activeFilter.value) {
        case 'all':
            return ['tool', 'visualization', 'form', 'demo', 'game'] as const
        case 'featured':
            return []
        case 'new':
            return ['tool', 'visualization', 'form'] as const
        case 'hot':
            return ['featured', 'tool'] as const
        case 'tool':
            return ['tool'] as const
        case 'visualization':
            return ['visualization'] as const
        default:
            return ['tool', 'visualization', 'form', 'demo', 'game'] as const
    }
})

// 方法
const navigateTo = (path: string) => {
    router.push(path)
}

const handleSearch = () => {
    if (searchKeyword.value.trim()) {
        searchResults.value = searchEntries(searchKeyword.value.trim())
    } else {
        searchResults.value = []
    }
}

const clearSearch = () => {
    searchKeyword.value = ''
    searchResults.value = []
}

const setActiveFilter = (filterKey: string) => {
    activeFilter.value = filterKey
    // 清除搜索
    searchKeyword.value = ''
    searchResults.value = []
}

const getFilteredEntriesByCategory = (category: HomeEntry['category']) => {
    let entries = getEntriesByCategory(category)

    switch (activeFilter.value) {
        case 'new':
            entries = entries.filter(e => e.status === 'new')
            break
        case 'hot':
            entries = entries.filter(e => e.status === 'hot')
            break
        case 'featured':
            entries = entries.filter(e => e.featured)
            break
    }

    return entries
}

// 生命周期
onMounted(() => {
    // 可以在这里添加一些初始化逻辑
})
</script>

<style lang="scss" scoped>
// 动画效果
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

// 卡片动画
.feature-card,
.entry-card {
    animation: fadeInUp 0.6s ease-out;

    &:nth-child(1) {
        animation-delay: 0.1s;
    }

    &:nth-child(2) {
        animation-delay: 0.2s;
    }

    &:nth-child(3) {
        animation-delay: 0.3s;
    }

    &:nth-child(4) {
        animation-delay: 0.4s;
    }
}

// 响应式调整
@media (max-width: 768px) {
    .text-6xl {
        font-size: 2.25rem;
        line-height: 2.5rem;
    }

    .text-2xl {
        font-size: 1.5rem;
        line-height: 2rem;
    }

    .px-8 {
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .gap-16 {
        gap: 2rem;
    }

    .text-4xl {
        font-size: 1.875rem;
        line-height: 2.25rem;
    }
}

@media (max-width: 480px) {
    .text-4xl {
        font-size: 1.5rem;
        line-height: 2rem;
    }

    .text-xl {
        font-size: 1.125rem;
        line-height: 1.75rem;
    }

    .px-4 {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }

    .gap-8 {
        gap: 1rem;
    }
}
</style>
