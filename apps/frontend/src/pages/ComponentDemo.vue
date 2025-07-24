<template>
  <div class="component-demo-container p-6 min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">🧩 组件演示</h1>
        <p class="text-gray-600">展示项目中二次封装的组件用法</p>
      </div>

      <!-- 组件导航 -->
      <div class="component-nav mb-8">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="全局Modal" name="modal">
            <div class="demo-section">
              <h2 class="text-2xl font-semibold mb-4">全局Modal组件</h2>
              <p class="text-gray-600 mb-6">可在任何地方调用的模态框组件，支持多种类型和自定义内容</p>

              <!-- Modal演示 -->
              <div class="demo-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <el-card class="demo-card">
                  <h3 class="font-medium mb-3">基础确认框</h3>
                  <el-button @click="showConfirmModal" type="primary">
                    显示确认框
                  </el-button>
                </el-card>

                <el-card class="demo-card">
                  <h3 class="font-medium mb-3">信息提示</h3>
                  <div class="space-y-2">
                    <el-button @click="showInfoModal" size="small">信息</el-button>
                    <el-button @click="showSuccessModal" type="success" size="small">成功</el-button>
                    <el-button @click="showWarningModal" type="warning" size="small">警告</el-button>
                    <el-button @click="showErrorModal" type="danger" size="small">错误</el-button>
                  </div>
                </el-card>

                <el-card class="demo-card">
                  <h3 class="font-medium mb-3">自定义组件</h3>
                  <el-button @click="showCustomModal" type="info">
                    自定义表单
                  </el-button>
                </el-card>

                <el-card class="demo-card">
                  <h3 class="font-medium mb-3">HTML内容</h3>
                  <el-button @click="showHtmlModal">
                    HTML内容
                  </el-button>
                </el-card>

                <el-card class="demo-card">
                  <h3 class="font-medium mb-3">可拖拽</h3>
                  <el-button @click="showDraggableModal">
                    可拖拽模态框
                  </el-button>
                </el-card>

                <el-card class="demo-card">
                  <h3 class="font-medium mb-3">异步操作</h3>
                  <el-button @click="showAsyncModal" type="warning">
                    异步确认
                  </el-button>
                </el-card>
              </div>

              <!-- 代码示例 -->
              <el-collapse v-model="activeCollapse">
                <el-collapse-item title="查看代码示例" name="modal-code">
                  <pre class="code-block"><code>{{ modalCodeExample }}</code></pre>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-tab-pane>

          <el-tab-pane label="增强Table" name="table">
            <div class="demo-section">
              <h2 class="text-2xl font-semibold mb-4">增强Table组件</h2>
              <p class="text-gray-600 mb-6">功能丰富的表格组件，支持搜索、排序、分页、批量操作等</p>

              <!-- Table演示 -->
              <div class="table-demo mb-8">
                <EnhancedTable :data="tableData" :columns="tableColumns" :loading="tableLoading"
                  :current-page="currentPage" :page-size="pageSize" :total="total" show-selection show-index
                  @add="handleAdd" @edit="handleEdit" @delete="handleDelete" @batch-delete="handleBatchDelete"
                  @refresh="handleRefresh" @search="handleSearch" @current-change="handleCurrentChange"
                  @size-change="handleSizeChange">
                  <!-- 自定义状态列 -->
                  <template #status="{ row }">
                    <el-tag :type="getStatusType(row.status)">
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </template>

                  <!-- 自定义操作列 -->
                  <template #actions="{ row, $index }">
                    <el-button size="small" @click="handleView(row)">查看</el-button>
                    <el-button size="small" type="primary" @click="handleEdit(row, $index)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row, $index)">删除</el-button>
                  </template>
                </EnhancedTable>
              </div>

              <!-- 表格配置 -->
              <el-card class="mb-6">
                <h3 class="font-medium mb-4">表格配置</h3>
                <div class="config-grid grid grid-cols-2 md:grid-cols-4 gap-4">
                  <el-switch v-model="tableConfig.showSelection" @change="updateTableConfig">
                    <template #active-text>显示选择</template>
                  </el-switch>
                  <el-switch v-model="tableConfig.showIndex" @change="updateTableConfig">
                    <template #active-text>显示序号</template>
                  </el-switch>
                  <el-switch v-model="tableConfig.showToolbar" @change="updateTableConfig">
                    <template #active-text>显示工具栏</template>
                  </el-switch>
                  <el-switch v-model="tableConfig.showPagination" @change="updateTableConfig">
                    <template #active-text>显示分页</template>
                  </el-switch>
                </div>
              </el-card>

              <!-- 代码示例 -->
              <el-collapse v-model="activeCollapse">
                <el-collapse-item title="查看代码示例" name="table-code">
                  <pre class="code-block"><code>{{ tableCodeExample }}</code></pre>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, nextTick } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import EnhancedTable from '@/components/EnhancedTable/EnhancedTable.vue'
import { modalManager } from '@/components/GlobalModal/modalManager'

// 响应式数据
const activeTab = ref('modal')
const activeCollapse = ref<string[]>([])

// Modal演示数据
const modalCodeExample = `// 基础用法
import { modalManager } from '@/components/GlobalModal/modalManager'

// 确认框
modalManager.confirm({
  title: '删除确认',
  message: '确定要删除这条记录吗？',
  type: 'warning'
}).then(() => {
  console.log('用户确认')
}).catch(() => {
  console.log('用户取消')
})

// 信息提示
modalManager.info('操作成功！')
modalManager.success('保存成功！')
modalManager.warning('请注意！')
modalManager.error('操作失败！')

// 自定义组件
modalManager.component(MyComponent, {
  prop1: 'value1',
  prop2: 'value2'
}, {
  title: '自定义标题',
  width: '600px'
})

// 完整配置
modalManager.show({
  title: '自定义模态框',
  component: MyComponent,
  props: { data: someData },
  width: '800px',
  draggable: true,
  onConfirm: async () => {
    // 异步操作
    await saveData()
  }
})`

// Table演示数据
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const tableConfig = ref({
  showSelection: true,
  showIndex: true,
  showToolbar: true,
  showPagination: true
})

const tableColumns = ref([
  { prop: 'id', label: 'ID', width: 80, sortable: true },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'email', label: '邮箱', minWidth: 180 },
  { prop: 'phone', label: '电话', width: 140 },
  { prop: 'status', label: '状态', width: 100, slot: true },
  { prop: 'createTime', label: '创建时间', width: 160, sortable: true },
])

const tableData = ref([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    status: 1,
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    status: 2,
    createTime: '2024-01-02 11:00:00'
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    status: 0,
    createTime: '2024-01-03 12:00:00'
  }
])

const tableCodeExample = `<template>
  <EnhancedTable
    :data="tableData"
    :columns="tableColumns"
    :loading="loading"
    :current-page="currentPage"
    :page-size="pageSize"
    :total="total"
    show-selection
    show-index
    @add="handleAdd"
    @edit="handleEdit"
    @delete="handleDelete"
    @batch-delete="handleBatchDelete"
    @refresh="handleRefresh"
  >
    <!-- 自定义列 -->
    <template #status="{ row }">
      <el-tag :type="getStatusType(row.status)">
        {{ getStatusText(row.status) }}
      </el-tag>
    </template>
    
    <!-- 自定义操作 -->
    <template #actions="{ row, $index }">
      <el-button size="small" @click="handleView(row)">查看</el-button>
      <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
    </template>
  </EnhancedTable>
</template>

<script setup>
const tableColumns = [
  { prop: 'id', label: 'ID', width: 80, sortable: true },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'status', label: '状态', width: 100, slot: true },
]

const handleAdd = () => {
  // 新增逻辑
}

const handleEdit = (row, index) => {
  // 编辑逻辑
}
&lt;/script&gt;\`

// Modal演示方法
const showConfirmModal = async () => {
try {
await modalManager.confirm({
title: '删除确认',
message: '确定要删除这条记录吗？此操作不可恢复。',
type: 'warning',
confirmText: '确定删除',
cancelText: '取消'
})
ElMessage.success('删除成功！')
} catch {
ElMessage.info('已取消删除')
}
}

const showInfoModal = () => {
modalManager.info('这是一条信息提示！')
}

const showSuccessModal = () => {
modalManager.success('操作成功完成！')
}

const showWarningModal = () => {
modalManager.warning('请注意相关风险！')
}

const showErrorModal = () => {
modalManager.error('操作失败，请重试！')
}

const showCustomModal = () => {
modalManager.show({
title: '用户信息表单',
component: defineAsyncComponent(() => import('./components/UserForm.vue')),
width: '600px',
props: {
userId: 123
},
onConfirm: async () => {
await new Promise(resolve => setTimeout(resolve, 1000))
ElMessage.success('保存成功！')
}
})
}

const showHtmlModal = () => {
modalManager.show({
title: '富文本内容',
html: `
  < div style = "padding: 20px;" >
    <h3 style="color: #409EFF; margin-bottom: 16px;" > 功能特性 </h3>
      < ul style = "line-height: 1.8;" >
        <li>✅ 支持HTML内容渲染 </li>
          <li>✅ 支持自定义样式 </li>
            <li>✅ 支持事件绑定 </li>
              <li>✅ 响应式设计 </li>
                </ul>
                < p style = "margin-top: 16px; color: #666;" >
                  这是一个使用HTML内容的模态框示例。
</p>
  </div>
    `,
width: '500px',
showCancel: false
})
}

const showDraggableModal = () => {
modalManager.show({
title: '可拖拽模态框',
content: '这个模态框可以拖拽移动位置！试试拖拽标题栏。',
draggable: true,
width: '400px'
})
}

const showAsyncModal = async () => {
try {
await modalManager.confirm({
title: '异步操作确认',
message: '这个操作需要3秒钟完成，确定继续吗？',
type: 'warning'
})

// 模拟异步操作
const loading = ElLoading.service({
lock: true,
text: '处理中...',
background: 'rgba(0, 0, 0, 0.7)'
})

await new Promise(resolve => setTimeout(resolve, 3000))
loading.close()
ElMessage.success('异步操作完成！')
} catch {
ElMessage.info('已取消操作')
}
}

// Table演示方法
const handleAdd = () => {
modalManager.show({
title: '新增用户',
component: defineAsyncComponent(() => import('./components/UserForm.vue')),
width: '600px',
onConfirm: () => {
ElMessage.success('新增成功！')
handleRefresh()
}
})
}

const handleEdit = (row: any, index: number) => {
modalManager.show({
title: '编辑用户',
component: defineAsyncComponent(() => import('./components/UserForm.vue')),
props: { userData: row },
width: '600px',
onConfirm: () => {
ElMessage.success('编辑成功！')
handleRefresh()
}
})
}

const handleDelete = async (row: any, index: number) => {
try {
await modalManager.confirm({
title: '删除确认',
message: `确定要删除用户"${row.name}"吗？`,
type: 'warning'
})

// 模拟删除操作
tableData.value.splice(index, 1)
total.value--
ElMessage.success('删除成功！')
} catch {
ElMessage.info('已取消删除')
}
}

const handleBatchDelete = async (rows: any[]) => {
try {
await modalManager.confirm({
title: '批量删除确认',
message: `确定要删除选中的 ${ rows.length } 条记录吗？`,
type: 'warning'
})

ElMessage.success(`成功删除 ${ rows.length } 条记录！`)
handleRefresh()
} catch {
ElMessage.info('已取消删除')
}
}

const handleView = (row: any) => {
modalManager.show({
title: '用户详情',
html: `
  < div style = "padding: 20px;" >
    <p><strong>ID: </strong> ${row.id}</p >
      <p><strong>姓名: </strong> ${row.name}</p >
        <p><strong>邮箱: </strong> ${row.email}</p >
          <p><strong>电话: </strong> ${row.phone}</p >
            <p><strong>状态: </strong> ${getStatusText(row.status)}</p >
              <p><strong>创建时间: </strong> ${row.createTime}</p >
                </div>
                  `,
width: '400px',
showCancel: false
})
}

const handleRefresh = () => {
tableLoading.value = true
setTimeout(() => {
tableLoading.value = false
ElMessage.success('刷新成功！')
}, 1000)
}

const handleSearch = (keyword: string) => {
console.log('搜索关键词:', keyword)
ElMessage.info(`搜索: ${ keyword } `)
}

const handleCurrentChange = (page: number) => {
currentPage.value = page
console.log('当前页:', page)
}

const handleSizeChange = (size: number) => {
pageSize.value = size
console.log('每页条数:', size)
}

const updateTableConfig = () => {
console.log('表格配置更新:', tableConfig.value)
}

const getStatusType = (status: number) => {
const types = ['danger', 'success', 'warning']
return types[status] || 'info'
}

const getStatusText = (status: number) => {
const texts = ['禁用', '正常', '待审核']
return texts[status] || '未知'
}
</script>

<style scoped>
.component-demo-container {
  min-height: 100vh;
}

.demo-section {
  padding: 24px;
}

.demo-grid {
  margin-bottom: 32px;
}

.demo-card {
  text-align: center;
  transition: all 0.3s ease;
}

.demo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.code-block {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.45;
  overflow-x: auto;
  white-space: pre;
}

.table-demo {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-grid {
  gap: 16px;
}

:deep(.el-tabs__content) {
  padding: 0;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0;
}
</style>
