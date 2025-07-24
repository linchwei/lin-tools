<template>
    <el-menu :default-active="$route.path" class="h-full" router>
        <el-menu-item index="/">
            <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/upload">
            <span>文件上传</span>
        </el-menu-item>
        <el-menu-item index="/big-table">
            <span>大数据表格</span>
        </el-menu-item>
        <el-menu-item index="/code-sandbox">
            <span>代码沙箱</span>
        </el-menu-item>
        <el-menu-item index="/eat-snake">
            <span>贪吃蛇</span>
        </el-menu-item>
        <el-menu-item index="/calculator">
            <span>计算器</span>
        </el-menu-item>
        <el-menu-item index="/calendar">
            <span>农历日历</span>
        </el-menu-item>
        <el-menu-item index="/animation-showcase">
            <span>动画展示</span>
        </el-menu-item>
        <el-menu-item index="/pdf-viewer">
            <span>PDF 预览</span>
        </el-menu-item>
        <el-menu-item index="/code-generator">
            <span>代码生成器</span>
        </el-menu-item>
        <el-menu-item index="/collaborative-whiteboard">
            <span>协作白板</span>
        </el-menu-item>
        <el-menu-item index="/audio-visualizer">
            <span>音频可视化</span>
        </el-menu-item>
        <el-menu-item index="/component-demo">
            <span>组件演示</span>
        </el-menu-item>
    </el-menu>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ElMenu, ElMenuItem } from 'element-plus';
const $route = useRoute();
</script>

<style scoped>
.h-full {
    height: 100%;
}
</style>
