<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Menu } from '@element-plus/icons-vue'
import BlogMenu from '@/components/BlogMenu.vue'

// 监听菜单折叠状态
const sidebarWidth = ref('250px')
const isMobileMenuOpen = ref(false)

// 监听localStorage变化来同步菜单状态
const updateSidebarWidth = () => {
  const isCollapsed = localStorage.getItem('sidebar-collapsed')
  sidebarWidth.value = isCollapsed === 'true' ? '64px' : '250px'

  // 触发重新布局
  nextTick(() => {
    window.dispatchEvent(new Event('resize'))
  })
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

onMounted(() => {
  updateSidebarWidth()

  // 监听localStorage变化
  window.addEventListener('storage', updateSidebarWidth)

  // 监听自定义事件（用于同一页面内的状态同步）
  window.addEventListener('sidebar-toggle', updateSidebarWidth)

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      isMobileMenuOpen.value = false
    }
  })
})
</script>

<template>
  <div class="app-container">
    <!-- 移动端菜单按钮 -->
    <button class="mobile-menu-btn" @click="toggleMobileMenu">
      <el-icon>
        <Menu />
      </el-icon>
    </button>

    <!-- 移动端遮罩层 -->
    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>

    <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }" :style="{ width: sidebarWidth }">
      <BlogMenu />
    </aside>

    <main class="main-content" :style="{ marginLeft: sidebarWidth }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow: hidden;
}

.main-content {
  min-height: 100vh;
  padding: 24px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 20px;
  cursor: pointer;
  z-index: 1001;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-btn:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* 移动端遮罩层 */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-overlay {
    display: block;
  }

  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 280px !important;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0 !important;
    padding: 16px;
    padding-top: 80px;
    /* 为移动端菜单按钮留出空间 */
  }
}

/* 内容区域样式优化 */
:deep(.page-container) {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

/* 滚动条样式 */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
