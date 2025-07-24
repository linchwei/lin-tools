<template>
    <div class="p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
        <div class="max-w-7xl mx-auto">
            <div class="mb-6">
                <h1
                    class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    超大数据表格
                </h1>
                <p class="text-gray-600 text-lg">基于 Canvas 虚拟滚动的高性能表格，支持编辑、删除、搜索、排序等功能</p>
            </div>

            <CanvasTable ref="tableRef" v-model:data="rows" :columns="tableColumns" :height="600" :loading="loading"
                @refresh="fetchData" @row-edit="handleRowEdit" @row-delete="handleRowDelete"
                @selection-change="handleSelectionChange" />

            <!-- 统计信息 -->
            <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div
                    class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <ChartBarIcon class="h-10 w-10 text-blue-500" />
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">总记录数</p>
                            <p class="text-3xl font-bold text-gray-900">{{ rows.length.toLocaleString() }}</p>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <ClockIcon class="h-10 w-10 text-green-500" />
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">渲染性能</p>
                            <p class="text-3xl font-bold text-gray-900">60 FPS</p>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <CpuChipIcon class="h-10 w-10 text-purple-500" />
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">内存占用</p>
                            <p class="text-3xl font-bold text-gray-900">
                                < 50MB</p>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <CheckCircleIcon class="h-10 w-10 text-indigo-500" />
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">已选择</p>
                            <p class="text-3xl font-bold text-gray-900">{{ selectedCount }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CanvasTable from '@/components/CanvasTable.vue';
import { ChartBarIcon, ClockIcon, CpuChipIcon, CheckCircleIcon } from '@heroicons/vue/24/outline';

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const selectedCount = ref(0);

const tableColumns = [
    { key: 'name', label: '姓名', flex: 1 },
    { key: 'age', label: '年龄', flex: 1 },
    { key: 'email', label: '邮箱', flex: 2 },
    { key: 'desc', label: '描述', flex: 3 },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const res = await fetch('/api/bigdata?count=100000');
        const data = await res.json();
        rows.value = data.data;
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        loading.value = false;
    }
};

const handleRowEdit = (event: any) => {
    console.log('行编辑:', event);
};

const handleRowDelete = (deletedRows: any[]) => {
    console.log('行删除:', deletedRows);
};

const handleSelectionChange = (selected: any[]) => {
    selectedCount.value = selected.length;
    console.log('选择变化:', selected);
};

// 初始加载数据
fetchData();
</script>
