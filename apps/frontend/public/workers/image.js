// 图像处理Worker - 处理各种图像滤镜效果

self.onmessage = function(e) {
  const { imageData, filter, intensity } = e.data;
  
  try {
    let processedImageData;
    
    switch (filter) {
      case 'grayscale':
        processedImageData = applyGrayscale(imageData);
        break;
      case 'blur':
        processedImageData = applyBlur(imageData, intensity || 3);
        break;
      case 'sharpen':
        processedImageData = applySharpen(imageData);
        break;
      case 'edge':
        processedImageData = applyEdgeDetection(imageData);
        break;
      case 'emboss':
        processedImageData = applyEmboss(imageData);
        break;
      case 'sepia':
        processedImageData = applySepia(imageData);
        break;
      case 'invert':
        processedImageData = applyInvert(imageData);
        break;
      case 'brightness':
        processedImageData = applyBrightness(imageData, intensity || 50);
        break;
      case 'contrast':
        processedImageData = applyContrast(imageData, intensity || 50);
        break;
      default:
        processedImageData = imageData;
    }
    
    self.postMessage({
      success: true,
      imageData: processedImageData,
      filter: filter,
      processingTime: Date.now()
    });
    
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
      filter: filter
    });
  }
};

// 灰度滤镜
function applyGrayscale(imageData) {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;     // Red
    data[i + 1] = gray; // Green
    data[i + 2] = gray; // Blue
    // Alpha channel (i + 3) remains unchanged
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

// 模糊滤镜 (高斯模糊)
function applyBlur(imageData, radius) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  
  // 创建高斯核
  const kernel = createGaussianKernel(radius);
  const kernelSize = kernel.length;
  const half = Math.floor(kernelSize / 2);
  
  // 水平模糊
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      
      for (let kx = 0; kx < kernelSize; kx++) {
        const px = Math.min(width - 1, Math.max(0, x + kx - half));
        const idx = (y * width + px) * 4;
        const weight = kernel[kx];
        
        r += data[idx] * weight;
        g += data[idx + 1] * weight;
        b += data[idx + 2] * weight;
        a += data[idx + 3] * weight;
      }
      
      const outIdx = (y * width + x) * 4;
      output[outIdx] = r;
      output[outIdx + 1] = g;
      output[outIdx + 2] = b;
      output[outIdx + 3] = a;
    }
  }
  
  // 垂直模糊
  const finalOutput = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      
      for (let ky = 0; ky < kernelSize; ky++) {
        const py = Math.min(height - 1, Math.max(0, y + ky - half));
        const idx = (py * width + x) * 4;
        const weight = kernel[ky];
        
        r += output[idx] * weight;
        g += output[idx + 1] * weight;
        b += output[idx + 2] * weight;
        a += output[idx + 3] * weight;
      }
      
      const outIdx = (y * width + x) * 4;
      finalOutput[outIdx] = r;
      finalOutput[outIdx + 1] = g;
      finalOutput[outIdx + 2] = b;
      finalOutput[outIdx + 3] = a;
    }
  }
  
  return new ImageData(finalOutput, width, height);
}

// 创建高斯核
function createGaussianKernel(radius) {
  const size = radius * 2 + 1;
  const kernel = new Array(size);
  const sigma = radius / 3;
  const twoSigmaSquare = 2 * sigma * sigma;
  let sum = 0;
  
  for (let i = 0; i < size; i++) {
    const x = i - radius;
    kernel[i] = Math.exp(-(x * x) / twoSigmaSquare);
    sum += kernel[i];
  }
  
  // 归一化
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }
  
  return kernel;
}

// 锐化滤镜
function applySharpen(imageData) {
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  
  return applyConvolution(imageData, kernel, 3);
}

// 边缘检测 (Sobel算子)
function applyEdgeDetection(imageData) {
  const sobelX = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
  ];
  
  const sobelY = [
    -1, -2, -1,
    0, 0, 0,
    1, 2, 1
  ];
  
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  
  // 先转换为灰度
  const grayData = applyGrayscale(imageData).data;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = grayData[idx];
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          
          gx += gray * sobelX[kernelIdx];
          gy += gray * sobelY[kernelIdx];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const outIdx = (y * width + x) * 4;
      
      output[outIdx] = magnitude;
      output[outIdx + 1] = magnitude;
      output[outIdx + 2] = magnitude;
      output[outIdx + 3] = data[outIdx + 3];
    }
  }
  
  return new ImageData(output, width, height);
}

// 浮雕滤镜
function applyEmboss(imageData) {
  const kernel = [
    -2, -1, 0,
    -1, 1, 1,
    0, 1, 2
  ];
  
  const result = applyConvolution(imageData, kernel, 3);
  
  // 添加灰度偏移
  const data = result.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] + 128);
    data[i + 1] = Math.min(255, data[i + 1] + 128);
    data[i + 2] = Math.min(255, data[i + 2] + 128);
  }
  
  return result;
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

// 反色滤镜
function applyInvert(imageData) {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];         // Red
    data[i + 1] = 255 - data[i + 1]; // Green
    data[i + 2] = 255 - data[i + 2]; // Blue
    // Alpha channel remains unchanged
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

// 亮度调整
function applyBrightness(imageData, brightness) {
  const data = new Uint8ClampedArray(imageData.data);
  const adjustment = (brightness - 50) * 2.55; // 将0-100映射到-127.5到127.5
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + adjustment));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment));
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

// 对比度调整
function applyContrast(imageData, contrast) {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

// 通用卷积操作
function applyConvolution(imageData, kernel, kernelSize) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  const half = Math.floor(kernelSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const idx = (py * width + px) * 4;
          const weight = kernel[ky * kernelSize + kx];
          
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
        }
      }
      
      const outIdx = (y * width + x) * 4;
      output[outIdx] = Math.max(0, Math.min(255, r));
      output[outIdx + 1] = Math.max(0, Math.min(255, g));
      output[outIdx + 2] = Math.max(0, Math.min(255, b));
      output[outIdx + 3] = data[outIdx + 3]; // Alpha
    }
  }
  
  return new ImageData(output, width, height);
}

// 高级滤镜：油画效果
function applyOilPainting(imageData, radius, intensity) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const intensityCount = new Array(intensity).fill(0);
      const avgR = new Array(intensity).fill(0);
      const avgG = new Array(intensity).fill(0);
      const avgB = new Array(intensity).fill(0);
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const idx = (ny * width + nx) * 4;
          
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          const curIntensity = Math.floor(((r + g + b) / 3) * intensity / 255);
          
          intensityCount[curIntensity]++;
          avgR[curIntensity] += r;
          avgG[curIntensity] += g;
          avgB[curIntensity] += b;
        }
      }
      
      let maxIndex = 0;
      for (let i = 1; i < intensity; i++) {
        if (intensityCount[i] > intensityCount[maxIndex]) {
          maxIndex = i;
        }
      }
      
      const outIdx = (y * width + x) * 4;
      output[outIdx] = avgR[maxIndex] / intensityCount[maxIndex];
      output[outIdx + 1] = avgG[maxIndex] / intensityCount[maxIndex];
      output[outIdx + 2] = avgB[maxIndex] / intensityCount[maxIndex];
      output[outIdx + 3] = data[outIdx + 3];
    }
  }
  
  return new ImageData(output, width, height);
}

// 错误处理
self.onerror = function(error) {
  self.postMessage({
    success: false,
    error: error.message,
    stack: error.stack
  });
};

// Worker就绪通知
self.postMessage({
  type: 'ready',
  message: 'Image Worker is ready',
  filters: [
    'grayscale', 'blur', 'sharpen', 'edge', 'emboss', 
    'sepia', 'invert', 'brightness', 'contrast'
  ]
});
