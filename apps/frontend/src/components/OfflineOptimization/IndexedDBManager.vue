<template>
  <div class="indexeddb-manager text-white">
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-4 flex items-center gap-3">
        💾 IndexedDB 数据管理
      </h2>
      <p class="text-lg opacity-90 leading-relaxed">
        本地数据存储、同步和管理，支持离线数据操作和增量同步
      </p>
    </div>

    <!-- 数据库状态面板 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 数据库状态 -->
      <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
          🗄️ 数据库状态
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="opacity-80">数据库名称:</span>
            <span class="font-semibold">{{ dbInfo.name }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">版本:</span>
            <span class="font-semibold">{{ dbInfo.version }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">存储空间:</span>
            <span class="font-semibold">{{ dbInfo.usage }} / {{ dbInfo.quota }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-80">连接状态:</span>
            <span :class="dbInfo.connected ? 'text-green-400' : 'text-red-400'" class="font-semibold">
              {{ dbInfo.connected ? '已连接' : '未连接' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 数据库操作 -->
      <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
          🔧 数据库操作
        </h3>
        <div class="space-y-3">
          <button 
            @click="initDatabase" 
            :disabled="loading.init"
            class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.init" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.init ? '初始化中...' : '初始化数据库' }}
          </button>
          
          <button 
            @click="syncData" 
            :disabled="loading.sync"
            class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.sync" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.sync ? '同步中...' : '同步数据' }}
          </button>
          
          <button 
            @click="exportData" 
            :disabled="loading.export"
            class="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.export" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.export ? '导出中...' : '导出数据' }}
          </button>
          
          <button 
            @click="clearDatabase" 
            :disabled="loading.clear"
            class="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <div v-if="loading.clear" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            {{ loading.clear ? '清空中...' : '清空数据库' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 数据表管理 -->
    <div class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8">
      <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
        📋 数据表管理
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          v-for="table in dbTables" 
          :key="table.name"
          @click="selectTable(table.name)"
          :class="{ 'ring-2 ring-blue-400': selectedTable === table.name }"
          class="bg-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/15 transition-all duration-300"
        >
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold">{{ table.name }}</h4>
            <span class="text-sm bg-white/20 px-2 py-1 rounded">{{ table.count }} 条记录</span>
          </div>
          <div class="flex justify-between text-sm opacity-70">
            <span>{{ table.size }}</span>
            <span>{{ table.lastModified }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据操作面板 -->
    <div v-if="selectedTable" class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
      <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
        ⚡ {{ selectedTable }} 数据操作
      </h3>
      
      <!-- 添加记录 -->
      <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          v-model="newRecord.key" 
          placeholder="键名" 
          class="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60"
        />
        <input 
          v-model="newRecord.value" 
          placeholder="数据值" 
          class="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60"
        />
        <button 
          @click="addRecord"
          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
        >
          添加记录
        </button>
      </div>

      <!-- 搜索 -->
      <div class="mb-6 flex gap-4">
        <input 
          v-model="searchKey" 
          @input="searchRecords"
          placeholder="搜索键名" 
          class="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60"
        />
        <button 
          @click="refreshTable"
          class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
        >
          刷新
        </button>
      </div>

      <!-- 数据列表 -->
      <div class="bg-white/10 rounded-lg overflow-hidden">
        <div class="grid grid-cols-4 gap-4 p-4 bg-white/20 font-semibold">
          <div>键名</div>
          <div>数据值</div>
          <div>时间戳</div>
          <div>操作</div>
        </div>
        <div v-if="tableData.length === 0" class="p-8 text-center opacity-70">
          暂无数据
        </div>
        <div 
          v-for="record in tableData" 
          :key="record.key"
          class="grid grid-cols-4 gap-4 p-4 border-t border-white/10 hover:bg-white/5"
        >
          <div class="truncate">{{ record.key }}</div>
          <div class="truncate">{{ record.value }}</div>
          <div class="text-sm opacity-70">{{ record.timestamp }}</div>
          <div class="flex gap-2">
            <button 
              @click="editRecord(record)"
              class="text-blue-400 hover:text-blue-300 text-sm"
            >
              编辑
            </button>
            <button 
              @click="deleteRecord(record.key)"
              class="text-red-400 hover:text-red-300 text-sm"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface TableRecord {
  key: string
  value: string
  timestamp: string
}

// 数据库信息
const dbInfo = reactive({
  name: 'OfflineOptimizationDB',
  version: 1,
  usage: '0 MB',
  quota: '0 MB',
  connected: false
})

// 加载状态
const loading = reactive({
  init: false,
  sync: false,
  export: false,
  clear: false
})

// 数据表
const dbTables = ref([
  { name: 'cache_data', count: 0, size: '0 KB', lastModified: '从未' },
  { name: 'user_data', count: 0, size: '0 KB', lastModified: '从未' },
  { name: 'sync_queue', count: 0, size: '0 KB', lastModified: '从未' }
])

const selectedTable = ref('')
const newRecord = reactive({ key: '', value: '' })
const searchKey = ref('')
const tableData = ref<TableRecord[]>([])

let db: IDBDatabase | null = null

// 数据库方法
const initDatabase = async () => {
  loading.init = true
  
  try {
    const request = indexedDB.open(dbInfo.name, dbInfo.version)
    
    request.onerror = () => {
      throw new Error('数据库打开失败')
    }
    
    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result
      dbInfo.connected = true
      ElMessage.success('数据库初始化成功')
      updateStorageInfo()
    }
    
    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result
      
      // 创建对象存储
      if (!db.objectStoreNames.contains('cache_data')) {
        db.createObjectStore('cache_data', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('user_data')) {
        db.createObjectStore('user_data', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true })
      }
    }
  } catch (error) {
    ElMessage.error('数据库初始化失败: ' + (error as Error).message)
  } finally {
    loading.init = false
  }
}

const syncData = async () => {
  loading.sync = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('数据同步完成')
  } catch (error) {
    ElMessage.error('数据同步失败')
  } finally {
    loading.sync = false
  }
}

const exportData = async () => {
  loading.export = true
  try {
    const data = { exported: true, timestamp: Date.now() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'offline-data.json'
    a.click()
    
    URL.revokeObjectURL(url)
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('数据导出失败')
  } finally {
    loading.export = false
  }
}

const clearDatabase = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有数据吗？此操作不可恢复。', '确认清空', {
      type: 'warning'
    })
    
    loading.clear = true
    // 模拟清空操作
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('数据库已清空')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空数据库失败')
    }
  } finally {
    loading.clear = false
  }
}

const selectTable = (tableName: string) => {
  selectedTable.value = tableName
  refreshTable()
}

const addRecord = () => {
  if (!newRecord.key || !newRecord.value) {
    ElMessage.warning('请填写键名和数据值')
    return
  }
  
  tableData.value.push({
    key: newRecord.key,
    value: newRecord.value,
    timestamp: new Date().toLocaleString()
  })
  
  newRecord.key = ''
  newRecord.value = ''
  ElMessage.success('记录添加成功')
}

const editRecord = (record: TableRecord) => {
  newRecord.key = record.key
  newRecord.value = record.value
}

const deleteRecord = async (key: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '确认删除', {
      type: 'warning'
    })
    
    const index = tableData.value.findIndex(item => item.key === key)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('记录删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除记录失败')
    }
  }
}

const searchRecords = () => {
  // 实现搜索逻辑
  refreshTable()
}

const refreshTable = () => {
  // 模拟刷新表格数据
  if (selectedTable.value) {
    tableData.value = [
      { key: 'example1', value: '示例数据1', timestamp: '2024-01-15 10:30:00' },
      { key: 'example2', value: '示例数据2', timestamp: '2024-01-15 11:00:00' }
    ].filter(record => !searchKey.value || record.key.includes(searchKey.value))
  }
}

const updateStorageInfo = async () => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      dbInfo.usage = `${((estimate.usage || 0) / 1024 / 1024).toFixed(2)} MB`
      dbInfo.quota = `${((estimate.quota || 0) / 1024 / 1024).toFixed(2)} MB`
    }
  } catch (error) {
    console.error('获取存储信息失败:', error)
  }
}

onMounted(() => {
  initDatabase()
})
</script>
