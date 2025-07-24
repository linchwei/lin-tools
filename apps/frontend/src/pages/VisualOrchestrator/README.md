# 🎨 可视化编排引擎

## 概述

可视化编排引擎是一个基于现代Web技术的可视化编程平台，通过拖拽节点和连线的方式，让用户能够直观地设计和构建复杂的业务流程。支持多种节点类型、自动布局算法，并能将可视化流程导出为可执行的代码。

## ✨ 核心特性

### 🎯 **可视化编程**
- **直观的节点设计** - 丰富的节点类型库，涵盖基础、逻辑、数据处理、异步操作等
- **拖拽式操作** - 从节点面板拖拽节点到画布，通过连线建立数据流
- **实时预览** - 节点配置实时生效，所见即所得的编程体验
- **智能提示** - 端口类型匹配、连接验证、错误提示

### 🧠 **复杂逻辑支持**
- **条件分支** - 支持if-else逻辑，根据条件执行不同分支
- **循环控制** - for、while、forEach等多种循环类型
- **多路分支** - switch-case结构，支持多条件判断
- **异步处理** - HTTP请求、延时操作、并行执行等异步节点

### 📊 **数据处理能力**
- **数据转换** - JSON解析、类型转换、自定义转换函数
- **数据过滤** - 基于条件的数组过滤操作
- **数据排序** - 支持多字段、多方向的排序
- **数据聚合** - 求和、平均值、最大最小值等聚合计算

### 🎨 **自动布局引擎**
- **拓扑排序布局** - 基于有向无环图的智能分层布局
- **力导向布局** - 物理模拟的自然布局算法
- **网格布局** - 规整的网格对齐布局
- **圆形布局** - 环形分布的节点布局
- **自定义布局** - 支持手动调整和自定义布局参数

### 💻 **代码生成**
- **Vue组件生成** - 将流程转换为完整的Vue组件
- **JavaScript代码** - 生成纯JavaScript执行代码
- **JSON配置** - 标准化的流程配置格式
- **实时执行** - 支持流程的实时运行和调试

## 🛠️ 技术架构

### 前端技术栈
```
Vue 3 + TypeScript + Element Plus
├── 响应式系统 - Vue 3 Composition API
├── 类型安全 - TypeScript 严格模式
├── UI组件库 - Element Plus 完整组件
├── SVG绘图 - 原生SVG实现连接线
└── Canvas支持 - 可选的Canvas渲染模式
```

### 核心模块架构
```
可视化编排引擎
├── 节点系统 (NodeTypes)
│   ├── 基础节点 - 开始、结束、变量、日志
│   ├── 逻辑节点 - 条件、循环、分支
│   ├── 数据节点 - 转换、过滤、排序、聚合
│   └── 异步节点 - HTTP、延时、并行
├── 布局引擎 (LayoutEngine)
│   ├── 拓扑排序 - DAG分层算法
│   ├── 力导向 - 物理模拟布局
│   ├── 网格布局 - 规整对齐
│   └── 圆形布局 - 环形分布
├── 代码生成器 (CodeGenerator)
│   ├── Vue组件 - 完整组件代码
│   ├── JavaScript - 纯JS执行代码
│   ├── 流程执行 - 实时运行引擎
│   └── 错误处理 - 异常捕获和恢复
└── 交互系统 (Interactions)
    ├── 拖拽系统 - 节点和画布拖拽
    ├── 连线系统 - 端口连接和路径计算
    ├── 选择系统 - 节点和连线选择
    └── 缩放平移 - 画布视图控制
```

## 🎯 节点类型详解

### 🔧 基础节点
#### 开始节点 (Start)
- **功能**: 流程的入口点，定义流程开始
- **配置**: 启动消息
- **端口**: 1个输出端口
- **用途**: 每个流程必须有一个开始节点

#### 结束节点 (End)
- **功能**: 流程的出口点，定义流程结束
- **配置**: 结束消息
- **端口**: 1个输入端口
- **用途**: 标记流程的正常结束

#### 变量节点 (Variable)
- **功能**: 定义和存储变量
- **配置**: 变量名、数据类型、默认值
- **端口**: 1个输入端口、1个输出端口
- **支持类型**: string、number、boolean、object、array

#### 日志节点 (Log)
- **功能**: 输出日志信息，用于调试
- **配置**: 日志级别、前缀
- **端口**: 1个输入端口、1个输出端口
- **级别**: info、warn、error、debug

### 🧠 逻辑控制节点
#### 条件判断 (Condition)
- **功能**: 根据条件进行分支控制
- **配置**: 条件表达式、比较操作符
- **端口**: 1个输入端口、2个输出端口(真/假)
- **表达式**: 支持JavaScript表达式语法

#### 循环节点 (Loop)
- **功能**: 循环执行指定的节点序列
- **配置**: 循环类型、最大迭代次数
- **端口**: 2个输入端口、2个输出端口
- **类型**: for、while、forEach循环

#### 多路分支 (Switch)
- **功能**: 多条件分支控制，类似switch-case
- **配置**: 分支条件列表
- **端口**: 1个输入端口、多个输出端口
- **用途**: 复杂的多分支逻辑处理

### 📊 数据处理节点
#### 数据转换 (Transform)
- **功能**: 转换数据格式和类型
- **配置**: 转换类型、自定义代码
- **类型**: JSON解析/序列化、类型转换、自定义函数
- **端口**: 1个输入端口、1个输出端口

#### 数据过滤 (Filter)
- **功能**: 过滤数组数据
- **配置**: 过滤条件表达式
- **端口**: 1个输入端口(数组)、1个输出端口(数组)
- **用途**: 根据条件筛选数组元素

#### 数据排序 (Sort)
- **功能**: 对数组进行排序
- **配置**: 排序字段、排序顺序
- **端口**: 1个输入端口(数组)、1个输出端口(数组)
- **支持**: 单字段排序、对象属性排序

#### 数据聚合 (Aggregate)
- **功能**: 对数据进行聚合计算
- **配置**: 聚合操作、聚合字段
- **操作**: sum、avg、max、min、count
- **端口**: 1个输入端口(数组)、1个输出端口(值)

### ⚡ 异步操作节点
#### HTTP请求 (HTTP)
- **功能**: 发送HTTP请求
- **配置**: 请求方法、请求头、超时时间
- **端口**: 2个输入端口(URL、数据)、2个输出端口(成功、错误)
- **方法**: GET、POST、PUT、DELETE

#### 延时节点 (Delay)
- **功能**: 延时执行，暂停流程
- **配置**: 延时时间(毫秒)
- **端口**: 1个输入端口、1个输出端口
- **用途**: 控制执行节奏、模拟异步操作

#### 并行执行 (Parallel)
- **功能**: 并行执行多个分支
- **配置**: 是否等待所有分支、超时时间
- **端口**: 1个输入端口、多个输出端口
- **用途**: 提高执行效率、并发处理

## 🎨 布局算法详解

### 拓扑排序布局
```typescript
// 基于有向无环图的分层布局
function topologicalSort(graph: GraphNode[]): GraphNode[][] {
  // 1. 计算每个节点的入度
  // 2. 找到入度为0的节点作为第一层
  // 3. 逐层处理，更新后继节点的入度
  // 4. 重复直到所有节点都被处理
}
```

**特点**:
- ✅ 自动分层，层次清晰
- ✅ 符合数据流方向
- ✅ 避免连线交叉
- ✅ 适合大多数流程图

### 力导向布局
```typescript
// 基于物理模拟的自然布局
function forceDirectedLayout(nodes: Node[], connections: Connection[]) {
  // 1. 节点间相互排斥
  // 2. 连接的节点相互吸引
  // 3. 迭代计算直到稳定
  // 4. 应用阻尼和边界约束
}
```

**特点**:
- ✅ 自然美观的布局
- ✅ 自动避免重叠
- ✅ 适合复杂网络结构
- ⚠️ 计算复杂度较高

### 网格布局
```typescript
// 规整的网格对齐布局
function gridLayout(nodes: Node[], columns: number) {
  // 按行列规整排列节点
  return nodes.map((node, index) => ({
    x: (index % columns) * cellWidth,
    y: Math.floor(index / columns) * cellHeight
  }))
}
```

**特点**:
- ✅ 整齐规范
- ✅ 计算简单快速
- ✅ 适合展示和演示
- ⚠️ 不考虑连接关系

## 💻 代码生成示例

### Vue组件生成
```vue
<template>
  <div class="flow-component">
    <h2>自动生成的流程组件</h2>
    <el-button @click="executeFlow" type="primary" :loading="executing">
      执行流程
    </el-button>
    <div v-if="result" class="flow-result">
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const executing = ref(false)
const result = ref(null)

const executeFlow = async () => {
  executing.value = true
  try {
    // 自动生成的流程执行逻辑
    const flowResult = await runGeneratedFlow()
    result.value = flowResult
  } finally {
    executing.value = false
  }
}
</script>
```

### JavaScript代码生成
```javascript
class FlowExecutor {
  constructor() {
    this.variables = new Map()
    this.results = new Map()
  }

  async execute(input = null) {
    console.log('开始执行流程...')
    
    try {
      this.variables.set('input', input)
      const result = await this.executeFlow()
      return result
    } catch (error) {
      console.error('流程执行失败:', error)
      throw error
    }
  }

  async executeFlow() {
    // 执行节点: 开始
    console.log('流程开始')
    
    // 执行节点: 数据转换
    const transformedData = JSON.parse(this.variables.get('input'))
    this.variables.set('transformed', transformedData)
    
    // 执行节点: 条件判断
    if (transformedData.value > 10) {
      // 真分支
      console.log('条件为真')
    } else {
      // 假分支
      console.log('条件为假')
    }
    
    // 执行节点: 结束
    this.results.set('final_result', '流程结束')
    return this.results.get('final_result')
  }
}
```

## 🚀 使用指南

### 基本操作流程
1. **创建流程** - 点击"新建流程"开始设计
2. **添加节点** - 从左侧节点库拖拽节点到画布
3. **连接节点** - 点击输出端口拖拽到输入端口建立连接
4. **配置节点** - 选择节点在右侧属性面板配置参数
5. **测试运行** - 点击"运行"按钮测试流程执行
6. **导出代码** - 点击"导出"生成可执行代码

### 最佳实践
1. **流程设计**
   - 从开始节点开始，以结束节点结束
   - 保持流程的单一职责原则
   - 合理使用条件分支和循环
   - 添加必要的日志节点用于调试

2. **节点配置**
   - 为节点设置有意义的名称
   - 仔细配置节点参数
   - 验证数据类型匹配
   - 处理异常情况

3. **性能优化**
   - 避免过深的嵌套
   - 合理使用并行节点
   - 设置合适的超时时间
   - 优化数据传递

## 🎯 应用场景

### 业务流程自动化
- **审批流程** - 多级审批、条件路由
- **数据处理** - ETL流程、数据清洗
- **通知系统** - 多渠道通知、条件触发
- **监控告警** - 指标监控、自动响应

### 教育培训
- **编程教学** - 可视化编程概念
- **逻辑训练** - 流程图设计思维
- **算法演示** - 算法流程可视化
- **系统设计** - 架构流程图

### 原型设计
- **业务建模** - 业务流程原型
- **系统设计** - 系统交互流程
- **API设计** - 接口调用流程
- **测试用例** - 测试流程设计

### 自动化脚本
- **部署流程** - CI/CD流水线
- **数据同步** - 定时同步任务
- **文件处理** - 批量文件操作
- **系统维护** - 自动化运维

## 🔧 扩展开发

### 自定义节点类型
```typescript
// 定义新的节点类型
const customNodeType: NodeType = {
  type: 'custom-node',
  name: '自定义节点',
  description: '这是一个自定义节点',
  icon: 'fas fa-cog',
  color: '#ff6b6b',
  inputs: [
    { id: 'input', name: '输入', type: 'input', dataType: 'any' }
  ],
  outputs: [
    { id: 'output', name: '输出', type: 'output', dataType: 'any' }
  ],
  configSchema: [
    {
      key: 'customParam',
      label: '自定义参数',
      type: 'text',
      placeholder: '请输入参数',
      default: ''
    }
  ],
  category: 'custom'
}
```

### 自定义布局算法
```typescript
// 实现自定义布局算法
function customLayout(
  nodes: FlowNode[],
  connections: Connection[]
): Array<FlowNode & { x: number; y: number }> {
  // 实现自定义布局逻辑
  return nodes.map((node, index) => ({
    ...node,
    x: index * 200,
    y: Math.sin(index) * 100 + 300
  }))
}
```

这个可视化编排引擎为现代Web应用提供了强大的可视化编程能力，通过直观的拖拽操作和丰富的节点类型，让复杂的业务逻辑设计变得简单高效！🎉
