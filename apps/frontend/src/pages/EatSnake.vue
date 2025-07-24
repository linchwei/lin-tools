<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
    <div class="container mx-auto max-w-6xl">
      <!-- 游戏标题和统计 -->
      <div class="text-center mb-8">
        <h1
          class="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
          🐍 贪吃蛇大作战
        </h1>
        <div class="flex justify-center gap-8 mb-6">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-emerald-200">
            <div class="text-2xl font-bold text-emerald-600">{{ score }}</div>
            <div class="text-sm text-gray-600">当前分数</div>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-amber-200">
            <div class="text-2xl font-bold text-amber-600">{{ highScore }}</div>
            <div class="text-sm text-gray-600">最高分</div>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-blue-200">
            <div class="text-2xl font-bold text-blue-600">{{ level }}</div>
            <div class="text-sm text-gray-600">等级</div>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-purple-200">
            <div class="text-2xl font-bold text-purple-600">{{ snake.length }}</div>
            <div class="text-sm text-gray-600">长度</div>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 items-start">
        <!-- 游戏区域 -->
        <div class="flex-1">
          <el-card class="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <!-- 控制按钮 -->
            <div class="flex flex-wrap justify-center gap-3 mb-6">
              <el-button @click="startGame" :disabled="isPlaying" type="primary" size="large"
                class="modern-btn px-8 py-3 text-lg font-semibold">
                <span class="mr-2">🎮</span>开始游戏
              </el-button>
              <el-button @click="pauseGame" :disabled="!isPlaying || isPaused" type="warning" size="large"
                class="modern-btn px-8 py-3 text-lg font-semibold">
                <span class="mr-2">⏸️</span>暂停
              </el-button>
              <el-button @click="resetGame" :disabled="!isPlaying && !gameOver" type="danger" size="large"
                class="modern-btn px-8 py-3 text-lg font-semibold">
                <span class="mr-2">🔄</span>重置
              </el-button>
            </div>

            <!-- 游戏状态指示器 -->
            <div class="text-center mb-4">
              <div v-if="isPaused"
                class="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                ⏸️ 游戏已暂停
              </div>
              <div v-else-if="isPlaying"
                class="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium animate-pulse">
                🎮 游戏进行中
              </div>
              <div v-else
                class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                🎯 准备开始
              </div>
            </div>

            <!-- 游戏画布 -->
            <div
              class="relative mx-auto rounded-2xl overflow-hidden shadow-inner bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-emerald-200"
              :style="{ width: `${gridSize * cellSize}px`, height: `${gridSize * cellSize}px` }">

              <!-- 网格背景 -->
              <div class="absolute inset-0 opacity-20">
                <div v-for="i in gridSize" :key="`row-${i}`" class="absolute border-t border-emerald-300"
                  :style="{ top: `${(i - 1) * cellSize}px`, width: '100%' }"></div>
                <div v-for="i in gridSize" :key="`col-${i}`" class="absolute border-l border-emerald-300"
                  :style="{ left: `${(i - 1) * cellSize}px`, height: '100%' }"></div>
              </div>

              <!-- 蛇身体 -->
              <div v-for="(segment, index) in snake" :key="`snake-${index}`"
                class="absolute transition-all duration-150 ease-out" :class="segmentClass(index)"
                :style="segmentStyle(segment, index)">
                <div v-if="index === 0"
                  class="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {{ getHeadEmoji() }}
                </div>
              </div>

              <!-- 食物 -->
              <div v-if="food" class="absolute rounded-full transition-all duration-300 animate-bounce"
                :class="foodClass" :style="foodStyle">
                <div class="absolute inset-0 flex items-center justify-center text-lg">
                  {{ foodEmoji }}
                </div>
              </div>

              <!-- 特殊食物效果 -->
              <div v-if="specialFood" class="absolute rounded-full animate-pulse" :style="specialFoodStyle">
                <div class="absolute inset-0 flex items-center justify-center text-lg animate-spin">
                  ⭐
                </div>
              </div>

              <!-- 游戏暂停遮罩 -->
              <div v-if="isPaused"
                class="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div class="text-white text-4xl font-bold animate-pulse">⏸️ 暂停中</div>
              </div>
            </div>

            <!-- 操作提示 -->
            <div class="mt-6 text-center text-sm text-gray-600">
              <p class="mb-2">🎮 使用方向键或 WASD 控制蛇的移动</p>
              <p>⏯️ 按空格键开始/暂停游戏</p>
            </div>
          </el-card>
        </div>

        <!-- 侧边栏 -->
        <div class="w-full lg:w-80 space-y-6">
          <!-- 游戏设置 -->
          <el-card class="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <template #header>
              <div class="flex items-center">
                <span class="text-lg font-semibold">⚙️ 游戏设置</span>
              </div>
            </template>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">难度等级</label>
                <el-select v-model="difficulty" @change="changeDifficulty" :disabled="isPlaying" class="w-full">
                  <el-option label="🐌 简单" value="easy" />
                  <el-option label="🚶 普通" value="normal" />
                  <el-option label="🏃 困难" value="hard" />
                  <el-option label="🚀 极限" value="extreme" />
                </el-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">主题颜色</label>
                <div class="grid grid-cols-4 gap-2">
                  <button v-for="theme in themes" :key="theme.name" @click="currentTheme = theme" :class="['w-8 h-8 rounded-full border-2 transition-all',
                    currentTheme.name === theme.name ? 'border-gray-800 scale-110' : 'border-gray-300']"
                    :style="{ backgroundColor: theme.primary }">
                  </button>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 排行榜 -->
          <el-card class="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <template #header>
              <div class="flex items-center">
                <span class="text-lg font-semibold">🏆 历史记录</span>
              </div>
            </template>
            <div class="space-y-2">
              <div v-for="(record, index) in gameHistory.slice(0, 5)" :key="index"
                class="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                <span class="text-sm">{{ formatDate(record.date) }}</span>
                <span class="font-semibold text-emerald-600">{{ record.score }}</span>
              </div>
              <div v-if="gameHistory.length === 0" class="text-center text-gray-500 py-4">
                暂无记录
              </div>
            </div>
          </el-card>

          <!-- 成就系统 -->
          <el-card class="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <template #header>
              <div class="flex items-center">
                <span class="text-lg font-semibold">🎖️ 成就</span>
              </div>
            </template>
            <div class="space-y-2">
              <div v-for="achievement in achievements" :key="achievement.id" :class="['flex items-center p-2 rounded-lg transition-all',
                achievement.unlocked ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50']">
                <span class="text-2xl mr-3">{{ achievement.icon }}</span>
                <div class="flex-1">
                  <div class="font-medium text-sm">{{ achievement.name }}</div>
                  <div class="text-xs text-gray-600">{{ achievement.description }}</div>
                </div>
                <div v-if="achievement.unlocked" class="text-yellow-500">✓</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 游戏结束对话框 -->
    <el-dialog v-model="gameOverDialog" title="🎮 游戏结束" :close-on-click-modal="false" width="400px"
      class="modern-dialog">
      <div class="text-center py-6">
        <div class="text-6xl mb-4">{{ getGameOverEmoji() }}</div>
        <p class="text-2xl font-bold mb-2 text-gray-800">得分: {{ score }}</p>
        <p class="text-lg text-gray-600 mb-2">长度: {{ snake.length }}</p>
        <p class="text-lg text-gray-600 mb-4">等级: {{ level }}</p>
        <div v-if="score === highScore && score > 0" class="mb-4">
          <div class="text-yellow-500 text-lg font-bold animate-bounce">🎉 新纪录！</div>
        </div>
        <div v-if="newAchievements.length > 0" class="mb-4">
          <div class="text-blue-500 font-bold mb-2">🎖️ 获得新成就:</div>
          <div v-for="achievement in newAchievements" :key="achievement.id" class="text-sm text-gray-700">
            {{ achievement.icon }} {{ achievement.name }}
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-center gap-3">
          <el-button @click="resetGame" type="primary" size="large" class="px-8">
            🔄 再来一局
          </el-button>
          <el-button @click="gameOverDialog = false" size="large" class="px-8">
            📊 查看统计
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import { ElButton, ElDialog, ElCard, ElSelect, ElOption } from 'element-plus';

// 游戏配置
const gridSize = 20;
const cellSize = 25;

// 难度配置
const difficultyConfig = {
  easy: { speed: 300, scoreMultiplier: 1 },
  normal: { speed: 200, scoreMultiplier: 1.5 },
  hard: { speed: 120, scoreMultiplier: 2 },
  extreme: { speed: 80, scoreMultiplier: 3 }
};

// 主题配置
const themes = [
  { name: 'classic', primary: '#4CAF50', secondary: '#2E7D32', food: '#FF5722' },
  { name: 'ocean', primary: '#2196F3', secondary: '#1565C0', food: '#FF9800' },
  { name: 'sunset', primary: '#FF5722', secondary: '#D84315', food: '#4CAF50' },
  { name: 'purple', primary: '#9C27B0', secondary: '#6A1B9A', food: '#FFC107' },
];

// 游戏状态
const snake = ref<{ x: number; y: number }[]>([{ x: 10, y: 10 }]);
const food = ref<{ x: number; y: number } | null>(null);
const specialFood = ref<{ x: number; y: number } | null>(null);
const direction = ref<{ x: number; y: number }>({ x: 1, y: 0 });
const nextDirection = ref<{ x: number; y: number }>({ x: 1, y: 0 });
const score = ref(0);
const highScore = ref(0);
const level = ref(1);
const isPlaying = ref(false);
const isPaused = ref(false);
const gameOver = ref(false);
const gameOverDialog = ref(false);
const gameLoop = ref<number | null>(null);
const difficulty = ref('normal');
const currentTheme = ref(themes[0]);
const gameHistory = ref<Array<{ score: number; date: Date; level: number }>>([]);
const newAchievements = ref<Array<any>>([]);

// 食物类型
const foodTypes = ['🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🍒'];
const foodEmoji = ref('🍎');

// 成就系统
const achievements = ref([
  { id: 1, name: '初学者', description: '获得第一分', icon: '🎯', unlocked: false, condition: (score: number) => score >= 10 },
  { id: 2, name: '小有成就', description: '达到50分', icon: '🏅', unlocked: false, condition: (score: number) => score >= 50 },
  { id: 3, name: '高手', description: '达到100分', icon: '🏆', unlocked: false, condition: (score: number) => score >= 100 },
  { id: 4, name: '长蛇', description: '长度达到15', icon: '🐍', unlocked: false, condition: (score: number, length: number) => length >= 15 },
  { id: 5, name: '速度之王', description: '在困难模式下得分', icon: '⚡', unlocked: false, condition: (score: number, length: number, diff: string) => diff === 'hard' && score >= 30 },
]);

// 计算属性
const currentSpeed = computed(() => {
  const baseSpeed = difficultyConfig[difficulty.value as keyof typeof difficultyConfig].speed;
  return Math.max(baseSpeed - (level.value - 1) * 10, 50);
});

// 初始化
onMounted(() => {
  loadGameData();
  document.addEventListener('keydown', handleKeyPress);
  generateFood();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress);
  if (gameLoop.value) {
    clearInterval(gameLoop.value);
  }
});

// 加载游戏数据
function loadGameData() {
  const savedHighScore = localStorage.getItem('snakeHighScore');
  const savedHistory = localStorage.getItem('snakeHistory');
  const savedAchievements = localStorage.getItem('snakeAchievements');

  if (savedHighScore) {
    highScore.value = parseInt(savedHighScore);
  }
  if (savedHistory) {
    gameHistory.value = JSON.parse(savedHistory);
  }
  if (savedAchievements) {
    const saved = JSON.parse(savedAchievements);
    achievements.value.forEach(achievement => {
      if (saved.includes(achievement.id)) {
        achievement.unlocked = true;
      }
    });
  }
}

// 保存游戏数据
function saveGameData() {
  localStorage.setItem('snakeHighScore', highScore.value.toString());
  localStorage.setItem('snakeHistory', JSON.stringify(gameHistory.value));
  const unlockedAchievements = achievements.value.filter(a => a.unlocked).map(a => a.id);
  localStorage.setItem('snakeAchievements', JSON.stringify(unlockedAchievements));
}

// 键盘控制
function handleKeyPress(e: KeyboardEvent) {
  e.preventDefault();
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      if (direction.value.y === 0) {
        nextDirection.value = { x: 0, y: -1 };
      }
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      if (direction.value.y === 0) {
        nextDirection.value = { x: 0, y: 1 };
      }
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (direction.value.x === 0) {
        nextDirection.value = { x: -1, y: 0 };
      }
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (direction.value.x === 0) {
        nextDirection.value = { x: 1, y: 0 };
      }
      break;
    case ' ':
      if (isPlaying.value) {
        isPaused.value ? resumeGame() : pauseGame();
      } else {
        startGame();
      }
      break;
  }
}

// 样式函数
function segmentStyle(segment: { x: number, y: number }, index: number) {
  return {
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    left: `${segment.x * cellSize}px`,
    top: `${segment.y * cellSize}px`,
    backgroundColor: index === 0 ? currentTheme.value.primary : currentTheme.value.secondary,
    borderColor: index === 0 ? currentTheme.value.secondary : currentTheme.value.primary,
    opacity: index === 0 ? 1 : Math.max(0.6, 1 - index * 0.02),
    zIndex: index === 0 ? 10 : 9 - Math.min(index, 8),
  };
}

function segmentClass(index: number) {
  return [
    'border-2 rounded-lg shadow-lg',
    index === 0 ? 'animate-pulse' : '',
  ];
}

const foodStyle = computed(() => ({
  width: `${cellSize}px`,
  height: `${cellSize}px`,
  left: `${(food.value?.x ?? 0) * cellSize}px`,
  top: `${(food.value?.y ?? 0) * cellSize}px`,
  backgroundColor: currentTheme.value.food,
  border: `2px solid ${currentTheme.value.primary}`,
}));

const foodClass = computed(() => [
  'border-2 shadow-lg',
  'hover:scale-110 transition-transform',
]);

const specialFoodStyle = computed(() => ({
  width: `${cellSize}px`,
  height: `${cellSize}px`,
  left: `${(specialFood.value?.x ?? 0) * cellSize}px`,
  top: `${(specialFood.value?.y ?? 0) * cellSize}px`,
  backgroundColor: '#FFD700',
  border: '2px solid #FFA500',
}));

// 游戏逻辑函数
function getHeadEmoji() {
  const dir = direction.value;
  if (dir.x === 1) return '▶️';
  if (dir.x === -1) return '◀️';
  if (dir.y === 1) return '▼️';
  if (dir.y === -1) return '▲️';
  return '🐍';
}

function getGameOverEmoji() {
  if (score.value === 0) return '😅';
  if (score.value < 30) return '😊';
  if (score.value < 100) return '😎';
  return '🤩';
}

function changeDifficulty() {
  if (isPlaying.value) return;
  // 重置游戏状态
  resetGame();
}

function startGame() {
  if (gameOver.value) {
    resetGame();
  }
  isPlaying.value = true;
  isPaused.value = false;
  gameOver.value = false;
  gameOverDialog.value = false;

  if (!food.value) {
    generateFood();
  }

  if (gameLoop.value) {
    clearInterval(gameLoop.value);
  }
  gameLoop.value = setInterval(updateGame, currentSpeed.value);
}

function pauseGame() {
  isPaused.value = true;
  if (gameLoop.value) {
    clearInterval(gameLoop.value);
    gameLoop.value = null;
  }
}

function resumeGame() {
  isPaused.value = false;
  gameLoop.value = setInterval(updateGame, currentSpeed.value);
}

function resetGame() {
  if (gameLoop.value) {
    clearInterval(gameLoop.value);
    gameLoop.value = null;
  }

  snake.value = [{ x: 10, y: 10 }];
  direction.value = { x: 1, y: 0 };
  nextDirection.value = { x: 1, y: 0 };
  score.value = 0;
  level.value = 1;
  isPlaying.value = false;
  isPaused.value = false;
  gameOver.value = false;
  gameOverDialog.value = false;
  food.value = null;
  specialFood.value = null;
  newAchievements.value = [];
  generateFood();
}

function generateFood() {
  let newFood: { x: number, y: number };
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (snake.value.some(segment => segment.x === newFood.x && segment.y === newFood.y));

  food.value = newFood;
  foodEmoji.value = foodTypes[Math.floor(Math.random() * foodTypes.length)];

  // 随机生成特殊食物
  if (Math.random() < 0.1 && !specialFood.value) {
    generateSpecialFood();
  }
}

function generateSpecialFood() {
  let newSpecialFood: { x: number, y: number };
  do {
    newSpecialFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (
    snake.value.some(segment => segment.x === newSpecialFood.x && segment.y === newSpecialFood.y) ||
    (food.value && food.value.x === newSpecialFood.x && food.value.y === newSpecialFood.y)
  );

  specialFood.value = newSpecialFood;

  // 5秒后消失
  setTimeout(() => {
    specialFood.value = null;
  }, 5000);
}

function checkCollision() {
  const head = snake.value[0];

  // 墙壁碰撞
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    return true;
  }

  // 自身碰撞
  for (let i = 1; i < snake.value.length; i++) {
    if (head.x === snake.value[i].x && head.y === snake.value[i].y) {
      return true;
    }
  }

  return false;
}

function checkAchievements() {
  const newUnlocked: any[] = [];

  achievements.value.forEach(achievement => {
    if (!achievement.unlocked && achievement.condition(score.value, snake.value.length, difficulty.value)) {
      achievement.unlocked = true;
      newUnlocked.push(achievement);
    }
  });

  newAchievements.value = newUnlocked;
  return newUnlocked.length > 0;
}

function updateGame() {
  direction.value = { ...nextDirection.value };
  const head = { ...snake.value[0] };

  head.x += direction.value.x;
  head.y += direction.value.y;

  snake.value.unshift(head);

  let ateFood = false;

  // 检查普通食物
  if (food.value && head.x === food.value.x && head.y === food.value.y) {
    const multiplier = difficultyConfig[difficulty.value as keyof typeof difficultyConfig].scoreMultiplier;
    score.value += Math.floor(10 * multiplier);
    ateFood = true;
    generateFood();
  }

  // 检查特殊食物
  if (specialFood.value && head.x === specialFood.value.x && head.y === specialFood.value.y) {
    const multiplier = difficultyConfig[difficulty.value as keyof typeof difficultyConfig].scoreMultiplier;
    score.value += Math.floor(50 * multiplier);
    specialFood.value = null;
    ateFood = true;
  }

  if (!ateFood) {
    snake.value.pop();
  }

  // 更新等级
  const newLevel = Math.floor(score.value / 50) + 1;
  if (newLevel > level.value) {
    level.value = newLevel;
    // 重新设置游戏循环以更新速度
    if (gameLoop.value) {
      clearInterval(gameLoop.value);
      gameLoop.value = setInterval(updateGame, currentSpeed.value);
    }
  }

  // 检查碰撞
  if (checkCollision()) {
    endGame();
  }
}

function endGame() {
  gameOver.value = true;
  isPlaying.value = false;

  if (gameLoop.value) {
    clearInterval(gameLoop.value);
    gameLoop.value = null;
  }

  // 更新最高分
  if (score.value > highScore.value) {
    highScore.value = score.value;
  }

  // 添加到历史记录
  gameHistory.value.unshift({
    score: score.value,
    date: new Date(),
    level: level.value
  });

  // 保留最近20条记录
  if (gameHistory.value.length > 20) {
    gameHistory.value = gameHistory.value.slice(0, 20);
  }

  // 检查成就
  checkAchievements();

  // 保存数据
  saveGameData();

  // 延迟显示对话框
  setTimeout(() => {
    gameOverDialog.value = true;
  }, 500);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}
</script>

<style scoped>
.modern-btn {
  @apply rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg;
}

.modern-dialog :deep(.el-dialog) {
  @apply rounded-2xl overflow-hidden;
}

.modern-dialog :deep(.el-dialog__header) {
  @apply bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200;
}

.modern-dialog :deep(.el-dialog__body) {
  @apply bg-white;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .container {
    @apply px-2;
  }
}

@media (max-width: 640px) {
  .container {
    @apply px-1;
  }

  .text-5xl {
    @apply text-3xl;
  }

  .gap-8 {
    @apply gap-4;
  }

  .px-6 {
    @apply px-4;
  }
}

/* 动画效果 */
@keyframes glow {

  0%,
  100% {
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }

  50% {
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
  }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

/* 自定义滚动条 */
:deep(.el-scrollbar__wrap) {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

:deep(.el-scrollbar__wrap::-webkit-scrollbar) {
  width: 6px;
}

:deep(.el-scrollbar__wrap::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.el-scrollbar__wrap::-webkit-scrollbar-thumb) {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style>
