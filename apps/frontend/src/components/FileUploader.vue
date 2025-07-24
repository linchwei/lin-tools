<template>
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white py-10">
        <div class="max-w-4xl mx-auto px-4">
            <!-- 增强标题 -->
            <div class="text-center mb-12">
                <h1
                    class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
                    大文件分片上传
                </h1>
                <p class="text-gray-600 text-lg">支持断点续传、秒传、多文件并发上传</p>
            </div>

            <!-- 增强拖放区域 -->
            <el-upload ref="uploadRef" drag multiple :show-file-list="false" :auto-upload="false"
                :before-upload="() => false" class="w-full mb-8 transition-all duration-300 hover:scale-[1.02]"
                @change="onFileChange" @drop.native.prevent="onDrop" @dragover.native.prevent="onDragOver"
                @dragleave.native.prevent="isDragging = false">
                <div
                    class="flex flex-col items-center justify-center py-12 cursor-pointer group relative overflow-hidden">
                    <!-- 背景动画效果 -->
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>

                    <!-- 拖拽状态指示器 -->
                    <div v-if="isDragging"
                        class="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg animate-pulse">
                    </div>

                    <CloudArrowUpIcon
                        class="w-20 h-20 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-300 text-blue-400 mb-4 relative z-10" />
                    <h2 class="text-xl font-semibold text-gray-700 mb-2 relative z-10">拖放文件到此处上传</h2>
                    <p class="text-gray-500 mb-1 relative z-10">或 <span
                            class="text-indigo-600 underline hover:text-indigo-800 font-medium">点击选择文件</span></p>
                    <p class="text-sm text-gray-400 relative z-10">支持多选大文件上传，最大支持 10GB</p>

                    <!-- 支持格式提示 -->
                    <div class="flex flex-wrap gap-2 mt-4 relative z-10">
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">视频</span>
                        <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">图片</span>
                        <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">文档</span>
                        <span class="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">压缩包</span>
                    </div>
                </div>
            </el-upload>

            <!-- 增强待上传文件列表 -->
            <el-card v-if="selectedFiles.length" class="mb-8 shadow-lg border-0 overflow-hidden" shadow="hover">
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                <CloudArrowUpIcon class="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-800 text-lg">待上传文件</h3>
                                <p class="text-sm text-gray-500">共 {{ selectedFiles.length }} 个文件，总大小 {{
                                    formatSize(totalSelectedSize) }}</p>
                            </div>
                        </div>
                        <el-button type="danger" plain size="small" @click="clearSelectedFiles">
                            <TrashIcon class="w-4 h-4 mr-1" /> 清空
                        </el-button>
                    </div>
                </template>

                <el-table :data="selectedFiles" border stripe size="default" class="rounded-xl overflow-hidden">
                    <el-table-column label="文件信息" min-width="200">
                        <template #default="scope">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <DocumentIcon class="w-5 h-5 text-gray-500" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-medium text-gray-800 truncate">{{ scope.row.name }}</p>
                                    <p class="text-xs text-gray-500">{{ getFileExtension(scope.row.name) }} • {{
                                        formatSize(scope.row.size) }}</p>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="文件类型" width="120">
                        <template #default="scope">
                            <el-tag :type="getFileTypeColor(scope.row.name) || 'info'" size="small">
                                {{ getFileType(scope.row.name) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180">
                        <template #default="scope">
                            <div class="flex gap-2">
                                <el-button size="small" type="primary" @click.stop="uploadSingleFile(scope.$index)">
                                    <CloudArrowUpIcon class="w-4 h-4 mr-1" /> 上传
                                </el-button>
                                <el-button size="small" type="danger" plain
                                    @click.stop="removeSelectedFile(scope.$index)">
                                    <TrashIcon class="w-4 h-4" />
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <div class="text-sm text-gray-600">
                        预计上传时间：{{ estimateUploadTime(totalSelectedSize) }}
                    </div>
                    <el-button type="primary" size="large" @click="startSelectedUpload" class="px-8">
                        <CloudArrowUpIcon class="w-5 h-5 mr-2" />
                        开始上传全部
                    </el-button>
                </div>
            </el-card>

            <!-- 增强上传准备中动画 -->
            <div v-if="preparingFilesCount > 0" class="flex items-center justify-center mb-8">
                <div class="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
                    <div class="relative">
                        <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin">
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-xs font-bold text-indigo-500">{{ preparingFilesCount }}</span>
                        </div>
                    </div>
                    <div>
                        <p class="text-indigo-600 font-medium">正在准备上传文件</p>
                        <p class="text-sm text-gray-500">计算文件哈希值中，请稍候...</p>
                    </div>
                </div>
            </div>

            <!-- 增强上传文件列表 -->
            <div v-if="Object.keys(uploads).length" class="space-y-4">
                <!-- 上传统计 -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <p class="text-2xl font-bold text-blue-600">{{ Object.keys(uploads).length }}</p>
                            <p class="text-sm text-gray-600">总文件数</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-green-600">{{ completedCount }}</p>
                            <p class="text-sm text-gray-600">已完成</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-orange-600">{{ uploadingCount }}</p>
                            <p class="text-sm text-gray-600">上传中</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-red-600">{{ failedCount }}</p>
                            <p class="text-sm text-gray-600">失败</p>
                        </div>
                    </div>
                </div>

                <!-- 文件列表 -->
                <el-card v-for="upload in uploads" :key="upload.id"
                    class="rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    :class="getUploadCardClass(upload.status)">
                    <div class="p-6">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-3 mb-2">
                                    <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                        <DocumentIcon class="w-6 h-6 text-gray-500" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-semibold text-gray-800 text-lg truncate">{{ upload.name }}</h4>
                                        <div class="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span>{{ formatSize(upload.size) }}</span>
                                            <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span :class="statusClasses[upload.status]" class="font-medium">
                                                {{ statusLabels[upload.status] }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                <el-tooltip v-if="upload.status === 'uploading' || upload.status === 'failed'"
                                    content="暂停">
                                    <el-button circle size="default" @click="pauseUpload(upload.id)"
                                        class="hover:scale-110 transition-transform">
                                        <PauseIcon class="w-5 h-5 text-indigo-500" />
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip v-if="upload.status === 'paused'" content="继续">
                                    <el-button circle size="default" type="success" @click="resumeUpload(upload.id)"
                                        class="hover:scale-110 transition-transform">
                                        <PlayIcon class="w-5 h-5 text-green-500" />
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="移除">
                                    <el-button circle size="default" type="danger" @click="removeUpload(upload.id)"
                                        class="hover:scale-110 transition-transform">
                                        <TrashIcon class="w-5 h-5 text-red-400" />
                                    </el-button>
                                </el-tooltip>
                            </div>
                        </div>

                        <!-- 增强进度条 -->
                        <div class="mt-4">
                            <el-progress :percentage="upload.progress"
                                :status="upload.status === 'completed' ? 'success' : upload.status === 'failed' ? 'exception' : upload.status === 'paused' ? 'warning' : ''"
                                :stroke-width="12" :show-text="false" class="mb-3"
                                :class="{ 'progress-animated': upload.status === 'uploading' }" />

                            <div class="flex flex-wrap justify-between items-center text-sm gap-3">
                                <span class="font-mono font-bold text-lg">{{ upload.progress }}%</span>
                                <span class="font-mono text-gray-600">
                                    {{ formatSize(upload.uploadedSize) }} / {{ formatSize(upload.size) }}
                                </span>

                                <div class="flex items-center gap-3">
                                    <span v-if="upload.status === 'preparing'"
                                        class="text-indigo-500 flex items-center gap-2">
                                        <div
                                            class="w-4 h-4 border-2 border-indigo-300 border-t-indigo-500 rounded-full animate-spin">
                                        </div>
                                        <span class="animate-pulse font-medium">准备中</span>
                                    </span>
                                    <span v-else-if="upload.status === 'uploading'" class="flex items-center gap-3">
                                        <div class="flex items-center gap-1 text-blue-600">
                                            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            <span class="font-medium">{{ formatSpeed(upload.speed ?? 0) }}</span>
                                        </div>
                                        <span class="text-gray-400">|</span>
                                        <span class="text-indigo-600 font-medium">剩余 {{ formatEta(upload.eta ?? 0)
                                        }}</span>
                                    </span>
                                    <span v-else-if="upload.status === 'completed'"
                                        class="text-green-600 font-medium flex items-center gap-1">
                                        <CheckCircleIcon class="w-4 h-4" />
                                        上传完成
                                    </span>
                                    <span v-else-if="upload.status === 'failed'"
                                        class="text-red-600 font-medium flex items-center gap-1">
                                        <XCircleIcon class="w-4 h-4" />
                                        上传失败
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- 分片失败重试按钮 -->
                        <div v-if="upload.chunks && upload.chunks.some(c => c.status === 'failed')"
                            class="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                            <p class="text-sm text-red-700 mb-3 font-medium">部分分片上传失败，点击重试：</p>
                            <div class="flex flex-wrap gap-2">
                                <template v-for="chunk in upload.chunks">
                                    <el-button v-if="chunk.status === 'failed'" :key="chunk.index" size="small"
                                        type="danger" plain @click="retryChunk(upload.id, chunk.index)"
                                        class="hover:scale-105 transition-transform">
                                        重试分片 {{ chunk.index + 1 }}
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
import { ref, computed } from 'vue';
import {
    PlayIcon,
    PauseIcon,
    TrashIcon,
    DocumentIcon,
    CloudArrowUpIcon,
    CheckCircleIcon,
    XCircleIcon,
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
    ElIcon,
    ElTag
} from 'element-plus';

// el-upload 组件实例
const uploadRef = ref();

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

// 计算属性
const totalSelectedSize = computed(() =>
    selectedFiles.value.reduce((sum, file) => sum + file.size, 0)
);

const completedCount = computed(() =>
    Object.values(uploads).filter(u => u.status === 'completed').length
);

const uploadingCount = computed(() =>
    Object.values(uploads).filter(u => u.status === 'uploading').length
);

const failedCount = computed(() =>
    Object.values(uploads).filter(u => u.status === 'failed').length
);

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
    if (e.dataTransfer?.files) {
        selectedFiles.value = Array.from(e.dataTransfer.files);
    }
};

// 新增功能函数
const clearSelectedFiles = () => {
    selectedFiles.value = [];
    uploadRef.value?.clearFiles();
};

const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'UNKNOWN';
};

const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return '图片';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext || '')) return '视频';
    if (['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx'].includes(ext || '')) return '文档';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return '压缩包';
    return '其他';
};

const getFileTypeColor = (filename: string) => {
    const type = getFileType(filename);
    switch (type) {
        case '图片': return 'success';
        case '视频': return 'primary';
        case '文档': return 'warning';
        case '压缩包': return 'info';
        default: return '';
    }
};

const estimateUploadTime = (totalSize: number) => {
    const avgSpeed = 5 * 1024 * 1024; // 假设平均 5MB/s
    const seconds = totalSize / avgSpeed;
    if (seconds < 60) return `约 ${Math.ceil(seconds)} 秒`;
    if (seconds < 3600) return `约 ${Math.ceil(seconds / 60)} 分钟`;
    return `约 ${Math.ceil(seconds / 3600)} 小时`;
};

const getUploadCardClass = (status: string) => {
    switch (status) {
        case 'completed': return 'border-l-4 border-l-green-500';
        case 'failed': return 'border-l-4 border-l-red-500';
        case 'uploading': return 'border-l-4 border-l-blue-500';
        case 'paused': return 'border-l-4 border-l-yellow-500';
        default: return 'border-l-4 border-l-gray-300';
    }
};

// 格式化函数保持不变
const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatSpeed = (speed: number) => {
    if (!speed || speed < 1) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(speed) / Math.log(k));
    return parseFloat((speed / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

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
    preparing: '准备中',
    pending: '等待中',
    uploading: '上传中',
    paused: '已暂停',
    completed: '已完成',
    failed: '上传失败'
};

const statusClasses = {
    preparing: 'text-indigo-500',
    pending: 'text-gray-500',
    uploading: 'text-blue-500',
    paused: 'text-yellow-500',
    completed: 'text-green-500',
    failed: 'text-red-500'
};

const removeSelectedFile = (idx: number) => {
    selectedFiles.value.splice(idx, 1);
};
</script>

<style scoped>
.progress-animated .el-progress-bar__inner {
    background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #3b82f6);
    background-size: 200% 100%;
    animation: progress-flow 2s linear infinite;
}

@keyframes progress-flow {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.group:hover .group-hover\:scale-110 {
    transform: scale(1.1);
}

.el-upload__input {
    visibility: hidden;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
