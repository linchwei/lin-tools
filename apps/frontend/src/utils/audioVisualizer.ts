export interface VisualizerConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export class AudioVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<VisualizerConfig>;

  constructor(canvas: HTMLCanvasElement, config: VisualizerConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = {
      backgroundColor: '#1a1a2e',
      primaryColor: '#16213e',
      secondaryColor: '#0f3460',
      ...config
    };
    
    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.canvas.style.width = `${this.config.width}px`;
    this.canvas.style.height = `${this.config.height}px`;
  }

  // 频谱条形图
  renderBars(frequencyData: Uint8Array): void {
    const { width, height } = this.config;
    const barCount = Math.min(frequencyData.length / 2, 128);
    const barWidth = width / barCount;

    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < barCount; i++) {
      const barHeight = (frequencyData[i] / 255) * height * 0.8;
      const x = i * barWidth;
      const y = height - barHeight;

      // 创建渐变
      const gradient = this.ctx.createLinearGradient(0, height, 0, y);
      gradient.addColorStop(0, '#ff6b6b');
      gradient.addColorStop(0.5, '#4ecdc4');
      gradient.addColorStop(1, '#45b7d1');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth - 2, barHeight);

      // 添加发光效果
      this.ctx.shadowColor = '#4ecdc4';
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(x, y, barWidth - 2, Math.min(barHeight, 20));
      this.ctx.shadowBlur = 0;
    }
  }

  // 圆形频谱
  renderCircular(frequencyData: Uint8Array): void {
    const { width, height } = this.config;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;

    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    const barCount = Math.min(frequencyData.length / 4, 64);
    const angleStep = (Math.PI * 2) / barCount;

    for (let i = 0; i < barCount; i++) {
      const angle = i * angleStep;
      const barHeight = (frequencyData[i] / 255) * radius;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      // 创建径向渐变
      const gradient = this.ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + barHeight);
      gradient.addColorStop(0, '#ff6b6b');
      gradient.addColorStop(1, '#4ecdc4');

      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }

    // 绘制中心圆
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    this.ctx.fillStyle = '#45b7d1';
    this.ctx.fill();
  }

  // 波形图
  renderWaveform(timeDomainData: Uint8Array): void {
    const { width, height } = this.config;
    
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#4ecdc4';
    this.ctx.beginPath();

    const sliceWidth = width / timeDomainData.length;
    let x = 0;

    for (let i = 0; i < timeDomainData.length; i++) {
      const v = timeDomainData[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.ctx.stroke();

    // 添加发光效果
    this.ctx.shadowColor = '#4ecdc4';
    this.ctx.shadowBlur = 5;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }

  // 粒子效果
  renderParticles(frequencyData: Uint8Array, particles: Particle[]): void {
    const { width, height } = this.config;
    
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    const averageFreq = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length;

    particles.forEach((particle, index) => {
      // 根据频率数据更新粒子
      const freqIndex = Math.floor((index / particles.length) * frequencyData.length);
      const intensity = frequencyData[freqIndex] / 255;

      particle.update(intensity);

      // 绘制粒子
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.alpha})`;
      this.ctx.fill();

      // 添加发光效果
      this.ctx.shadowColor = `hsl(${particle.hue}, 70%, 60%)`;
      this.ctx.shadowBlur = particle.size * 2;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });
  }

  // 3D频谱
  render3DSpectrum(frequencyData: Uint8Array): void {
    const { width, height } = this.config;
    
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    const barCount = Math.min(frequencyData.length / 3, 64);
    const barWidth = width / barCount;
    const perspective = height / 2;

    for (let i = 0; i < barCount; i++) {
      const barHeight = (frequencyData[i] / 255) * height * 0.6;
      const x = i * barWidth;
      const z = i * 2; // 模拟深度

      // 3D效果的顶部
      const topX = x + z * 0.5;
      const topY = height - barHeight - z * 0.3;
      const topWidth = barWidth - z * 0.1;
      const topHeight = barHeight;

      // 侧面
      this.ctx.fillStyle = `hsl(${(i / barCount) * 360}, 70%, 40%)`;
      this.ctx.beginPath();
      this.ctx.moveTo(x, height);
      this.ctx.lineTo(topX, topY + topHeight);
      this.ctx.lineTo(topX + topWidth, topY + topHeight);
      this.ctx.lineTo(x + barWidth, height);
      this.ctx.closePath();
      this.ctx.fill();

      // 顶部
      this.ctx.fillStyle = `hsl(${(i / barCount) * 360}, 70%, 60%)`;
      this.ctx.fillRect(topX, topY, topWidth, topHeight);
    }
  }

  updateConfig(newConfig: Partial<VisualizerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setupCanvas();
  }
}

// 粒子类
export class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public size: number;
  public hue: number;
  public alpha: number;
  private baseSize: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.baseSize = Math.random() * 3 + 1;
    this.size = this.baseSize;
    this.hue = Math.random() * 360;
    this.alpha = 0.8;
  }

  update(intensity: number): void {
    this.x += this.vx;
    this.y += this.vy;
    
    // 根据音频强度调整大小和透明度
    this.size = this.baseSize + intensity * 5;
    this.alpha = 0.3 + intensity * 0.7;
    
    // 边界检测
    if (this.x < 0 || this.x > 800) this.vx *= -1;
    if (this.y < 0 || this.y > 600) this.vy *= -1;
    
    // 保持在画布内
    this.x = Math.max(0, Math.min(800, this.x));
    this.y = Math.max(0, Math.min(600, this.y));
  }
}