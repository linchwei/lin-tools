export interface HomeEntry {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  category: "featured" | "tool" | "demo" | "visualization" | "game" | "form";
  tags: string[];
  status?: "new" | "hot" | "beta" | "stable";
  difficulty?: "beginner" | "intermediate" | "advanced";
  featured?: boolean;
}

export const homeEntries: HomeEntry[] = [
  // 特色功能
  {
    id: "data-dashboard",
    title: "实时数据大屏",
    description: "全球数据中心分布、实时监控、地理信息可视化、粒子流动效果",
    path: "/data-dashboard",
    icon: "📊",
    category: "featured",
    tags: ["D3.js", "SVG动画", "地理可视化", "实时数据"],
    status: "hot",
    difficulty: "advanced",
    featured: true,
  },
  {
    id: "animation-showcase",
    title: "CSS 动画展示",
    description: "16种精美CSS动画效果合集，包含脉冲、旋转、粒子等特效",
    path: "/animation-showcase",
    icon: "✨",
    category: "featured",
    tags: ["CSS动画", "特效", "交互"],
    status: "hot",
    difficulty: "intermediate",
    featured: true,
  },

  // 工具类
  {
    id: "upload",
    title: "文件上传",
    description: "支持大文件分片上传、断点续传、秒传功能",
    path: "/upload",
    icon: "📁",
    category: "tool",
    tags: ["文件上传", "分片上传", "断点续传"],
    status: "stable",
    difficulty: "intermediate",
  },
  {
    id: "big-table",
    title: "大数据表格",
    description: "虚拟滚动、高性能数据展示，支持百万级数据",
    path: "/big-table",
    icon: "📋",
    category: "tool",
    tags: ["虚拟滚动", "大数据", "表格"],
    status: "stable",
    difficulty: "intermediate",
  },
  {
    id: "pdf-viewer",
    title: "PDF 预览器",
    description: "在线PDF文档预览，支持缩放、翻页、搜索",
    path: "/pdf-viewer",
    icon: "📄",
    category: "tool",
    tags: ["PDF", "文档预览", "在线阅读"],
    status: "stable",
    difficulty: "beginner",
  },
  {
    id: "image-cropper",
    title: "图片裁剪",
    description: "在线图片裁剪工具，支持多种裁剪比例",
    path: "/image-cropper",
    icon: "🖼️",
    category: "tool",
    tags: ["图片处理", "裁剪", "编辑"],
    status: "stable",
    difficulty: "beginner",
  },
  {
    id: "calculator",
    title: "计算器",
    description: "功能完整的科学计算器，支持复杂运算",
    path: "/calculator",
    icon: "🧮",
    category: "tool",
    tags: ["计算器", "数学运算", "科学计算"],
    status: "stable",
    difficulty: "beginner",
  },
  {
    id: "calendar",
    title: "日历",
    description: "交互式日历组件，支持事件管理",
    path: "/calendar",
    icon: "📅",
    category: "tool",
    tags: ["日历", "时间管理", "事件"],
    status: "stable",
    difficulty: "beginner",
  },

  // 开发工具
  {
    id: "code-generator",
    title: "代码生成器",
    description: "基于模板的代码生成工具，提高开发效率",
    path: "/code-generator",
    icon: "⚙️",
    category: "tool",
    tags: ["代码生成", "模板", "开发工具"],
    status: "beta",
    difficulty: "advanced",
  },
  {
    id: "code-sandbox",
    title: "代码沙箱",
    description: "在线代码编辑器和运行环境，支持多种语言",
    path: "/code-sandbox",
    icon: "💻",
    category: "tool",
    tags: ["代码编辑", "在线运行", "沙箱"],
    status: "beta",
    difficulty: "advanced",
  },
  {
    id: "web-worker",
    title: "Web Worker 多线程",
    description:
      "展示Web Worker在大数据计算、SharedArrayBuffer数据共享和图像/视频处理中的应用",
    path: "/web-worker",
    icon: "🧵",
    category: "tool",
    tags: [
      "多线程",
      "Web Worker",
      "大数据计算",
      "图像处理",
      "SharedArrayBuffer",
    ],
    status: "new",
    difficulty: "advanced",
    featured: true,
  },
  {
    id: "offline-optimization",
    title: "离线优化方案",
    description:
      "基于Service Worker + IndexedDB的现代化离线优化解决方案，支持增量更新和网络自适应",
    path: "/offline-optimization",
    icon: "📱",
    category: "tool",
    tags: ["离线优化", "Service Worker", "IndexedDB", "增量更新", "网络自适应"],
    status: "new",
    difficulty: "advanced",
    featured: true,
  },
  {
    id: "visual-orchestrator",
    title: "可视化编排引擎",
    description:
      "基于节点和连线的可视化编程平台，支持复杂逻辑编排、自动布局和代码生成",
    path: "/visual-orchestrator",
    icon: "🎨",
    category: "tool",
    tags: ["可视化编程", "节点编排", "流程设计", "代码生成", "自动布局"],
    status: "new",
    difficulty: "advanced",
    featured: true,
  },

  // 可视化
  {
    id: "audio-visualizer",
    title: "音频可视化",
    description: "音频频谱分析和可视化效果展示",
    path: "/audio-visualizer",
    icon: "🎵",
    category: "visualization",
    tags: ["音频", "频谱", "可视化"],
    status: "new",
    difficulty: "intermediate",
  },
  {
    id: "collaborative-whiteboard",
    title: "协作白板",
    description: "实时协作绘图工具，支持多人同时编辑",
    path: "/collaborative-whiteboard",
    icon: "🎨",
    category: "visualization",
    tags: ["协作", "绘图", "实时同步"],
    status: "beta",
    difficulty: "advanced",
  },

  // 表单
  {
    id: "complex-form",
    title: "复杂表单",
    description: "复杂表单组件演示，包含各种表单控件",
    path: "/complex-form",
    icon: "📝",
    category: "form",
    tags: ["表单", "验证", "组件"],
    status: "stable",
    difficulty: "intermediate",
  },
  {
    id: "smart-form",
    title: "智能表单引擎",
    description: "基于JSON配置的动态表单生成引擎",
    path: "/smart-form",
    icon: "🤖",
    category: "form",
    tags: ["智能表单", "JSON配置", "动态生成"],
    status: "new",
    difficulty: "advanced",
  },

  // 演示
  {
    id: "component-demo",
    title: "组件演示",
    description: "各种UI组件的使用演示和效果展示",
    path: "/component-demo",
    icon: "🧩",
    category: "demo",
    tags: ["组件", "演示", "UI"],
    status: "stable",
    difficulty: "beginner",
  },

  // 游戏
  {
    id: "eat-snake",
    title: "贪吃蛇游戏",
    description: "经典贪吃蛇游戏，支持键盘和触摸操作",
    path: "/eat-snake",
    icon: "🐍",
    category: "game",
    tags: ["游戏", "贪吃蛇", "娱乐"],
    status: "stable",
    difficulty: "beginner",
  },
];

// 按类别分组
export const getEntriesByCategory = (category: HomeEntry["category"]) => {
  return homeEntries.filter((entry) => entry.category === category);
};

// 获取特色功能
export const getFeaturedEntries = () => {
  return homeEntries.filter((entry) => entry.featured);
};

// 获取最新功能
export const getNewEntries = () => {
  return homeEntries.filter((entry) => entry.status === "new");
};

// 获取热门功能
export const getHotEntries = () => {
  return homeEntries.filter((entry) => entry.status === "hot");
};

// 按难度筛选
export const getEntriesByDifficulty = (difficulty: HomeEntry["difficulty"]) => {
  return homeEntries.filter((entry) => entry.difficulty === difficulty);
};

// 搜索功能
export const searchEntries = (keyword: string) => {
  const lowerKeyword = keyword.toLowerCase();
  return homeEntries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(lowerKeyword) ||
      entry.description.toLowerCase().includes(lowerKeyword) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
  );
};

// 类别配置
export const categoryConfig = {
  featured: { name: "特色功能", icon: "⭐", color: "#ff6b6b" },
  tool: { name: "实用工具", icon: "🛠️", color: "#4ecdc4" },
  visualization: { name: "可视化", icon: "📊", color: "#45b7d1" },
  form: { name: "表单组件", icon: "📝", color: "#96ceb4" },
  demo: { name: "组件演示", icon: "🧩", color: "#feca57" },
  game: { name: "小游戏", icon: "🎮", color: "#ff9ff3" },
};

// 状态配置
export const statusConfig = {
  new: {
    name: "新功能",
    color: "#ff6b6b",
    bgColor: "rgba(255, 107, 107, 0.1)",
  },
  hot: { name: "热门", color: "#ff9500", bgColor: "rgba(255, 149, 0, 0.1)" },
  beta: { name: "测试版", color: "#007aff", bgColor: "rgba(0, 122, 255, 0.1)" },
  stable: {
    name: "稳定版",
    color: "#34c759",
    bgColor: "rgba(52, 199, 89, 0.1)",
  },
};

// 难度配置
export const difficultyConfig = {
  beginner: { name: "入门", color: "#34c759", icon: "🟢" },
  intermediate: { name: "中级", color: "#ff9500", icon: "🟡" },
  advanced: { name: "高级", color: "#ff3b30", icon: "🔴" },
};
