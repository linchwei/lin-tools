import { createRouter, createWebHistory } from "vue-router";

// 路由配置接口
export interface RouteMetaMenu {
  title: string;
  icon?: string;
  category?: string;
  order?: number;
  hidden?: boolean;
  disabled?: boolean;
  description?: string;
  badge?: string;
}

// 扩展路由元信息
declare module "vue-router" {
  interface RouteMeta extends RouteMetaMenu {}
}

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/pages/Home.vue"),
    meta: {
      title: "首页",
      icon: "House",
      order: 1,
      description: "系统首页",
    },
  },
  // 高级工具
  {
    path: "/web-worker",
    name: "WebWorker",
    component: () => import("@/pages/WebWorkerDemo.vue"),
    meta: {
      title: "Web Worker 多线程",
      icon: "Cpu",
      category: "advanced",
      order: 1,
      description: "多线程处理和性能优化",
    },
  },
  {
    path: "/offline-optimization",
    name: "OfflineOptimization",
    component: () => import("@/pages/OfflineOptimization.vue"),
    meta: {
      title: "离线优化方案",
      icon: "Connection",
      category: "advanced",
      order: 2,
      description: "PWA和离线缓存策略",
    },
  },
  {
    path: "/visual-orchestrator",
    name: "VisualOrchestrator",
    component: () => import("@/pages/VisualOrchestrator.vue"),
    meta: {
      title: "可视化编排引擎",
      icon: "Share",
      category: "advanced",
      order: 3,
      description: "拖拽式流程编排工具",
    },
  },
  {
    path: "/smart-form",
    name: "SmartForm",
    component: () => import("@/pages/SmartFormDemo.vue"),
    meta: {
      title: "智能表单引擎",
      icon: "Document",
      category: "advanced",
      order: 4,
      description: "动态表单生成和验证",
    },
  },
  {
    path: "/data-dashboard",
    name: "DataDashboard",
    component: () => import("@/pages/DataDashboard.vue"),
    meta: {
      title: "实时数据大屏",
      icon: "DataBoard",
      category: "advanced",
      order: 5,
      description: "数据可视化大屏展示",
    },
  },
  {
    path: "/data-dashboard-new",
    name: "DataDashboardNew",
    component: () => import("@/pages/DataDashboardNew.vue"),
    meta: {
      title: "数据大屏(重构版)",
      icon: "DataBoard",
      category: "advanced",
      order: 5.1,
      description: "模块化重构的数据大屏",
    },
  },
  // 数据处理
  {
    path: "/big-table",
    name: "BigTable",
    component: () => import("@/pages/BigTable.vue"),
    meta: {
      title: "大数据表格",
      icon: "Grid",
      category: "data",
      order: 1,
      description: "虚拟滚动大数据表格",
    },
  },
  {
    path: "/upload",
    name: "Upload",
    component: () => import("@/pages/Upload.vue"),
    meta: {
      title: "文件上传",
      icon: "Upload",
      category: "data",
      order: 2,
      description: "多种文件上传方式",
    },
  },
  {
    path: "/pdf-viewer",
    name: "PdfViewer",
    component: () => import("@/pages/PdfViewer.vue"),
    meta: {
      title: "PDF 预览",
      icon: "Reading",
      category: "data",
      order: 3,
      description: "PDF文件在线预览",
    },
  },
  // 媒体工具
  {
    path: "/image-cropper",
    name: "ImageCropper",
    component: () => import("@/pages/ImageCropper.vue"),
    meta: {
      title: "图片裁切",
      icon: "Crop",
      category: "media",
      order: 1,
      description: "在线图片裁切工具",
    },
  },
  {
    path: "/audio-visualizer",
    name: "AudioVisualizer",
    component: () => import("@/pages/AudioVisualizer.vue"),
    meta: {
      title: "音频可视化",
      icon: "Microphone",
      category: "media",
      order: 2,
      description: "音频频谱可视化",
    },
  },
  {
    path: "/animation-showcase",
    name: "AnimationShowcase",
    component: () => import("@/pages/AnimationShowcase.vue"),
    meta: {
      title: "动画展示",
      icon: "VideoPlay",
      category: "media",
      order: 3,
      description: "CSS和JS动画效果",
    },
  },
  // 开发工具
  {
    path: "/code-sandbox",
    name: "CodeSandbox",
    component: () => import("@/pages/CodeSandbox.vue"),
    meta: {
      title: "代码沙箱",
      icon: "Monitor",
      category: "dev",
      order: 1,
      description: "在线代码编辑器",
    },
  },
  {
    path: "/code-generator",
    name: "CodeGenerator",
    component: () => import("@/pages/CodeGenerator.vue"),
    meta: {
      title: "代码生成器",
      icon: "EditPen",
      category: "dev",
      order: 2,
      description: "自动代码生成工具",
    },
  },
  {
    path: "/collaborative-whiteboard",
    name: "CollaborativeWhiteboard",
    component: () => import("@/pages/CollaborativeWhiteboard.vue"),
    meta: {
      title: "协作白板",
      icon: "Edit",
      category: "dev",
      order: 3,
      description: "多人协作白板",
    },
  },
  {
    path: "/component-demo",
    name: "ComponentDemo",
    component: () => import("@/pages/ComponentDemo.vue"),
    meta: {
      title: "组件演示",
      icon: "Box",
      category: "dev",
      order: 4,
      description: "组件库展示",
    },
  },
  // 实用工具
  {
    path: "/calculator",
    name: "Calculator",
    component: () => import("@/pages/Calculator.vue"),
    meta: {
      title: "计算器",
      icon: "Promotion",
      category: "utils",
      order: 1,
      description: "科学计算器",
    },
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("@/pages/Calendar.vue"),
    meta: {
      title: "农历日历",
      icon: "Calendar",
      category: "utils",
      order: 2,
      description: "农历和公历转换",
    },
  },
  {
    path: "/complex-form",
    name: "ComplexForm",
    component: () => import("@/pages/ComplexForm.vue"),
    meta: {
      title: "复杂表单",
      icon: "Tickets",
      category: "utils",
      order: 3,
      description: "复杂表单验证",
    },
  },
  // 游戏娱乐
  {
    path: "/eat-snake",
    name: "EatSnake",
    component: () => import("@/pages/EatSnake.vue"),
    meta: {
      title: "贪吃蛇",
      icon: "Lightning",
      category: "games",
      order: 1,
      description: "经典贪吃蛇游戏",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
