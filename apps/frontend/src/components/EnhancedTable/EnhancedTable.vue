<template>
  <div class="enhanced-table-container">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <el-button 
            v-if="showAdd" 
            type="primary" 
            @click="handleAdd"
            :loading="loading"
          >
            <el-icon><Plus /></el-icon>
            {{ addText }}
          </el-button>
          <el-button 
            v-if="showBatchDelete && hasSelection" 
            type="danger" 
            @click="handleBatchDelete"
            :loading="loading"
          >
            <el-icon><Delete /></el-icon>
            批量删除 ({{ selectionCount }})
          </el-button>
          <el-button 
            v-if="showRefresh" 
            @click="handleRefresh"
            :loading="loading"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </slot>
      </div>
      
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <el-input
            v-if="showSearch"
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            clearable
            style="width: 200px"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-button 
            v-if="showColumnSetting"
            @click="showColumnDialog = true"
            circle
          >
            <el-icon><Setting /></el-icon>
          </el-button>
        </slot>
      </div>
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      v-bind="tableProps"
      :data="displayData"
      :loading="loading"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
    >
      <!-- 选择列 -->
      <el-table-column 
        v-if="showSelection" 
        type="selection" 
        width="55" 
        align="center"
        :selectable="selectable"
      />
      
      <!-- 序号列 -->
      <el-table-column 
        v-if="showIndex" 
        type="index" 
        :label="indexLabel"
        width="60" 
        align="center"
        :index="getIndex"
      />

      <!-- 数据列 -->
      <template v-for="column in visibleColumns" :key="column.prop">
        <el-table-column
          v-bind="getColumnProps(column)"
          :show-overflow-tooltip="column.showOverflowTooltip !== false"
        >
          <!-- 自定义表头 -->
          <template v-if="column.headerSlot" #header="scope">
            <slot :name="`header-${column.prop}`" v-bind="scope">
              {{ column.label }}
            </slot>
          </template>

          <!-- 自定义内容 -->
          <template #default="scope">
            <slot 
              v-if="column.slot" 
              :name="column.prop" 
              v-bind="scope"
            />
            <template v-else>
              {{ formatCellValue(scope.row, column) }}
            </template>
          </template>
        </el-table-column>
      </template>

      <!-- 操作列 -->
      <el-table-column 
        v-if="showActions" 
        :label="actionsLabel"
        :width="actionsWidth"
        :fixed="actionsFixed"
        align="center"
      >
        <template #default="scope">
          <slot name="actions" v-bind="scope">
            <el-button 
              v-if="showEdit"
              type="primary" 
              size="small" 
              @click="handleEdit(scope.row, scope.$index)"
              :loading="scope.row._editing"
            >
              编辑
            </el-button>
            <el-button 
              v-if="showDelete"
              type="danger" 
              size="small" 
              @click="handleDelete(scope.row, scope.$index)"
              :loading="scope.row._deleting"
            >
              删除
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div v-if="showPagination" class="table-pagination">
      <el-pagination
        v-bind="paginationProps"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 列设置对话框 -->
    <el-dialog 
      v-model="showColumnDialog" 
      title="列设置" 
      width="400px"
    >
      <div class="column-settings">
        <el-checkbox 
          v-model="checkAll" 
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          全选
        </el-checkbox>
        <el-divider />
        <el-checkbox-group v-model="checkedColumns" @change="handleCheckedColumnsChange">
          <div v-for="column in columns" :key="column.prop" class="column-item">
            <el-checkbox :label="column.prop">{{ column.label }}</el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Delete, Refresh, Search, Setting } from '@element-plus/icons-vue'

export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
  slot?: boolean
  headerSlot?: boolean
  visible?: boolean
  [key: string]: any
}

interface Props {
  // 数据
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  
  // 分页
  showPagination?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
  paginationProps?: Record<string, any>
  
  // 工具栏
  showToolbar?: boolean
  showAdd?: boolean
  showBatchDelete?: boolean
  showRefresh?: boolean
  showSearch?: boolean
  showColumnSetting?: boolean
  addText?: string
  searchPlaceholder?: string
  
  // 表格功能
  showSelection?: boolean
  showIndex?: boolean
  showActions?: boolean
  showEdit?: boolean
  showDelete?: boolean
  indexLabel?: string
  actionsLabel?: string
  actionsWidth?: string | number
  actionsFixed?: boolean | 'left' | 'right'
  
  // 表格属性
  tableProps?: Record<string, any>
  selectable?: (row: any, index: number) => boolean
  
  // 其他
  searchFields?: string[]
  defaultSort?: { prop: string; order: 'ascending' | 'descending' }
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showPagination: true,
  currentPage: 1,
  pageSize: 10,
  total: 0,
  showToolbar: true,
  showAdd: true,
  showBatchDelete: true,
  showRefresh: true,
  showSearch: true,
  showColumnSetting: true,
  addText: '新增',
  searchPlaceholder: '请输入关键词搜索',
  showSelection: false,
  showIndex: false,
  showActions: true,
  showEdit: true,
  showDelete: true,
  indexLabel: '序号',
  actionsLabel: '操作',
  actionsWidth: 150,
  actionsFixed: 'right'
})

const emit = defineEmits<{
  'add': []
  'edit': [row: any, index: number]
  'delete': [row: any, index: number]
  'batch-delete': [rows: any[]]
  'refresh': []
  'search': [keyword: string]
  'selection-change': [selection: any[]]
  'sort-change': [sort: { prop: string; order: string }]
  'current-change': [page: number]
  'size-change': [size: number]
  'row-click': [row: any, column: any, event: Event]
  'row-dblclick': [row: any, column: any, event: Event]
}>()

const tableRef = ref()
const searchKeyword = ref('')
const selectedRows = ref<any[]>([])
const showColumnDialog = ref(false)
const checkedColumns = ref<string[]>([])
const checkAll = ref(true)
const isIndeterminate = ref(false)

// 计算属性
const displayData = computed(() => {
  if (!searchKeyword.value) return props.data
  
  const fields = props.searchFields || props.columns.map(col => col.prop)
  return props.data.filter(row => {
    return fields.some(field => {
      const value = row[field]
      return value && String(value).toLowerCase().includes(searchKeyword.value.toLowerCase())
    })
  })
})

const visibleColumns = computed(() => {
  return props.columns.filter(column => 
    column.visible !== false && checkedColumns.value.includes(column.prop)
  )
})

const hasSelection = computed(() => selectedRows.value.length > 0)
const selectionCount = computed(() => selectedRows.value.length)

// 初始化列设置
onMounted(() => {
  checkedColumns.value = props.columns.map(col => col.prop)
})

// 方法
const getColumnProps = (column: TableColumn) => {
  const { slot, headerSlot, visible, ...rest } = column
  return rest
}

const formatCellValue = (row: any, column: TableColumn) => {
  const value = row[column.prop]
  if (column.formatter) {
    return column.formatter(row, column, value, 0)
  }
  return value
}

const getIndex = (index: number) => {
  return (props.currentPage - 1) * props.pageSize + index + 1
}

const handleAdd = () => {
  emit('add')
}

const handleEdit = (row: any, index: number) => {
  emit('edit', row, index)
}

const handleDelete = (row: any, index: number) => {
  emit('delete', row, index)
}

const handleBatchDelete = () => {
  emit('batch-delete', selectedRows.value)
}

const handleRefresh = () => {
  emit('refresh')
}

const handleSearch = () => {
  emit('search', searchKeyword.value)
}

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

const handleSortChange = (sort: any) => {
  emit('sort-change', sort)
}

const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

const handleRowDblClick = (row: any, column: any, event: Event) => {
  emit('row-dblclick', row, column, event)
}

const handleCheckAllChange = (val: boolean) => {
  checkedColumns.value = val ? props.columns.map(col => col.prop) : []
  isIndeterminate.value = false
}

const handleCheckedColumnsChange = (value: string[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === props.columns.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < props.columns.length
}

// 暴露方法
const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const toggleRowSelection = (row: any, selected?: boolean) => {
  tableRef.value?.toggleRowSelection(row, selected)
}

const toggleAllSelection = () => {
  tableRef.value?.toggleAllSelection()
}

const setCurrentRow = (row: any) => {
  tableRef.value?.setCurrentRow(row)
}

const clearSort = () => {
  tableRef.value?.clearSort()
}

const clearFilter = (columnKeys?: string[]) => {
  tableRef.value?.clearFilter(columnKeys)
}

defineExpose({
  clearSelection,
  toggleRowSelection,
  toggleAllSelection,
  setCurrentRow,
  clearSort,
  clearFilter
})
</script>

<style scoped>
.enhanced-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.column-settings {
  max-height: 400px;
  overflow-y: auto;
}

.column-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.column-item:last-child {
  border-bottom: none;
}

:deep(.el-table) {
  border: none;
}

:deep(.el-table__header-wrapper) {
  background: #fafafa;
}

:deep(.el-table th) {
  background: #fafafa !important;
  border-bottom: 1px solid #e9ecef;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-table__row:hover > td) {
  background-color: #f5f7fa !important;
}
</style>