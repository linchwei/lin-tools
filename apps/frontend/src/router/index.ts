import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/pages/Home.vue"),
  },
  {
    path: "/upload",
    name: "Upload",
    component: () => import("@/pages/Upload.vue"),
  },
  {
    path: "/big-table",
    name: "BigTable",
    component: () => import("@/pages/BigTable.vue"),
  },
  {
    path: "/eat-snake",
    name: "EatSnake",
    component: () => import("@/pages/EatSnake.vue"),
  },
  {
    path: "/calculator",
    name: "Calculator",
    component: () => import("@/pages/Calculator.vue"),
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("@/pages/Calendar.vue"),
  },
  {
    path: "/animation-showcase",
    name: "AnimationShowcase",
    component: () => import("@/pages/AnimationShowcase.vue"),
  },
  {
    path: "/pdf-viewer",
    name: "PdfViewer",
    component: () => import("@/pages/PdfViewer.vue"),
    meta: { title: "PDF预览" },
  },
  {
    path: "/code-generator",
    name: "CodeGenerator",
    component: () => import("@/pages/CodeGenerator.vue"),
    meta: { title: "代码生成器" },
  },
  {
    path: "/collaborative-whiteboard",
    name: "CollaborativeWhiteboard",
    component: () => import("@/pages/CollaborativeWhiteboard.vue"),
    meta: { title: "协作白板" },
  },
  {
    path: "/code-sandbox",
    name: "CodeSandbox",
    component: () => import("@/pages/CodeSandbox.vue"),
    meta: { title: "代码沙箱" },
  },
  {
    path: "/audio-visualizer",
    name: "AudioVisualizer",
    component: () => import("@/pages/AudioVisualizer.vue"),
    meta: { title: "音频可视化" },
  },
  {
    path: "/component-demo",
    name: "ComponentDemo",
    component: () => import("@/pages/ComponentDemo.vue"),
    meta: { title: "组件演示" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
