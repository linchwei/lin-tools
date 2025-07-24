// 视频处理Worker - 实时视频流滤镜处理

let frameCount = 0;
let startTime = Date.now();
let lastFrameTime = 0;

self.onmessage = function(e) {
  const { imageData, filter, options } = e.data;
  
  try {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    let processedImageData;
    
    switch (filter) {
      case 'grayscale':
        processedImageData = applyGrayscale(imageData);
        break;
      case 'invert':
        processedImageData = applyInvert(imageData);
        break;
      case 'blur':
        processedImageData = applyFastBlur(imageData, options?.intensity || 2);
        break;
      case 'edge':
        processedImageData = applyEdgeDetection(imageData);
        break;
      case 'sepia':
        processedImageData = applySepia(imageData);
        break;
      case 'vintage':
        processedImageData = applyVintage(imageData);
        break;
      case 'neon':
        processedImageData = applyNeon(imageData);
        break;
      case 'thermal':
        processedImageData = applyThermal(imageData);
        break;
      case 'pixelate':
        processedImageData = applyPixelate(imageData, options?.blockSize || 8);
        break;
      case 'mirror':
        processedImageData = applyMirror(imageData, options?.direction || 'horizontal');
        break;
      default:
        processedImageData = imageData;
    }
    
    frameCount++;
    
    // 计算FPS
    const fps = frameCount / ((currentTime - startTime) / 1000);
    
    self.postMessage({
      success: true,
      imageData: processedImageData,
      filter: filter,
      frameCount: frameCount,
      fps: Math.round(fps),
      processingTime: Date.now() - currentTime,
      deltaTime: deltaTime
    });
    
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
      filter: filter,
      frameCount: frameCount
    });
  }
};

// 快速灰度转换 (优化版本)
function applyGrayscale(imageData) {
  const data = new Uint8ClampedArray(imageData.data);
  
  // 使用位运算优化
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] * 77 + data[i + 1] * 151 + data[i + 2] * 28) >> 8;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

// 反色滤镜
function applyInvert(imageData) {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

// 快速模糊 (简化版本，适合实时处理)
function applyFastBlur(imageData, radius) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  
  // 简化的盒式模糊，性能更好
  const boxSize = radius * 2 + 1;
  const boxArea = boxSize * boxSize;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const idx = (ny * width + nx) * 4;
          
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          a += data[idx + 3];
        }
      }
      
      const outIdx = (y * width + x) * 4;
      output[outIdx] = r / boxArea;
      output[outIdx + 1] = g / boxArea;
      output[outIdx + 2] = b / boxArea;
      output[outIdx + 3] = a / boxArea;
    }
  }
  
  return new ImageData(output, width, height);
}

// 边缘检测 (简化版本)
function applyEdgeDetection(imageData) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  
  // 先转换为灰度
  const grayData = applyGrayscale(imageData).data;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // 简化的边缘检测
      const tl = grayData[((y - 1) * width + (x - 1)) * 4];
      const tr = grayData[((y - 1) * width + (x + 1)) * 4];
      const bl = grayData[((y + 1) * width + (x - 1)) * 4];
      const br = grayData[((y + 1) * width + (x + 1)) * 4];
      
      const edge = Math.abs(tl - br) + Math.abs(tr - bl);
      
      output[idx] = edge;
      output[idx + 1] = edge;
      output[idx + 2] = edge;
      output[idx + 3] = data[idx + 3];
    }
  }
  
  return new ImageData(output, width, height);
}

// 棕褐色滤镜
function applySepia(imageData) {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

// 复古滤镜
function applyVintage(imageData) {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // 复古色调调整
    data[i] = Math.min(255, r * 1.2 + 30);
    data[i + 1] = Math.min(255, g * 1.1 + 20);
    data[i + 2] = Math.min(255, b * 0.8 + 10);
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

// 霓虹滤镜
function applyNeon(imageData) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  
  // 先应用边缘检测
  const edgeData = applyEdgeDetection(imageData).data;
  
  for (let i = 0; i < data.length; i += 4) {
    const edge = edgeData[i];
    
    if (edge > 50) {
      // 霓虹色彩
      data[i] = Math.min(255, edge * 2);     // 红色增强
      data[i + 1] = Math.min(255, edge * 1.5); // 绿色
      data[i + 2] = Math.min(255, edge * 3);   // 蓝色增强
    } else {
      // 暗化非边缘区域
      data[i] = data[i] * 0.2;
      data[i + 1] = data[i + 1] * 0.2;
      data[i + 2] = data[i + 2] * 0.2;
    }
  }
  
  return new ImageData(data, width, height);
}

// 热成像滤镜
function applyThermal(imageData) {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    
    // 热成像色彩映射
    if (gray < 64) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = gray * 4;
    } else if (gray < 128) {
      data[i] = 0;
      data[i + 1] = (gray - 64) * 4;
      data[i + 2] = 255;
    } else if (gray < 192) {
      data[i] = (gray - 128) * 4;
      data[i + 1] = 255;
      data[i + 2] = 255 - (gray - 128) * 4;
    } else {
      data[i] = 255;
      data[i + 1] = 255 - (gray - 192) * 4;
      data[i + 2] = 0;
    }
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

// 像素化滤镜
function applyPixelate(imageData, blockSize) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      
      // 计算块的平均颜色
      for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          a += data[idx + 3];
          count++;
        }
      }
      
      r /= count;
      g /= count;
      b /= count;
      a /= count;
      
      // 填充整个块
      for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          output[idx] = r;
          output[idx + 1] = g;
          output[idx + 2] = b;
          output[idx + 3] = a;
        }
      }
    }
  }
  
  return new ImageData(output, width, height);
}

// 镜像滤镜
function applyMirror(imageData, direction) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  
  if (direction === 'horizontal') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = (y * width + (width - 1 - x)) * 4;
        
        output[dstIdx] = data[srcIdx];
        output[dstIdx + 1] = data[srcIdx + 1];
        output[dstIdx + 2] = data[srcIdx + 2];
        output[dstIdx + 3] = data[srcIdx + 3];
      }
    }
  } else if (direction === 'vertical') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = ((height - 1 - y) * width + x) * 4;
        
        output[dstIdx] = data[srcIdx];
        output[dstIdx + 1] = data[srcIdx + 1];
        output[dstIdx + 2] = data[srcIdx + 2];
        output[dstIdx + 3] = data[srcIdx + 3];
      }
    }
  }
  
  return new ImageData(output, width, height);
}

// 实时性能监控
function reportPerformance() {
  const currentTime = Date.now();
  const totalTime = currentTime - startTime;
  const avgFps = frameCount / (totalTime / 1000);
  
  self.postMessage({
    type: 'performance',
    frameCount: frameCount,
    totalTime: totalTime,
    avgFps: Math.round(avgFps),
    timestamp: currentTime
  });
}

// 定期报告性能
setInterval(reportPerformance, 5000);

// 重置统计
self.addEventListener('message', function(e) {
  if (e.data.type === 'reset') {
    frameCount = 0;
    startTime = Date.now();
    lastFrameTime = startTime;
  }
});

// 错误处理
self.onerror = function(error) {
  self.postMessage({
    success: false,
    error: error.message,
    stack: error.stack,
    frameCount: frameCount
  });
};

// Worker就绪通知
self.postMessage({
  type: 'ready',
  message: 'Video Worker is ready',
  filters: [
    'grayscale', 'invert', 'blur', 'edge', 'sepia', 
    'vintage', 'neon', 'thermal', 'pixelate', 'mirror'
  ],
  optimizedForRealtime: true
});
