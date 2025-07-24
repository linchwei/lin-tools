<template>
  <div class="animation-showcase">
    <div class="container mx-auto px-4 py-8">
      <!-- 标题区域 -->
      <div class="text-center mb-12">
        <h1 class="title-gradient">✨ CSS 动画展示 ✨</h1>
        <p class="subtitle">各种精美的CSS动画效果合集</p>
      </div>

      <!-- 动画网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <!-- 脉冲动画 -->
        <div class="animation-card">
          <div class="pulse-animation"></div>
          <h3>脉冲动画</h3>
        </div>

        <!-- 旋转动画 -->
        <div class="animation-card">
          <div class="spin-animation">🌟</div>
          <h3>旋转动画</h3>
        </div>

        <!-- 弹跳动画 -->
        <div class="animation-card">
          <div class="bounce-animation">⚽</div>
          <h3>弹跳动画</h3>
        </div>

        <!-- 摇摆动画 -->
        <div class="animation-card">
          <div class="swing-animation">🎭</div>
          <h3>摇摆动画</h3>
        </div>

        <!-- 呼吸动画 -->
        <div class="animation-card">
          <div class="breathe-animation">💎</div>
          <h3>呼吸动画</h3>
        </div>

        <!-- 彩虹边框 -->
        <div class="animation-card">
          <div class="rainbow-border">🌈</div>
          <h3>彩虹边框</h3>
        </div>

        <!-- 波浪动画 -->
        <div class="animation-card">
          <div class="wave-animation">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
          </div>
          <h3>波浪动画</h3>
        </div>

        <!-- 加载动画 -->
        <div class="animation-card">
          <div class="loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <h3>加载点动画</h3>
        </div>

        <!-- 心跳动画 -->
        <div class="animation-card">
          <div class="heartbeat-animation">❤️</div>
          <h3>心跳动画</h3>
        </div>

        <!-- 翻转卡片 -->
        <div class="animation-card">
          <div class="flip-card">
            <div class="flip-card-inner">
              <div class="flip-card-front">🎴</div>
              <div class="flip-card-back">✨</div>
            </div>
          </div>
          <h3>翻转卡片</h3>
        </div>

        <!-- 渐变背景 -->
        <div class="animation-card">
          <div class="gradient-animation">🎨</div>
          <h3>渐变背景</h3>
        </div>

        <!-- 粒子效果 */
        <div class="animation-card">
          <div class="particle-container">
            <div class="particle" v-for="i in 20" :key="i"></div>
          </div>
          <h3>粒子效果</h3>
        </div>

        <!-- 霓虹灯效果 -->
        <div class="animation-card">
          <div class="neon-text">NEON</div>
          <h3>霓虹灯文字</h3>
        </div>

        <!-- 液体按钮 -->
        <div class="animation-card">
          <button class="liquid-button">
            <span>点击我</span>
          </button>
          <h3>液体按钮</h3>
        </div>

        <!-- 磁场效果 -->
        <div class="animation-card">
          <div class="magnetic-field">
            <div class="magnetic-dot" v-for="i in 12" :key="i"></div>
          </div>
          <h3>磁场效果</h3>
        </div>

        <!-- 光束扫描 -->
        <div class="animation-card">
          <div class="scan-animation">
            <div class="scan-line"></div>
            📡
          </div>
          <h3>光束扫描</h3>
        </div>
      </div>

      <!-- 大型展示区域 -->
      <div class="mt-16">
        <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">特效展示区</h2>
        
        <!-- 星空背景 -->
        <div class="starry-sky mb-12">
          <div class="star" v-for="i in 50" :key="i"></div>
          <div class="content-overlay">
            <h3 class="text-white text-2xl font-bold">✨ 星空背景 ✨</h3>
          </div>
        </div>

        <!-- 水波纹效果 -->
        <div class="ripple-container mb-12" @click="createRipple">
          <div class="ripple-text">点击创建水波纹</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const createRipple = (event: MouseEvent) => {
  const container = event.currentTarget as HTMLElement
  const ripple = document.createElement('div')
  const rect = container.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2
  
  ripple.className = 'ripple-effect'
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = x + 'px'
  ripple.style.top = y + 'px'
  
  container.appendChild(ripple)
  
  setTimeout(() => {
    ripple.remove()
  }, 1000)
}
</script>