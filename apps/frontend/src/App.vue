<script setup lang="ts">
import BlogMenu from '@/components/BlogMenu.vue';
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <aside class="w-52 bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
      <BlogMenu />
    </aside>
    <main class="flex-1 overflow-auto">
      <router-view />
    </main>
  </div>
</template>
