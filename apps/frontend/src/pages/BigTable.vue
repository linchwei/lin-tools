<template>
    <div class="p-4">
        <h2 class="text-2xl font-bold mb-4">超大数据表格（Canvas虚拟滚动）</h2>
        <div class="mb-4 flex items-center gap-2">
            <el-button type="primary" @click="fetchData" :loading="loading">获取10w+数据</el-button>
            <span v-if="rows.length" class="text-gray-500">共 {{ rows.length }} 条</span>
        </div>
        <div ref="canvasContainer" class="border rounded shadow bg-white overflow-auto relative"
            style="height: 400px; width: 100%;">
            <!-- 固定表头 -->
            <div class="table-header sticky top-0 left-0 z-10 bg-white flex border-b"
                :style="{ height: headerHeight + 'px' }">
                <div v-for="(col, idx) in columns" :key="col.key" class="header-cell flex items-center font-bold px-3"
                    :style="{ width: colWidths[idx] + 'px', minWidth: '60px', boxSizing: 'border-box' }">
                    {{ col.label }}
                </div>
            </div>
            <div class="virtual-scroller" :style="{ height: totalHeight + 'px' }"></div>
            <canvas ref="canvasRef" style="position:absolute;left:0;top:0;"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import { ElButton } from 'element-plus';

const rows = ref<any[]>([]);
const loading = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);


const rowHeight = 32;
const headerHeight = 40;
// flex 表示权重，width 仅作初始参考
const columns = [
    { key: 'name', label: '姓名', flex: 1 },
    { key: 'age', label: '年龄', flex: 1 },
    { key: 'desc', label: '描述', flex: 3 },
];

// 响应式列宽
const colWidths = ref<number[]>([180, 100, 600]);

function updateColWidths() {
    const container = canvasContainer.value;
    if (!container) return;
    const totalFlex = columns.reduce((sum, c) => sum + (c.flex || 1), 0);
    const width = container.clientWidth;
    // 最小宽度限制
    const minWidths = [60, 60, 120];
    colWidths.value = columns.map((col, i) => {
        const w = Math.floor(width * (col.flex || 1) / totalFlex);
        return Math.max(w, minWidths[i] || 60);
    });
}



function getScrollTop() {
    const container = canvasContainer.value;
    return container ? container.scrollTop : 0;
}

const fetchData = async () => {
    loading.value = true;
    const res = await fetch('/api/bigdata?count=100000');
    const data = await res.json();
    rows.value = data.data;
    loading.value = false;
    drawTable(getScrollTop());
};


// 响应式撑高 div
const totalHeight = computed(() => headerHeight + rows.value.length * rowHeight);

function drawTable(scrollTop = 0) {
    const canvas = canvasRef.value;
    const container = canvasContainer.value;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const width = colWidths.value.reduce((sum, w) => sum + w, 0);
    const height = container.clientHeight;
    const visibleCount = Math.ceil(height / rowHeight);
    const buffer = visibleCount; // 一屏缓冲
    const rawStart = Math.floor(scrollTop / rowHeight);
    const start = Math.max(0, rawStart - buffer);
    const end = Math.min(start + visibleCount + buffer * 2, rows.value.length);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    // 关键：canvas 跟随滚动条移动
    canvas.style.top = scrollTop + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 绘制可见行
    ctx.font = '14px sans-serif';
    const offsetY = scrollTop % rowHeight;
    for (let i = start; i < end; i++) {
        const y = headerHeight + (i - start) * rowHeight - offsetY;
        let x = 0;
        for (let c = 0; c < columns.length; c++) {
            ctx.fillStyle = '#222';
            ctx.fillText(String(rows.value[i][columns[c].key]), x + 12, y + 22);
            x += colWidths.value[c];
        }
        console.log(`绘制行 ${i}，Y: ${y}, 内容: ${JSON.stringify(rows.value[i])}`);

        // 行分隔线
        ctx.strokeStyle = '#f1f1f1';
        ctx.beginPath();
        ctx.moveTo(0, y + rowHeight - 0.5);
        ctx.lineTo(width, y + rowHeight - 0.5);
        ctx.stroke();
    }
}

function onScroll() {
    const container = canvasContainer.value;
    if (!container) return;
    drawTable(container.scrollTop);
}


let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
    nextTick(() => {
        const container = canvasContainer.value;
        if (container) {
            container.addEventListener('scroll', onScroll);
            updateColWidths();
            drawTable(getScrollTop());
            // 监听容器宽度变化
            resizeObserver = new ResizeObserver(() => {
                updateColWidths();
                nextTick(() => drawTable(getScrollTop()));
            });
            resizeObserver.observe(container);
        }
    });
});

onBeforeUnmount(() => {
    if (resizeObserver && canvasContainer.value) {
        resizeObserver.disconnect();
    }
});

watch(rows, () => {
    drawTable(getScrollTop());
});
</script>

<style scoped>
.relative {
    position: relative;
}

.table-header {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 10;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    user-select: none;
}

.header-cell {
    /* 可自定义表头样式 */
    font-weight: bold;
    font-size: 16px;
    height: 100%;
    line-height: 40px;
    border-right: 1px solid #f1f1f1;
    background: #f3f4f6;
}

.header-cell:last-child {
    border-right: none;
}


canvas {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    pointer-events: none;
}

.virtual-scroller {
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    z-index: -1;
}
</style>
