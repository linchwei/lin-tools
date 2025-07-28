# 🚀 Lin Tools - 现代化数据可视化与工具集合平台

## 📖 项目概述

Lin Tools 是一个基于现代 Web 技术栈构建的综合性工具平台，集成了数据可视化、多媒体处理、开发工具、实用工具等多个领域的功能。项目采用 Monorepo 架构，提供了丰富的交互式演示和实用工具，旨在展示现代前端技术的强大能力。

## ✨ 核心特性

- 🎨 **现代化 UI 设计** - 基于 Tailwind CSS 的响应式设计
- 🧩 **模块化架构** - 组件化开发，易于维护和扩展
- 🚀 **高性能** - 基于 Vue 3 + Vite 的快速开发体验
- 📱 **响应式布局** - 适配各种设备和屏幕尺寸
- 🔧 **TypeScript** - 完整的类型安全保障
- 🎯 **实用工具集** - 涵盖开发、数据处理、媒体处理等多个领域

## 🛠️ 技术栈

### 前端技术

- **框架**: Vue 3.5+ (Composition API)
- **构建工具**: Vite 7.0+
- **语言**: TypeScript 5.8+
- **UI 组件库**: Element Plus 2.10+
- **样式框架**: Tailwind CSS 3.4+
- **路由**: Vue Router 4.5+
- **状态管理**: Vue 3 响应式系统
- **图标**: Element Plus Icons + Heroicons

### 数据可视化

- **图表库**: Chart.js 4.5+
- **数据可视化**: D3.js 7.9+
- **Canvas 处理**: 原生 Canvas API
- **SVG 绘图**: 原生 SVG + D3.js

### 多媒体处理

- **图像处理**: CropperJS 1.6+
- **音频处理**: Web Audio API
- **视频处理**: MediaDevices API
- **PDF 处理**: vue-pdf-embed 2.1+

### 开发工具

- **代码高亮**: PrismJS 1.30
- **拖拽功能**: VueDraggable 2.24+
- **实时通信**: Socket.io-client 4.8+
- **文件处理**: Spark-MD5 3.0+
- **数据库**: IndexedDB (idb 8.0+)

### 构建和工具

- **包管理**: pnpm + Monorepo
- **构建优化**: Turbo
- **自动导入**: unplugin-auto-import
- **组件自动注册**: unplugin-vue-components
- **CSS 预处理**: Sass 1.89+
- **代码格式化**: Prettier + ESLint

### 后端技术

- **框架**: Koa.js 3.0+ (Node.js Web 框架)
- **语言**: TypeScript 5.8+
- **数据库**: PostgreSQL + Prisma ORM 6.10+
- **实时通信**: Socket.io 4.8+
- **文件处理**: Multer 2.0+ + fs-extra
- **路由管理**: @koa/router 13.1+
- **跨域支持**: @koa/cors 5.0+
- **容器化**: Docker + Node.js 16 Alpine

## 📁 项目结构

```
lin-tools/
├── apps/
│   ├── frontend/          # 前端应用
│   │   ├── src/
│   │   │   ├── components/    # 公共组件
│   │   │   ├── pages/         # 页面组件
│   │   │   ├── router/        # 路由配置
│   │   │   ├── utils/         # 工具函数
│   │   │   ├── types/         # 类型定义
│   │   │   ├── hooks/         # 组合式函数
│   │   │   ├── styles/        # 样式文件
│   │   │   └── workers/       # Web Workers
│   │   ├── public/            # 静态资源
│   │   └── dist/              # 构建输出
│   └── backend/           # 后端应用
│       ├── src/
│       │   ├── routes/        # API路由
│       │   │   ├── upload.ts      # 文件上传服务
│       │   │   ├── bigdata.ts     # 大数据生成
│       │   │   ├── hash.ts        # 文件哈希服务
│       │   │   └── signaling.ts   # WebRTC信令服务
│       │   ├── constants.ts   # 常量配置
│       │   └── index.ts       # 服务器入口
│       ├── prisma/
│       │   └── schema.prisma  # 数据库模型
│       ├── uploads/           # 文件上传目录
│       ├── Dockerfile         # Docker配置
│       └── dist/              # 构建输出
├── node_modules/          # 共享依赖
├── package.json           # 根配置
├── pnpm-workspace.yaml    # pnpm工作空间配置
├── turbo.json            # Turbo构建配置
└── README.md             # 项目文档
```

## �️ 系统架构

### 前后端分离架构

- **前端**: Vue 3 + TypeScript + Vite 单页应用
- **后端**: Koa.js + TypeScript RESTful API 服务
- **数据库**: PostgreSQL + Prisma ORM
- **实时通信**: Socket.io WebSocket 连接
- **文件存储**: 本地文件系统 + 分片存储
- **容器化**: Docker 容器部署

### API 服务

#### 📤 文件上传服务

**基础路径**: `/api`

- `POST /upload-chunk` - 分片上传
- `POST /complete-upload` - 合并分片
- `GET /uploaded-chunks` - 查询已上传分片

**技术特性**:

- 🔄 **分片上传**: 支持大文件分片上传，提高上传成功率
- ⚡ **断点续传**: 网络中断后可继续上传
- 🔐 **Hash 校验**: SHA1 校验确保文件完整性
- 💾 **秒传功能**: 基于文件 hash 实现秒传

#### 📊 大数据服务

**基础路径**: `/api`

- `GET /bigdata?count=100000` - 生成测试数据

**技术特性**:

- 🚀 **高性能生成**: 快速生成大量测试数据
- 🎯 **自定义数量**: 支持自定义数据条数
- 📋 **结构化数据**: 生成符合前端需求的数据格式

#### 🔍 文件哈希服务

**基础路径**: `/api`

- `POST /check-file` - 检查文件是否存在

**技术特性**:

- ⚡ **快速检查**: 基于文件 hash 快速判断文件是否已存在
- 💾 **秒传支持**: 为前端秒传功能提供后端支持

#### 🔗 实时通信服务

**WebSocket 连接**: Socket.io

- 房间管理 (create-room, join-room)
- WebRTC 信令 (offer, answer, ice-candidate)
- 实时绘图 (drawing-operation)
- 光标同步 (cursor-position)

**技术特性**:

- 👥 **多人协作**: 支持多用户实时协作
- 🎨 **实时绘图**: 绘图操作实时同步
- 📡 **WebRTC 支持**: 提供 P2P 连接信令服务
- 🏠 **房间管理**: 动态房间创建和用户管理

### 数据库设计

#### File 模型 (文件表)

```sql
- id: String (UUID主键)
- name: String (文件名)
- size: Int (文件大小)
- mimeType: String (MIME类型)
- hash: String (文件hash，唯一索引)
- chunks: Int (分片数量)
- status: String (上传状态)
- createdAt: DateTime (创建时间)
- updatedAt: DateTime (更新时间)
```

#### Chunk 模型 (分片表)

```sql
- id: Int (自增主键)
- index: Int (分片索引)
- hash: String (分片hash)
- fileId: String (关联文件ID)
- createdAt: DateTime (创建时间)
- 联合唯一索引: (fileId, index)
```

## �🎯 功能模块

### 🏠 首页 (Home)

**路径**: `/`
**功能**: 系统首页和导航中心
**特性**:

- 🔍 智能搜索功能
- 📂 分类筛选
- ⭐ 特色功能展示
- 📊 功能统计面板
- 🎨 渐变背景设计

### 🔬 高级工具 (Advanced Tools)

#### 🧵 Web Worker 多线程

**路径**: `/web-worker`
**核心技术**: Web Workers API, SharedArrayBuffer, Atomics API
**功能特性**:

- 🧮 **大数据计算演示** - 质数计算、斐波那契数列、矩阵运算、排序算法
- 🔄 **SharedArrayBuffer 数据共享** - 多 Worker 协作、原子操作、实时监控
- 🖼️ **图像处理演示** - 灰度、模糊、锐化、边缘检测等滤镜
- 🎥 **视频处理演示** - 实时视频流处理、多种视频滤镜
- 📊 **性能对比** - 主线程 vs Worker 线程性能分析

**技术亮点**:

- 多线程并行计算，避免 UI 阻塞
- SharedArrayBuffer 零拷贝数据传输
- Atomics API 保证线程安全
- 实时性能监控和基准测试

#### 📱 离线优化方案

**路径**: `/offline-optimization`
**核心技术**: PWA, Service Worker, Cache API, IndexedDB
**功能特性**:

- 🔄 **Service Worker 管理** - 缓存策略、更新机制
- 💾 **离线存储** - IndexedDB 数据持久化
- 📦 **资源缓存** - 静态资源和 API 缓存
- 🔔 **离线提醒** - 网络状态检测和提示

#### 🎨 可视化编排引擎

**路径**: `/visual-orchestrator`
**核心技术**: Vue 3, SVG, 拖拽 API, 代码生成
**功能特性**:

- 🎯 **可视化编程** - 拖拽节点、连线建立数据流
- 🧠 **复杂逻辑支持** - 条件分支、循环控制、异步处理
- 📊 **数据处理能力** - 数据转换、过滤、排序、聚合
- 🎨 **自动布局引擎** - 拓扑排序、力导向、网格、圆形布局
- 💻 **代码生成** - Vue 组件、JavaScript 代码、实时执行

**节点类型**:

- 基础节点: 开始、结束、变量、日志
- 逻辑节点: 条件、循环、分支
- 数据节点: 转换、过滤、排序、聚合
- 异步节点: HTTP 请求、延时、并行

#### 📝 智能表单引擎

**路径**: `/smart-form`
**核心技术**: Vue 3, Element Plus, JSON Schema
**功能特性**:

- 🎯 **动态表单生成** - 基于 JSON 配置生成表单
- ✅ **智能验证** - 实时验证、自定义规则
- 🔄 **条件显示** - 基于条件的字段显示/隐藏
- 📊 **数据绑定** - 双向数据绑定、数据格式化

#### 📊 数据大屏

**路径**: `/data-dashboard-new`
**核心技术**: D3.js, Chart.js, WebSocket, Canvas
**功能特性**:

- 📈 **实时数据趋势** - 动态图表、实时更新
- 🖥️ **系统监控** - CPU、内存、磁盘使用率
- 🌍 **地理分布图** - 全球数据中心分布可视化
- 🔗 **网络拓扑** - 网络节点连接状态
- 💫 **数据流动画** - 实时数据流可视化
- 📝 **实时日志** - 系统日志实时显示

**组件架构**:

- DashboardHeader: 头部控制栏
- OverviewCards: 数据概览卡片
- RealtimeTrendChart: 实时数据趋势图
- SystemStatusChart: 系统状态分布图
- ServerPerformanceChart: 服务器性能监控
- MetricsPanel: 关键指标面板
- RealtimeLogs: 实时日志显示
- GeoDistributionMap: 地理分布图
- NetworkTopology: 网络拓扑图
- DataFlowAnimation: 数据流动画

### 📊 数据处理 (Data Processing)

#### 📋 大数据表格

**路径**: `/big-table`
**核心技术**: 虚拟滚动, Vue 3, Element Plus
**后端支持**: 大数据生成 API
**功能特性**:

- 🚀 **虚拟滚动** - 支持百万级数据渲染
- 🔍 **高级筛选** - 多条件筛选、搜索
- 📊 **排序功能** - 多列排序、自定义排序
- 📤 **数据导出** - Excel、CSV 格式导出

**前后端协作**:

- 后端快速生成大量测试数据
- 前端虚拟滚动技术渲染大数据
- 支持自定义数据量和数据结构

#### 📤 文件上传

**路径**: `/upload`
**核心技术**: File API, FormData, Spark-MD5
**后端支持**: 分片上传 API、文件合并 API、哈希校验 API
**功能特性**:

- 🎯 **多种上传方式** - 拖拽上传、点击上传、粘贴上传
- ⚡ **分片上传** - 大文件分片、断点续传
- 🔐 **文件校验** - MD5 校验、文件类型验证
- 📊 **上传进度** - 实时进度显示、速度统计
- 💾 **秒传功能** - 基于文件 hash 的秒传机制

**前后端协作**:

- 前端计算文件 hash 并分片
- 后端提供分片上传和合并服务
- 数据库记录文件和分片信息
- 支持断点续传和秒传优化

#### 📄 PDF 预览

**路径**: `/pdf-viewer`
**核心技术**: vue-pdf-embed, PDF.js
**功能特性**:

- 📖 **PDF 渲染** - 高质量 PDF 文档显示
- 🔍 **缩放控制** - 自由缩放、适应页面
- 📑 **页面导航** - 页面跳转、缩略图导航
- 🔍 **文本搜索** - 全文搜索、高亮显示

### 🎨 媒体工具 (Media Tools)

#### ✂️ 图片裁切

**路径**: `/image-cropper`
**核心技术**: CropperJS, Canvas API
**功能特性**:

- ✂️ **精确裁切** - 自由裁切、固定比例裁切
- 🔄 **图片变换** - 旋转、翻转、缩放
- 🎨 **滤镜效果** - 亮度、对比度、饱和度调节
- 💾 **格式转换** - 支持多种图片格式输出

#### 🎵 音频可视化

**路径**: `/audio-visualizer`
**核心技术**: Web Audio API, Canvas, FFT
**功能特性**:

- 🎵 **音频播放** - 支持多种音频格式
- 📊 **频谱分析** - 实时频谱显示、FFT 变换
- 🎨 **可视化效果** - 多种可视化模式、颜色主题
- 🎛️ **音效控制** - 均衡器、音量控制

#### 🎬 动画展示

**路径**: `/animation-showcase`
**核心技术**: CSS Animations, Web Animations API
**功能特性**:

- 🎨 **CSS 动画** - 过渡、关键帧动画
- ⚡ **JavaScript 动画** - 高性能动画引擎
- 🎯 **交互动画** - 鼠标交互、触摸手势
- 📱 **响应式动画** - 适配不同设备的动画效果

### 🔧 开发工具 (Development Tools)

#### 💻 代码沙箱

**路径**: `/code-sandbox`
**核心技术**: Monaco Editor, PrismJS
**功能特性**:

- 📝 **代码编辑** - 语法高亮、自动补全
- ▶️ **实时执行** - 代码实时运行、结果预览
- 🎨 **多语言支持** - JavaScript、HTML、CSS、TypeScript
- 💾 **代码保存** - 本地存储、导入导出

#### 🤖 代码生成器

**路径**: `/code-generator`
**核心技术**: AST, 模板引擎
**功能特性**:

- 🎯 **模板生成** - Vue 组件、React 组件模板
- 🔧 **配置化生成** - 基于配置生成代码
- 📋 **代码片段** - 常用代码片段库
- 🔄 **格式化** - 代码美化、规范化

#### 🎨 协作白板

**路径**: `/collaborative-whiteboard`
**核心技术**: Canvas, Socket.io, WebRTC
**后端支持**: WebRTC 信令服务、实时通信服务
**功能特性**:

- ✏️ **绘图工具** - 画笔、形状、文本工具
- 👥 **多人协作** - 实时同步、用户状态显示
- 💾 **数据持久化** - 画板保存、历史记录
- 📤 **导出功能** - 图片导出、PDF 导出

**前后端协作**:

- 后端提供 WebRTC 信令服务器
- Socket.io 实现实时绘图数据同步
- 房间管理和用户状态管理
- 光标位置实时同步

#### 📦 组件演示

**路径**: `/component-demo`
**核心技术**: Vue 3, Element Plus
**功能特性**:

- 🧩 **组件展示** - 组件库完整展示
- 📖 **使用文档** - 详细的使用说明
- 🎮 **交互演示** - 实时参数调节
- 💻 **代码示例** - 完整的代码示例

### 🛠️ 实用工具 (Utilities)

#### 🧮 计算器

**路径**: `/calculator`
**核心技术**: JavaScript, Math.js
**功能特性**:

- 🔢 **基础运算** - 加减乘除、百分比
- 🧮 **科学计算** - 三角函数、对数、指数
- 📊 **历史记录** - 计算历史、结果保存
- ⌨️ **键盘支持** - 完整的键盘操作

#### 📅 农历日历

**路径**: `/calendar`
**核心技术**: 农历算法, Date API
**功能特性**:

- 📅 **日历显示** - 公历、农历双显示
- 🎊 **节日提醒** - 传统节日、现代节日
- 🔄 **日期转换** - 公历农历互转
- 📱 **响应式设计** - 适配移动设备

#### 📝 复杂表单

**路径**: `/complex-form`
**核心技术**: Vue 3, Element Plus, 表单验证
**功能特性**:

- 📋 **多步骤表单** - 分步填写、进度显示
- ✅ **复杂验证** - 自定义验证规则、异步验证
- 🔄 **动态表单** - 条件显示、动态字段
- 💾 **数据保存** - 草稿保存、自动保存

### 🎮 游戏娱乐 (Games)

#### 🐍 贪吃蛇

**路径**: `/eat-snake`
**核心技术**: Canvas, 游戏循环, 碰撞检测
**功能特性**:

- 🎮 **经典玩法** - 传统贪吃蛇游戏
- 🏆 **分数系统** - 得分统计、最高分记录
- ⚡ **难度调节** - 多种速度等级
- 📱 **触屏支持** - 移动设备触屏操作

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+ (后端数据库)
- Docker (可选，用于容器化部署)

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd lin-tools

# 安装依赖
pnpm install
```

### 开发模式

#### 启动前端

```bash
# 启动前端开发服务器
cd apps/frontend
pnpm dev

# 或在根目录使用 turbo
pnpm dev
```

#### 启动后端

```bash
# 配置数据库环境变量
cp apps/backend/.env.example apps/backend/.env
# 编辑 .env 文件，配置 DATABASE_URL

# 启动后端开发服务器
cd apps/backend
pnpm dev

# 数据库迁移 (首次运行)
npx prisma migrate dev
npx prisma generate
```

#### 完整开发环境

```bash
# 同时启动前后端 (在根目录)
pnpm dev:all
```

### 构建部署

#### 前端构建

```bash
# 构建前端应用
cd apps/frontend
pnpm build

# 或在根目录构建所有应用
pnpm build
```

#### 后端部署

```bash
# 构建后端应用
cd apps/backend
pnpm build

# 生产环境启动
pnpm start
```

#### Docker 部署

```bash
# 构建后端镜像
cd apps/backend
docker build -t lin-tools-backend .

# 运行容器
docker run -p 3000:3000 -e DATABASE_URL="your-database-url" lin-tools-backend
```

## 📖 使用指南

1. **访问首页** - 浏览所有可用功能
2. **分类筛选** - 根据功能类别快速定位
3. **搜索功能** - 使用搜索框快速查找特定功能
4. **功能体验** - 点击进入各个功能页面进行体验

## 📡 API 文档

### 基础信息

- **基础 URL**: `http://localhost:3000`
- **数据格式**: JSON
- **请求方式**: RESTful API + WebSocket

### 文件上传 API

```bash
# 分片上传
POST /upload-chunk
Content-Type: multipart/form-data
Body: { fileId, chunkIndex, chunkHash, chunkData }

# 合并文件
POST /complete-upload
Content-Type: application/json
Body: { fileId, fileName, chunks, fileHash }

# 查询已上传分片
GET /uploaded-chunks?fileId=xxx
```

### 大数据 API

```bash
# 生成测试数据
GET /bigdata?count=100000
Response: { data: Array<{name, age, desc}> }
```

### 文件检查 API

```bash
# 检查文件是否存在
POST /check-file
Content-Type: application/json
Body: { fileHash, fileName }
Response: { exists: boolean }
```

### WebSocket 事件

```javascript
// 房间管理
socket.emit("create-room", { userId });
socket.emit("join-room", { roomId, userInfo });

// WebRTC 信令
socket.emit("offer", { roomId, offer });
socket.emit("answer", { to, answer });
socket.emit("ice-candidate", { roomId, candidate });

// 协作功能
socket.emit("drawing-operation", { roomId, operation });
socket.emit("cursor-position", { roomId, cursor });
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有开源项目和社区的贡献，让这个项目得以实现。

---

**Lin Tools** - 探索现代 Web 技术的无限可能 🚀
