<template>
  <div class="enhanced-canvas-table">
    <!-- 工具栏 -->
    <div
      class="toolbar mb-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm border border-blue-200">
      <div class="flex items-center gap-3">
        <el-button type="primary" @click="$emit('refresh')" :loading="loading" size="default" class="modern-btn">
          <template #icon>
            <ArrowPathIcon class="w-4 h-4" />
          </template>
          刷新
        </el-button>
        <el-button type="success" @click="addRow" size="default" class="modern-btn">
          <template #icon>
            <PlusIcon class="w-4 h-4" />
          </template>
          新增
        </el-button>
        <el-button type="danger" @click="deleteSelected" :disabled="!selectedRows.length" size="default"
          class="modern-btn">
          <template #icon>
            <TrashIcon class="w-4 h-4" />
          </template>
          删除选中 ({{ selectedRows.length }})
        </el-button>
      </div>
      <div class="flex items-center gap-3">
        <el-input v-model="searchText" placeholder="搜索..." size="default" style="width: 200px" clearable
          @input="handleSearch" class="modern-input">
          <template #prefix>
            <MagnifyingGlassIcon class="w-4 h-4 text-gray-400" />
          </template>
        </el-input>
        <span v-if="filteredData.length" class="text-sm text-gray-600 font-medium">
          共 {{ filteredData.length }} 条
        </span>
      </div>
    </div>

    <!-- 表格容器 -->
    <div ref="canvasContainer"
      class="canvas-table-container border-2 border-gray-200 rounded-xl shadow-xl bg-white overflow-auto relative hover:shadow-2xl transition-shadow duration-300"
      :style="{ height: height + 'px', width: '100%' }" @mousemove="handleMouseMove" @click="handleClick"
      @dblclick="handleDoubleClick">

      <!-- 固定表头 -->
      <div
        class="table-header sticky top-0 left-0 z-20 bg-gradient-to-r from-slate-50 to-gray-50 flex border-b-2 border-gray-300"
        :style="{ height: headerHeight + 'px' }">
        <!-- 选择列 -->
        <div class="header-cell flex items-center justify-center px-2 bg-gradient-to-b from-blue-50 to-blue-100"
          :style="{ width: '60px', minWidth: '60px' }">
          <el-checkbox v-model="selectAll" @change="handleSelectAll" />
        </div>
        <!-- 操作列 -->
        <div class="header-cell flex items-center justify-center px-2 bg-gradient-to-b from-green-50 to-green-100"
          :style="{ width: '120px', minWidth: '120px' }">
          <span class="text-xs font-bold text-green-700">操作</span>
        </div>
        <!-- 数据列 -->
        <div v-for="(col, idx) in columns" :key="col.key"
          class="header-cell flex items-center font-bold px-3 cursor-pointer hover:bg-blue-100 transition-all duration-200 bg-gradient-to-b from-gray-50 to-gray-100"
          :style="{ width: colWidths[idx] + 'px', minWidth: '80px' }" @click="handleSort(col.key)">
          <span class="text-gray-700">{{ col.label }}</span>
          <ArrowUpIcon v-if="sortField === col.key && sortOrder === 'asc'" class="w-3 h-3 ml-1 text-blue-600" />
          <ArrowDownIcon v-if="sortField === col.key && sortOrder === 'desc'" class="w-3 h-3 ml-1 text-blue-600" />
        </div>
      </div>

      <div class="virtual-scroller" :style="{ height: totalHeight + 'px' }"></div>
      <canvas ref="canvasRef" class="table-canvas"></canvas>

      <!-- 悬停提示 -->
      <div v-if="hoverInfo.show"
        class="hover-tooltip absolute bg-gray-800 text-white px-2 py-1 rounded text-xs z-30 pointer-events-none"
        :style="{ left: hoverInfo.x + 'px', top: hoverInfo.y + 'px' }">
        {{ hoverInfo.text }}
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialog" :title="editingIndex !== null ? '编辑记录' : '新增记录'" width="500px" @close="resetEdit"
      class="modern-dialog">
      <el-form :model="editForm" label-width="80px" size="default" class="modern-form">
        <el-form-item v-for="col in columns" :key="col.key" :label="col.label">
          <el-input v-model="editForm[col.key]" :placeholder="`请输入${col.label}`" class="modern-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="editDialog = false" class="modern-btn">取消</el-button>
          <el-button type="primary" @click="saveEdit" class="modern-btn">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import { ElButton, ElCheckbox, ElInput, ElDialog, ElForm, ElFormItem, ElMessage, ElMessageBox, type CheckboxValueType } from 'element-plus';
import {
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/vue/24/outline';

interface TableColumn {
  key: string;
  label: string;
  flex: number;
}

interface Props {
  data: any[];
  columns: TableColumn[];
  height?: number;
  rowHeight?: number;
  headerHeight?: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  height: 400,
  rowHeight: 40,
  headerHeight: 50,
  loading: false
});

const emit = defineEmits(['refresh', 'update:data', 'row-edit', 'row-delete', 'selection-change']);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);

// 搜索和过滤
const searchText = ref('');
const filteredData = computed(() => {
  if (!searchText.value) return props.data;
  return props.data.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchText.value.toLowerCase())
    )
  );
});

// 排序
const sortField = ref('');
const sortOrder = ref<'asc' | 'desc'>('asc');
const sortedData = computed(() => {
  if (!sortField.value) return filteredData.value;

  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortField.value];
    const bVal = b[sortField.value];
    const result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    return sortOrder.value === 'asc' ? result : -result;
  });
});

// 选择功能
const selectedRows = ref<number[]>([]);
const selectAll = ref(false);

// 编辑功能
const editDialog = ref(false);
const editingIndex = ref<number | null>(null);
const editForm = ref<any>({});

// 悬停效果
const hoverInfo = ref({
  show: false,
  x: 0,
  y: 0,
  text: ''
});

// 响应式列宽
const colWidths = ref<number[]>([]);

// 更新列宽
function updateColWidths() {
  const container = canvasContainer.value;
  if (!container || props.columns.length === 0) return;

  const totalFlex = props.columns.reduce((sum, c) => sum + (c.flex || 1), 0);
  const availableWidth = container.clientWidth - 180; // 减去选择列和操作列宽度

  if (availableWidth <= 0) return;

  colWidths.value = props.columns.map((col) => {
    const w = Math.floor(availableWidth * (col.flex || 1) / totalFlex);
    return Math.max(w, 100);
  });

  // 列宽更新后重新绘制
  nextTick(() => drawTable(getScrollTop()));
}

function getScrollTop() {
  const container = canvasContainer.value;
  return container ? container.scrollTop : 0;
}

// 响应式撑高 div
const totalHeight = computed(() => props.headerHeight + sortedData.value.length * props.rowHeight);

// 缓存 canvas 上下文和样式
let cachedCtx: CanvasRenderingContext2D | null = null;
let lastScrollTop = 0;

function drawTable(scrollTop = 0) {
  const canvas = canvasRef.value;
  const container = canvasContainer.value;
  if (!canvas || !container || sortedData.value.length === 0) return;

  // 如果滚动距离很小且不是初始化，跳过重绘
  if (Math.abs(scrollTop - lastScrollTop) < 5 && lastScrollTop !== 0) return;
  lastScrollTop = scrollTop;

  const dpr = window.devicePixelRatio || 1;
  const totalWidth = 180 + colWidths.value.reduce((sum, w) => sum + w, 0);
  const height = container.clientHeight;

  // 确保有足够的宽度
  if (totalWidth <= 180) {
    updateColWidths();
    return;
  }

  const visibleCount = Math.ceil(height / props.rowHeight);
  const buffer = Math.min(Math.ceil(visibleCount * 0.5), 10);
  const rawStart = Math.floor(scrollTop / props.rowHeight);
  const start = Math.max(0, rawStart - buffer);
  const end = Math.min(start + visibleCount + buffer * 2, sortedData.value.length);

  // 高DPI适配
  canvas.width = totalWidth * dpr;
  canvas.height = height * dpr;
  canvas.style.width = totalWidth + 'px';
  canvas.style.height = height + 'px';
  canvas.style.top = scrollTop + 'px';

  // 获取或创建上下文
  if (!cachedCtx) {
    cachedCtx = canvas.getContext('2d')!;
  }
  const ctx = cachedCtx;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, totalWidth, height);

  // 批量设置样式
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textBaseline = 'middle';

  const offsetY = scrollTop % props.rowHeight;

  // 绘制行
  for (let i = start; i < end; i++) {
    const y = props.headerHeight + (i - start) * props.rowHeight - offsetY;
    drawRow(ctx, i, y, totalWidth);
  }
}

// 提取行绘制逻辑，减少重复代码
function drawRow(ctx: CanvasRenderingContext2D, rowIndex: number, y: number, totalWidth: number) {
  const isSelected = selectedRows.value.includes(rowIndex);
  const isEven = rowIndex % 2 === 0;

  // 行背景
  if (isSelected) {
    ctx.fillStyle = '#dbeafe';
  } else {
    ctx.fillStyle = isEven ? '#fafafa' : '#ffffff';
  }
  ctx.fillRect(0, y, totalWidth, props.rowHeight);

  // 选择框区域
  ctx.fillStyle = isSelected ? '#3b82f6' : '#f8fafc';
  ctx.fillRect(0, y, 60, props.rowHeight);

  // 绘制选择框
  ctx.strokeStyle = isSelected ? '#ffffff' : '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, y + 12, 16, 16);
  if (isSelected) {
    ctx.fillStyle = '#ffffff';
    ctx.fillText('✓', 24, y + props.rowHeight / 2);
  }

  // 操作区域
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(60, y, 120, props.rowHeight);

  // 绘制操作按钮
  drawButton(ctx, 70, y + 8, 40, 24, '编辑', '#10b981');
  drawButton(ctx, 120, y + 8, 40, 24, '删除', '#ef4444');

  // 数据列
  let x = 180;
  ctx.fillStyle = '#374151';

  for (let c = 0; c < props.columns.length; c++) {
    const cellValue = String(sortedData.value[rowIndex][props.columns[c].key] || '');
    const maxWidth = colWidths.value[c] - 24;
    const truncatedText = truncateText(ctx, cellValue, maxWidth);
    ctx.fillText(truncatedText, x + 12, y + props.rowHeight / 2);

    // 列分隔线
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + colWidths.value[c], y);
    ctx.lineTo(x + colWidths.value[c], y + props.rowHeight);
    ctx.stroke();

    x += colWidths.value[c];
  }

  // 行分隔线
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y + props.rowHeight);
  ctx.lineTo(totalWidth, y + props.rowHeight);
  ctx.stroke();
}

// 绘制按钮
function drawButton(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, text: string, color: string) {
  // 按钮背景
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  // 按钮文字
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px sans-serif';
  const textWidth = ctx.measureText(text).width;
  ctx.fillText(text, x + (width - textWidth) / 2, y + height / 2 + 4);
}

// 文本截断
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;

  let truncated = text;
  while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

// 事件处理
function handleMouseMove(event: MouseEvent) {
  const canvas = canvasRef.value;
  const container = canvasContainer.value;
  if (!canvas || !container) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top + container.scrollTop;

  const rowIndex = Math.floor((y - props.headerHeight) / props.rowHeight);

  if (rowIndex >= 0 && rowIndex < sortedData.value.length) {
    // 操作区域悬停
    if (x >= 60 && x <= 180) {
      hoverInfo.value = {
        show: true,
        x: event.clientX + 10,
        y: event.clientY - 30,
        text: x >= 70 && x <= 110 ? '编辑' : x >= 120 && x <= 160 ? '删除' : ''
      };
      canvas.style.cursor = 'pointer';
    } else {
      hoverInfo.value.show = false;
      canvas.style.cursor = 'default';
    }
  } else {
    hoverInfo.value.show = false;
    canvas.style.cursor = 'default';
  }
}

function handleClick(event: MouseEvent) {
  const canvas = canvasRef.value;
  const container = canvasContainer.value;
  if (!canvas || !container) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top + container.scrollTop;

  const rowIndex = Math.floor((y - props.headerHeight) / props.rowHeight);
  if (rowIndex < 0 || rowIndex >= sortedData.value.length) return;

  // 选择框区域 (0-60px)
  if (x >= 0 && x <= 60) {
    toggleRowSelection(rowIndex);
    return;
  }

  // 操作区域 (60-180px)
  if (x >= 60 && x <= 180) {
    if (x >= 70 && x <= 110) { // 编辑按钮
      editRow(rowIndex);
    } else if (x >= 120 && x <= 160) { // 删除按钮
      deleteRow(rowIndex);
    }
  }
}

function handleDoubleClick(event: MouseEvent) {
  const canvas = canvasRef.value;
  const container = canvasContainer.value;
  if (!canvas || !container) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top + container.scrollTop;

  const rowIndex = Math.floor((y - props.headerHeight) / props.rowHeight);
  if (rowIndex >= 0 && rowIndex < sortedData.value.length && x > 180) {
    editRow(rowIndex);
  }
}

// 功能方法
function handleSearch() {
  selectedRows.value = [];
  selectAll.value = false;
  drawTable(getScrollTop());
}

function handleSort(field: string) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }

  selectedRows.value = [];
  selectAll.value = false;
  drawTable(getScrollTop());
}

function toggleRowSelection(index: number) {
  const selectedIndex = selectedRows.value.indexOf(index);
  if (selectedIndex > -1) {
    selectedRows.value.splice(selectedIndex, 1);
  } else {
    selectedRows.value.push(index);
  }

  selectAll.value = selectedRows.value.length === sortedData.value.length;
  emit('selection-change', selectedRows.value.map(i => sortedData.value[i]));
  drawTable(getScrollTop());
}

function handleSelectAll(checked: CheckboxValueType) {
  const isChecked = Boolean(checked);
  if (isChecked) {
    selectedRows.value = Array.from({ length: sortedData.value.length }, (_, i) => i);
  } else {
    selectedRows.value = [];
  }
  emit('selection-change', selectedRows.value.map(i => sortedData.value[i]));
  drawTable(getScrollTop());
}

function addRow() {
  editingIndex.value = null;
  editForm.value = {};
  props.columns.forEach(col => {
    editForm.value[col.key] = '';
  });
  editDialog.value = true;
}

function editRow(index: number) {
  editingIndex.value = index;
  editForm.value = { ...sortedData.value[index] };
  editDialog.value = true;
}

function saveEdit() {
  const newData = [...props.data];

  if (editingIndex.value !== null) {
    // 编辑现有行
    const originalRow = sortedData.value[editingIndex.value];
    const originalIndex = props.data.findIndex(row => row === originalRow);
    if (originalIndex !== -1) {
      newData[originalIndex] = { ...editForm.value };
    }
  } else {
    // 新增行
    newData.unshift({ ...editForm.value, id: Date.now() });
  }

  emit('update:data', newData);
  emit('row-edit', { index: editingIndex.value, data: editForm.value });
  editDialog.value = false;
  ElMessage.success(editingIndex.value !== null ? '编辑成功' : '新增成功');
}

function resetEdit() {
  editingIndex.value = null;
  editForm.value = {};
}

async function deleteSelected() {
  if (selectedRows.value.length === 0) return;

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '确认删除', {
      type: 'warning'
    });

    const toDelete = selectedRows.value.map(index => sortedData.value[index]);
    const newData = props.data.filter(row => !toDelete.includes(row));

    emit('update:data', newData);
    emit('row-delete', toDelete);
    selectedRows.value = [];
    selectAll.value = false;
    ElMessage.success('删除成功');
  } catch {
    // 用户取消
  }
}

async function deleteRow(index: number) {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '确认删除', {
      type: 'warning'
    });

    const row = sortedData.value[index];
    const newData = props.data.filter(r => r !== row);

    emit('update:data', newData);
    emit('row-delete', [row]);
    ElMessage.success('删除成功');
  } catch {
    // 用户取消
  }
}

// 添加节流和RAF优化
let scrollRAF: number | null = null;
let lastScrollTime = 0;

function onScroll() {
  const container = canvasContainer.value;
  if (!container) return;

  // 取消之前的动画帧
  if (scrollRAF) {
    cancelAnimationFrame(scrollRAF);
  }

  // 使用 requestAnimationFrame 优化滚动
  scrollRAF = requestAnimationFrame(() => {
    const now = Date.now();
    // 节流：限制重绘频率到 60fps
    if (now - lastScrollTime > 16) {
      drawTable(container.scrollTop);
      lastScrollTime = now;
    }
    scrollRAF = null;
  });

  hoverInfo.value.show = false;
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(() => {
    const container = canvasContainer.value;
    const canvas = canvasRef.value;
    if (container && canvas) {
      container.addEventListener('scroll', onScroll);
      updateColWidths();
      // 初始化绘制
      drawTable(0);

      resizeObserver = new ResizeObserver(() => {
        updateColWidths();
        nextTick(() => drawTable(getScrollTop()));
      });
      resizeObserver.observe(container);
    }
  });
});

onBeforeUnmount(() => {
  const container = canvasContainer.value;
  if (container) {
    container.removeEventListener('scroll', onScroll);
  }
  if (resizeObserver && canvasContainer.value) {
    resizeObserver.disconnect();
  }
  // 清理动画帧
  if (scrollRAF) {
    cancelAnimationFrame(scrollRAF);
  }
  // 清理缓存
  cachedCtx = null;
});

// 监听数据变化
watch([() => props.data, sortedData, selectedRows], () => {
  nextTick(() => {
    if (props.data.length > 0) {
      drawTable(getScrollTop());
    }
  });
}, { immediate: true });

// 暴露方法
const refresh = () => {
  drawTable(getScrollTop());
};

const getSelectedRows = () => {
  return selectedRows.value.map(index => sortedData.value[index]);
};

const clearSelection = () => {
  selectedRows.value = [];
  selectAll.value = false;
  drawTable(getScrollTop());
};

defineExpose({
  refresh,
  getSelectedRows,
  clearSelection
});
</script>

<style scoped>
.enhanced-canvas-table {
  @apply w-full;
}

.toolbar {
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
}

.canvas-table-container {
  position: relative;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  /* 优化滚动性能 */
  will-change: scroll-position;
  transform: translateZ(0);
  -webkit-overflow-scrolling: touch;
}

.table-header {
  backdrop-filter: blur(10px);
  user-select: none;
}

.header-cell {
  font-weight: 600;
  font-size: 14px;
  height: 100%;
  border-right: 1px solid #cbd5e1;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
}

.header-cell:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
  transform: translateY(-1px);
}

.header-cell:last-child {
  border-right: none;
}

.table-canvas {
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  transition: none;
  /* 移除过渡动画 */
  /* 启用硬件加速 */
  will-change: transform;
  transform: translateZ(0);
}

.virtual-scroller {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  z-index: 0;
}

.hover-tooltip {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 现代化组件样式 */
:deep(.modern-btn) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.modern-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.modern-input .el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.modern-input .el-input__wrapper:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.modern-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.modern-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px 24px;
}

:deep(.modern-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.modern-form .el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
  }

  .toolbar>div {
    width: 100%;
    justify-content: center;
  }
}
</style>
