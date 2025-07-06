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
