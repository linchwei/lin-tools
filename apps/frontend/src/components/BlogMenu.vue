<template>
    <div class="relative h-full bg-white border-r border-gray-200 transition-all duration-300 overflow-visible"
        :class="{ 'bg-gradient-to-b from-gray-50 to-gray-100': isCollapsed }">

        <!-- 折叠按钮 -->
        <button @click="toggleCollapse" :title="isCollapsed ? '展开菜单 (Ctrl+B)' : '折叠菜单 (Ctrl+B)'" class="absolute top-5 z-30 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600
                   border-2 border-white/20 rounded-full flex items-center justify-center text-white
                   hover:from-blue-600 hover:to-purple-700 hover:-translate-y-1 hover:scale-110
                   active:translate-y-0 active:scale-105 transition-all duration-300 shadow-lg
                   backdrop-blur-sm cursor-pointer"
            :class="isCollapsed ? 'right-[-20px] bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl' : 'right-3'">
            <el-icon :size="16">
                <component :is="isCollapsed ? 'ArrowRight' : 'ArrowLeft'" />
            </el-icon>
        </button>

        <!-- 菜单内容 -->
        <el-menu :default-active="$route.path" router :collapse="isCollapsed" :collapse-transition="true"
            class="h-full border-none pt-5 transition-all duration-300" :class="isCollapsed ? 'w-16' : 'w-64'">

            <template v-for="item in menuItems" :key="item.id">
                <!-- 单级菜单项 -->
                <el-menu-item v-if="!item.children" :index="item.path" :disabled="item.meta?.disabled"
                    class="mx-2 mb-1 rounded-lg transition-colors duration-200">
                    <el-icon v-if="item.icon" class="mr-2">
                        <component :is="iconComponents[item.icon]" />
                    </el-icon>
                    <template #title>{{ item.name }}</template>
                </el-menu-item>

                <!-- 多级菜单项 -->
                <el-sub-menu v-else :index="item.id" :disabled="item.meta?.disabled" class="mx-2 mb-1">
                    <template #title>
                        <el-icon v-if="item.icon" class="mr-2">
                            <component :is="iconComponents[item.icon]" />
                        </el-icon>
                        <span>{{ item.name }}</span>
                    </template>

                    <el-menu-item v-for="child in item.children" :key="child.id" :index="child.path"
                        :disabled="child.meta?.disabled"
                        class="ml-4 mr-2 mb-1 rounded-lg transition-colors duration-200">
                        <el-icon v-if="child.icon" class="mr-2">
                            <component :is="iconComponents[child.icon]" />
                        </el-icon>
                        <template #title>{{ child.name }}</template>
                    </el-menu-item>
                </el-sub-menu>
            </template>
        </el-menu>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { generateMenuFromRoutes, filterAccessibleMenuItems } from '@/utils/menuGenerator'
import * as ElementPlusIcons from '@element-plus/icons-vue'

const $route = useRoute()

// 动态导入所有图标组件
const iconComponents = ElementPlusIcons

// 从路由生成菜单数据
const menuItems = computed(() => {
    const allMenuItems = generateMenuFromRoutes()
    return filterAccessibleMenuItems(allMenuItems)
})

// 折叠状态
const isCollapsed = ref(false)

// 从localStorage恢复折叠状态
const savedCollapsed = localStorage.getItem('sidebar-collapsed')
if (savedCollapsed !== null) {
    isCollapsed.value = JSON.parse(savedCollapsed)
}

// 监听折叠状态变化并保存到localStorage
const saveCollapsedState = () => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed.value))
}

// 切换折叠状态
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
    saveCollapsedState()

    // 触发自定义事件通知App.vue更新布局
    window.dispatchEvent(new CustomEvent('sidebar-toggle'))
}

// 键盘快捷键支持
const handleKeydown = (event: KeyboardEvent) => {
    // Ctrl/Cmd + B 切换菜单
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        toggleCollapse()
    }
}

// 生命周期钩子
onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 只保留Element Plus菜单的必要样式覆盖 */
:deep(.el-menu) {
    background: transparent;
    border: none;
}

:deep(.el-menu-item.is-active) {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
    color: white !important;
    font-weight: 600;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

:deep(.el-menu-item.is-active .el-icon) {
    color: white !important;
}

:deep(.el-menu-item:hover) {
    background-color: #ecf5ff !important;
    color: #3b82f6 !important;
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    color: #3b82f6 !important;
    font-weight: 600;
}

:deep(.el-sub-menu__title:hover) {
    background-color: #f5f7fa !important;
    color: #3b82f6 !important;
}

/* 移动端响应式 */
@media (max-width: 768px) {
    .sidebar-container {
        position: fixed !important;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 1050;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    .sidebar-container.mobile-open {
        transform: translateX(0);
    }

    .sidebar-container button {
        display: none !important;
    }
}
</style>
