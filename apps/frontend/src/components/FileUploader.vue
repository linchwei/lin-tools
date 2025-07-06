<template>
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10">
        <div class="max-w-3xl mx-auto px-4">
            <!-- 标题 -->
            <div class="h-2 text-center mb-20"> 大文件分片上传 </div>

            <!-- 拖放区域 -->
            <el-upload ref="uploadRef" drag multiple :show-file-list="false" :auto-upload="false"
                :before-upload="() => false" class="w-full" @change="onFileChange" @drop.native.prevent="onDrop"
                @dragover.native.prevent="onDragOver" @dragleave.native.prevent="isDragging = false">
                <div class="flex flex-col items-center justify-center py-8 cursor-pointer group">
                    <CloudArrowUpIcon
                        class="w-16 h-16 group-hover:scale-110 transition-transform duration-200 text-blue-400" />
                    <h2 class="mt-3 text-lg font-semibold text-gray-700">拖放文件到此处上传</h2>
                    <p class="mt-1 text-gray-500">或 <span
                            class="text-indigo-600 underline hover:text-indigo-800">点击选择文件</span></p>
                    <p class="text-xs text-gray-400 mt-1">支持多选大文件上传</p>
                </div>
            </el-upload>

            <!-- 新增：待上传文件列表 -->
            <el-card v-if="selectedFiles.length" class="mb-8" shadow="hover">
                <template #header>
                    <div class="flex items-center gap-2 font-bold text-blue-700">
                        <CloudArrowUpIcon class="text-blue-400 w-5 h-5" /> 待上传文件
                    </div>
                </template>
                <el-table :data="selectedFiles" border stripe size="small" class="rounded-xl">
                    <el-table-column label="文件名" prop="name" min-width="120">
                        <template #default="scope">
                            <span class="text-gray-800">{{ scope.row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="扩展名" min-width="80">
                        <template #default="scope">
                            <span class="text-blue-500">{{ scope.row.name.split('.').pop() }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="大小" min-width="100">
                        <template #default="scope">
                            <span class="text-gray-600">{{ formatSize(scope.row.size) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="120">
                        <template #default="scope">
                            <el-button size="small" type="primary" plain @click.stop="uploadSingleFile(scope.$index)">
                                <CloudArrowUpIcon class="w-4 h-4 mr-1" /> 上传
                            </el-button>
                            <el-button size="small" type="danger" plain @click.stop="removeSelectedFile(scope.$index)">
                                <TrashIcon class="w-4 h-4 mr-1" /> 删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="flex justify-end mt-6">
                    <el-button type="primary" size="large" @click="startSelectedUpload">
                        开始上传
                    </el-button>
                </div>
            </el-card>

            <!-- 上传准备中动画 -->
            <div v-if="preparingFilesCount > 0" class="flex items-center justify-center mb-6">
                <el-icon class="is-loading text-indigo-400 mr-2"><i class="el-icon-loading"></i></el-icon>
                <span class="text-indigo-500 animate-pulse text-base">正在准备上传文件，请稍候...</span>
            </div>

            <!-- 上传文件列表 -->
            <div v-if="Object.keys(uploads).length" class="space-y-6">
                <el-card v-for="upload in uploads" :key="upload.id"
                    class="rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                    <div class="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <DocumentIcon class="w-5 h-5 text-gray-400" />
                                <span class="font-semibold truncate max-w-[180px] text-gray-800 text-base">{{
                                    upload.name }}</span>
                            </div>
                            <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <span>{{ formatSize(upload.size) }}</span>
                                <span class="mx-1">•</span>
                                <span :class="statusClasses[upload.status]">{{ statusLabels[upload.status] }}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-1">
                            <el-tooltip v-if="upload.status === 'uploading' || upload.status === 'failed'" content="暂停">
                                <el-button circle size="small" @click="pauseUpload(upload.id)">
                                    <PauseIcon class="w-4 h-4 text-indigo-500" />
                                </el-button>
                            </el-tooltip>
                            <el-tooltip v-if="upload.status === 'paused'" content="继续">
                                <el-button circle size="small" type="success" @click="resumeUpload(upload.id)">
                                    <PlayIcon class="w-4 h-4 text-green-500" />
                                </el-button>
                            </el-tooltip>
                            <el-tooltip content="移除">
                                <el-button circle size="small" type="danger" @click="removeUpload(upload.id)">
                                    <TrashIcon class="w-4 h-4 text-red-400" />
                                </el-button>
                            </el-tooltip>
                        </div>
                    </div>
                    <!-- 进度条动画、速度、剩余时间优化 -->
                    <div class="px-5 pb-5">
                        <el-progress :percentage="upload.progress"
                            :status="upload.status === 'completed' ? 'success' : upload.status === 'failed' ? 'exception' : upload.status === 'paused' ? 'warning' : ''"
                            :stroke-width="10" :show-text="false" class="mb-2" />
                        <div class="flex flex-wrap justify-between text-xs text-gray-500 mt-2 items-center gap-2">
                            <span class="font-mono">{{ upload.progress }}%</span>
                            <span class="font-mono">{{ formatSize(upload.uploadedSize) }} / {{ formatSize(upload.size)
                            }}</span>
                            <span v-if="upload.status === 'preparing'" class="text-indigo-400 flex items-center gap-1">
                                <el-icon class="is-loading"><i class="el-icon-loading"></i></el-icon>
                                <span class="animate-pulse">上传准备中</span>
                            </span>
                            <span v-else-if="upload.status === 'uploading'" class="flex items-center gap-1">
                                <el-icon class="is-loading"><i class="el-icon-loading"></i></el-icon>
                                <span class="text-blue-500">{{ formatSpeed(upload.speed ?? 0) }}</span>
                                <span class="mx-1 text-gray-300">|</span>
                                <span class="text-indigo-500">剩余 {{ formatEta(upload.eta ?? 0) }}</span>
                            </span>
                            <span v-else-if="upload.status === 'completed'" class="text-green-500">上传完成</span>
                            <span v-else-if="upload.status === 'failed'" class="text-red-500">上传失败</span>
                        </div>
                        <!-- 分片失败重试按钮 -->
                        <div v-if="upload.chunks && upload.chunks.some(c => c.status === 'failed')" class="mt-2">
                            <div class="flex flex-wrap gap-2">
                                <template v-for="chunk in upload.chunks">
                                    <el-button v-if="chunk.status === 'failed'" :key="chunk.index" size="small"
                                        type="danger" plain @click="retryChunk(upload.id, chunk.index)">
                                        <span class="text-xs">重试分片{{ chunk.index }}</span>
                                    </el-button>
                                </template>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// el-upload 组件实例
const uploadRef = ref();

import { ref } from 'vue';
import {
    PlayIcon,
    PauseIcon,
    TrashIcon,
    DocumentIcon,
    CloudArrowUpIcon,
} from '@heroicons/vue/24/outline';
import { useFileUpload } from '@/hooks/useFileUpload';
import {
    ElButton,
    ElCard,
    ElTable,
    ElTableColumn,
    ElProgress,
    ElTooltip,
    ElUpload,
    ElIcon
} from 'element-plus';

const {
    uploads,
    init,
    selectedFiles,
    startSelectedUpload: _startSelectedUpload,
    uploadSingleFile,
    pauseUpload,
    resumeUpload,
    preparingFilesCount,
    removeUpload,
    retryChunk
} = useFileUpload();

// 包装 startSelectedUpload，上传后清空 el-upload fileList
const startSelectedUpload = () => {
    _startSelectedUpload();
    uploadRef.value?.clearFiles();
};
// 兼容 el-upload 的 change 事件，直接赋值 selectedFiles，保持视图同步
const onFileChange = (_file: any, fileList: any[]) => {
    selectedFiles.value = fileList.map(f => f.raw || f);
};

const isDragging = ref(false);

// 初始化加载
init();

// 拖放处理
const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = true;
};

const onDrop = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = false;
    // 直接赋值 selectedFiles，保持与 onFileChange 行为一致
    if (e.dataTransfer?.files) {
        selectedFiles.value = Array.from(e.dataTransfer.files);
    }
};

// 格式化文件大小
const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化上传速度
const formatSpeed = (speed: number) => {
    if (!speed || speed < 1) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(speed) / Math.log(k));
    return parseFloat((speed / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化剩余时间
const formatEta = (eta: number) => {
    if (!eta || eta === Infinity) return '--';
    if (eta < 1) return '小于1秒';
    const sec = Math.floor(eta % 60);
    const min = Math.floor((eta / 60) % 60);
    const hour = Math.floor(eta / 3600);
    if (hour > 0) return `${hour}小时${min}分${sec}秒`;
    if (min > 0) return `${min}分${sec}秒`;
    return `${sec}秒`;
};

// 状态标签和样式
const statusLabels = {
    preparing: '上传准备中',
    pending: '等待中',
    uploading: '上传中',
    paused: '已暂停',
    completed: '已完成',
    failed: '上传失败'
};

const statusClasses = {
    preparing: 'text-indigo-400',
    pending: 'text-gray-500',
    uploading: 'text-blue-500',
    paused: 'text-yellow-500',
    completed: 'text-green-500',
    failed: 'text-red-500'
};

// 新增：待上传文件删除功能
const removeSelectedFile = (idx: number) => {
    selectedFiles.value.splice(idx, 1);
};
</script>

<style>
/* 保留 group-hover:scale-110 动画 */
.group:hover .group-hover\:scale-110 {
    transform: scale(1.1);
}

/* 渐变动画 */
@keyframes gradient-x {
    0% {
        background-position: 0% 50%;
    }

    100% {
        background-position: 100% 50%;
    }
}

.animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 2s linear infinite;
}

.el-upload__input {
    visibility: hidden;
}
</style>
