<template>
  <div class="text-center mb-12 px-8">
    <h1 class="text-6xl font-extrabold text-transparent bg-clip-text 
               bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 
               mb-6 drop-shadow-lg animate-fade-in">
      🧵 Web Worker 多线程演示
    </h1>
    <p class="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto 
             font-medium animate-fade-in-delay">
      展示Web Worker在大数据计算、SharedArrayBuffer数据共享和图像/视频处理中的应用
    </p>
  </div>
</template>

<script setup lang="ts">
// 无需额外逻辑，纯展示组件
</script>

<style lang="scss" scoped>
// 动画效果
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-fade-in-delay {
  animation: fade-in 0.8s ease-out 0.3s both;
}

// 响应式设计
@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }
  
  p {
    font-size: 1.125rem;
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2rem;
  }
  
  p {
    font-size: 1rem;
  }
}
</style>
