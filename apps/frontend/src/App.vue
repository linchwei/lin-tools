<script setup lang="ts">
import BlogMenu from '@/components/BlogMenu.vue';
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-52 bg-white border-r border-gray-100 shadow-sm">
      <BlogMenu />
    </aside>
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>
