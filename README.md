# 大文件分片上传项目

## 实现功能

- 支持大文件分片上传，断点续传，秒传，失败重试，分片校验
- 前端支持 Web Worker 计算 hash、并发调度、IndexedDB 缓存、UI 美化（Tailwind + Element Plus）
- 上传进度条动画、上传速度、剩余时间等细节优化，支持暂停/恢复、失败分片重试
- 后端 Koa 提供 /api/upload-chunk、/api/complete-upload、/api/check-file、/api/uploaded-chunks 等接口，支持分片校验、合并、hash 检查
- 支持多文件同时上传、上传任务全局统计
- 主要交互和异常处理友好，兼容大文件和弱网环境

## 技术栈

### 前端

- Vue 3 (Composition API)
- TypeScript
- Vite
- Element Plus + Tailwind CSS（UI）
- IndexedDB（idb 库）
- Spark-MD5（分片 hash）
- Web Worker（hash 计算）
- 自定义并发调度器

### 后端

- Koa (Node.js)
- TypeScript
- Prisma ORM
- PostgreSQL
- Multer（分片存储）

## 重要代码解析

### 前端

#### 1. BigTable.vue

- 超大数据量高性能表格，基于 canvas 虚拟滚动实现。
- 支持 10 万+ 行数据的秒级渲染与丝滑滚动，极低内存占用。
- 表头固定，列宽自适应，窗口缩放自动调整。
- 仅渲染可视区及缓冲区，滚动时 canvas 区域动态重绘，体验无闪烁。
- 支持通过菜单进入大数据表格页面，数据由后端接口 /api/bigdata 动态生成。

**核心代码片段与解释：**

1. 计算可见区和缓冲区的渲染范围，只渲染可视行，极致提升性能：

```ts
const visibleCount = Math.ceil(height / rowHeight);
const buffer = visibleCount; // 一屏缓冲
const rawStart = Math.floor(scrollTop / rowHeight);
const start = Math.max(0, rawStart - buffer);
const end = Math.min(start + visibleCount + buffer * 2, rows.value.length);
```

> 解释：每次只渲染可视区及上下各一屏的缓冲区，避免大数据全量渲染，滚动时无白屏。

2. canvas 跟随滚动条移动，始终覆盖可视区：

```ts
canvas.style.top = scrollTop + "px";
```

> 解释：canvas 绝对定位，top 随 scrollTop 变化，确保内容始终与滚动条同步。

3. 绘制行时根据 scrollTop 平移，保证内容与滚动条对齐：

```ts
const offsetY = scrollTop % rowHeight;
for (let i = start; i < end; i++) {
  const y = headerHeight + (i - start) * rowHeight - offsetY;
  // ...绘制每一行...
}
```

> 解释：offsetY 保证滚动时内容平滑移动，避免跳行。

4. 响应式撑高 div，撑开滚动条：

```vue
<div class="virtual-scroller" :style="{ height: totalHeight + 'px' }"></div>
```

> 解释：撑高容器 scrollHeight，canvas 只负责可视区渲染，滚动条自然出现。

5. 表头固定，列宽自适应：

```vue
<div class="table-header sticky top-0 ... flex border-b" :style="{ height: headerHeight + 'px' }">
  <div v-for="(col, idx) in columns" :key="col.key" class="header-cell" :style="{ width: colWidths[idx] + 'px' }">
    {{ col.label }}
  </div>
</div>
```

> 解释：表头用 HTML 渲染并 sticky 固定，列宽根据容器宽度自适应。

#### 2. FileUploader.vue

- 使用 Element Plus 的 el-upload、el-table、el-progress、el-card 等组件美化上传区、文件列表、进度条。
- 进度条支持动画，上传速度/剩余时间实时展示。
- 支持暂停/恢复、失败分片重试、删除待上传文件。

#### 2. useFileUpload.ts

- 封装上传核心逻辑，支持分片、断点续传、秒传、失败重试。
- 利用 Web Worker 计算文件 hash，提升大文件体验。
- IndexedDB 缓存已上传分片，断点续传自动跳过。
- 并发调度器优化上传速度，支持 pause/resume。
- 实时统计上传速度、剩余时间，平滑动画。

#### 3. scheduler.ts

- 自定义并发任务调度队列，支持最大并发数、暂停/恢复、失败重试。

#### 4. indexedDB.ts

- 基于 idb 封装的 IndexedDB 工具，缓存分片上传状态。

### 后端

#### 1. Koa 路由

- /api/upload-chunk：接收分片并校验 hash，存储到本地或对象存储。
- /api/complete-upload：合并分片，校验最终 hash。
- /api/check-file：支持秒传，返回文件/分片已存在信息。
- /api/uploaded-chunks：查询已上传分片，支持断点续传。

#### 2. Prisma schema

- 记录上传文件、分片、状态等元数据。

## 运行方式

```
# 安装依赖
pnpm install

# 启动数据库和后端服务
docker-compose up -d

# 初始化数据库
npx prisma migrate dev --name init

# 启动前端开发服务器
cd apps/frontend
pnpm run dev

# 启动后端开发服务器
cd apps/backend
pnpm run dev
```
