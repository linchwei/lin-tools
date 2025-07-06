import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("./pages/Home.vue"),
  },
  {
    path: "/upload",
    name: "Upload",
    component: () => import("./pages/Upload.vue"),
  },
  {
    path: "/big-table",
    name: "BigTable",
    component: () => import("./pages/BigTable.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
