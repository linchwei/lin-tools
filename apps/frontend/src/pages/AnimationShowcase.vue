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

<style scoped>
/* 基础样式 */
.animation-showcase {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

/* 标题样式 */
.title-gradient {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 3s ease-in-out infinite;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

@keyframes gradientShift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

/* 动画卡片基础样式 */
.animation-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.animation-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.animation-card h3 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0;
}

/* 1. 脉冲动画 */
.pulse-animation {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border-radius: 50%;
  margin: 0 auto;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 2. 旋转动画 */
.spin-animation {
  font-size: 4rem;
  animation: spin 2s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 3. 弹跳动画 */
.bounce-animation {
  font-size: 4rem;
  animation: bounce 1s infinite;
  display: inline-block;
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-30px);
  }

  60% {
    transform: translateY(-15px);
  }
}

/* 4. 摇摆动画 */
.swing-animation {
  font-size: 4rem;
  animation: swing 2s ease-in-out infinite;
  transform-origin: top center;
  display: inline-block;
}

@keyframes swing {

  0%,
  100% {
    transform: rotate(0deg);
  }

  20% {
    transform: rotate(15deg);
  }

  40% {
    transform: rotate(-10deg);
  }

  60% {
    transform: rotate(5deg);
  }

  80% {
    transform: rotate(-5deg);
  }
}

/* 5. 呼吸动画 */
.breathe-animation {
  font-size: 4rem;
  animation: breathe 3s ease-in-out infinite;
  display: inline-block;
}

@keyframes breathe {

  0%,
  100% {
    transform: scale(1);
    filter: brightness(1);
  }

  50% {
    transform: scale(1.1);
    filter: brightness(1.3);
  }
}

/* 6. 彩虹边框 */
.rainbow-border {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
  background-size: 400% 400%;
  animation: rainbowRotate 3s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  position: relative;
}

.rainbow-border::before {
  content: '';
  position: absolute;
  inset: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

@keyframes rainbowRotate {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 7. 波浪动画 */
.wave-animation {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.wave {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid #4ecdc4;
  border-radius: 50%;
  opacity: 0;
  animation: wave 3s linear infinite;
}

.wave:nth-child(2) {
  animation-delay: 1s;
}

.wave:nth-child(3) {
  animation-delay: 2s;
}

@keyframes wave {
  0% {
    transform: scale(0);
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* 8. 加载点动画 */
.loading-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.loading-dots div {
  width: 12px;
  height: 12px;
  background: #4ecdc4;
  border-radius: 50%;
  animation: loadingDots 1.4s ease-in-out infinite both;
}

.loading-dots div:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots div:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loadingDots {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

/* 9. 心跳动画 */
.heartbeat-animation {
  font-size: 4rem;
  animation: heartbeat 1.5s ease-in-out infinite;
  display: inline-block;
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }

  14% {
    transform: scale(1.3);
  }

  28% {
    transform: scale(1);
  }

  42% {
    transform: scale(1.3);
  }

  70% {
    transform: scale(1);
  }
}

/* 10. 翻转卡片 */
.flip-card {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  animation: autoFlip 4s infinite;
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.2);
}

.flip-card-back {
  transform: rotateY(180deg);
  background: rgba(76, 205, 196, 0.3);
}

@keyframes autoFlip {

  0%,
  50% {
    transform: rotateY(0deg);
  }

  50.01%,
  100% {
    transform: rotateY(180deg);
  }
}

/* 11. 渐变背景 */
.gradient-animation {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 20px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
  background-size: 400% 400%;
  animation: gradientMove 4s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 12. 粒子效果 */
.particle-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #4ecdc4;
  border-radius: 50%;
  animation: particleFloat 3s infinite ease-in-out;
}

.particle:nth-child(odd) {
  background: #ff6b6b;
  animation-duration: 2.5s;
}

.particle:nth-child(1) {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.particle:nth-child(2) {
  top: 80%;
  left: 20%;
  animation-delay: 0.5s;
}

.particle:nth-child(3) {
  top: 80%;
  left: 80%;
  animation-delay: 1s;
}

.particle:nth-child(4) {
  top: 20%;
  left: 80%;
  animation-delay: 1.5s;
}

.particle:nth-child(5) {
  top: 50%;
  left: 10%;
  animation-delay: 2s;
}

.particle:nth-child(6) {
  top: 10%;
  left: 50%;
  animation-delay: 2.5s;
}

.particle:nth-child(7) {
  top: 50%;
  left: 90%;
  animation-delay: 3s;
}

.particle:nth-child(8) {
  top: 90%;
  left: 50%;
  animation-delay: 3.5s;
}

@keyframes particleFloat {

  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }

  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
}

/* 13. 霓虹灯文字 */
.neon-text {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  text-shadow:
    0 0 5px #4ecdc4,
    0 0 10px #4ecdc4,
    0 0 15px #4ecdc4,
    0 0 20px #4ecdc4,
    0 0 35px #4ecdc4,
    0 0 40px #4ecdc4;
  animation: neonFlicker 2s infinite alternate;
}

@keyframes neonFlicker {

  0%,
  18%,
  22%,
  25%,
  53%,
  57%,
  100% {
    text-shadow:
      0 0 5px #4ecdc4,
      0 0 10px #4ecdc4,
      0 0 15px #4ecdc4,
      0 0 20px #4ecdc4,
      0 0 35px #4ecdc4,
      0 0 40px #4ecdc4;
  }

  20%,
  24%,
  55% {
    text-shadow: none;
  }
}

/* 14. 液体按钮 */
.liquid-button {
  position: relative;
  padding: 12px 24px;
  background: transparent;
  border: 2px solid #4ecdc4;
  border-radius: 30px;
  color: #4ecdc4;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.liquid-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(76, 205, 196, 0.4), transparent);
  transition: left 0.5s;
}

.liquid-button:hover::before {
  left: 100%;
}

.liquid-button:hover {
  color: white;
  background: rgba(76, 205, 196, 0.2);
  box-shadow: 0 0 20px rgba(76, 205, 196, 0.5);
}

/* 15. 磁场效果 */
.magnetic-field {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.magnetic-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #4ecdc4;
  border-radius: 50%;
  animation: magneticOrbit 4s linear infinite;
}

.magnetic-dot:nth-child(1) {
  animation-delay: 0s;
}

.magnetic-dot:nth-child(2) {
  animation-delay: 0.33s;
}

.magnetic-dot:nth-child(3) {
  animation-delay: 0.66s;
}

.magnetic-dot:nth-child(4) {
  animation-delay: 1s;
}

.magnetic-dot:nth-child(5) {
  animation-delay: 1.33s;
}

.magnetic-dot:nth-child(6) {
  animation-delay: 1.66s;
}

@keyframes magneticOrbit {
  0% {
    transform: rotate(0deg) translateX(50px) rotate(0deg);
  }

  100% {
    transform: rotate(360deg) translateX(50px) rotate(-360deg);
  }
}

/* 16. 光束扫描 */
.scan-animation {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border: 2px solid rgba(76, 205, 196, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  overflow: hidden;
}

.scan-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 80%;
  background: linear-gradient(to bottom, transparent, #4ecdc4, transparent);
  transform-origin: bottom center;
  animation: scanRotate 2s linear infinite;
}

@keyframes scanRotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* 特效展示区域样式 */
.starry-sky {
  position: relative;
  height: 300px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 20px;
  overflow: hidden;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s infinite;
}

.star:nth-child(odd) {
  width: 2px;
  height: 2px;
  animation-duration: 3s;
}

.star:nth-child(even) {
  width: 1px;
  height: 1px;
  animation-duration: 2.5s;
}

.star:nth-child(1) {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.star:nth-child(2) {
  top: 80%;
  left: 20%;
  animation-delay: 0.5s;
}

.star:nth-child(3) {
  top: 30%;
  left: 80%;
  animation-delay: 1s;
}

.star:nth-child(4) {
  top: 70%;
  left: 70%;
  animation-delay: 1.5s;
}

.star:nth-child(5) {
  top: 10%;
  left: 50%;
  animation-delay: 2s;
}

@keyframes twinkle {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.content-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

/* 水波纹容器 */
.ripple-container {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.ripple-text {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  z-index: 2;
  position: relative;
}

.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: rippleAnimation 1s linear;
  pointer-events: none;
}

@keyframes rippleAnimation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title-gradient {
    font-size: 2.5rem;
  }

  .animation-card {
    padding: 1.5rem;
  }

  .starry-sky {
    height: 200px;
  }

  .ripple-container {
    height: 150px;
  }

  .ripple-text {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .title-gradient {
    font-size: 2rem;
  }

  .animation-card {
    padding: 1rem;
  }

  .animation-card h3 {
    font-size: 1rem;
  }
}
</style>
