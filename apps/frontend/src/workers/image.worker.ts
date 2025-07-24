// Web Worker for image processing

// 监听主线程消息
self.onmessage = function(e) {
  const { type, imageData, filter } = e.data
  
  if (type === 'process') {
    try {
      processImage(imageData, filter)
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : '图像处理错误'
      })
    }
  }
}

// 处理图像
function processImage(imageDataUrl: string, filter: string) {
  // 创建离屏Canvas
  const canvas = new OffscreenCanvas(1, 1)
  const ctx = canvas.getContext('2d')!
  
  // 创建图像
  const img = new Image()
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    applyFilter(imageData, filter)
    ctx.putImageData(imageData, 0, 0)
    
    // 转换为Blob然后转为DataURL
    canvas.convertToBlob().then(blob => {
      const reader = new FileReader()
      reader.onload = () => {
        self.postMessage({
          type: 'result',
          result: reader.result
        })
      }
      reader.readAsDataURL(blob)
    })
  }
  
  img.src = imageDataUrl
}

// 应用滤镜
function applyFilter(imageData: ImageData, filter: string) {
  const data = imageData.data
  
  switch (filter) {
    case 'grayscale':
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        data[i] = gray
        data[i + 1] = gray
        data[i + 2] = gray
      }
      break
      
    case 'invert':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]
        data[i + 1] = 255 - data[i + 1]
        data[i + 2] = 255 - data[i + 2]
      }
      break
      
    case 'blur':
      // 简单模糊效果
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() > 0.8) {
          data[i] = Math.min(255, data[i] + Math.random() * 50 - 25)
          data[i + 1] = Math.min(255, data[i + 1] + Math.random() * 50 - 25)
          data[i + 2] = Math.min(255, data[i + 2] + Math.random() * 50 - 25)
        }
      }
      break
      
    case 'sharpen':
      // 锐化效果
      const width = imageData.width
      const height = imageData.height
      const newData = new Uint8ClampedArray(data)
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4
          
          for (let c = 0; c < 3; c++) {
            const center = data[idx + c]
            const top = data[((y - 1) * width + x) * 4 + c]
            const bottom = data[((y + 1) * width + x) * 4 + c]
            const left = data[(y * width + (x - 1)) * 4 + c]
            const right = data[(y * width + (x + 1)) * 4 + c]
            
            newData[idx + c] = Math.min(255, Math.max(0, 
              center * 5 - top - bottom - left - right
            ))
          }
        }
      }
      
      for (let i = 0; i < data.length; i++) {
        data[i] = newData[i]
      }
      break
      
    case 'edge':
      // 边缘检测
      const edgeWidth = imageData.width
      const edgeHeight = imageData.height
      const edgeData = new Uint8ClampedArray(data.length)
      
      for (let y = 1; y < edgeHeight - 1; y++) {
        for (let x = 1; x < edgeWidth - 1; x++) {
          const idx = (y * edgeWidth + x) * 4
          
          let gx = 0, gy = 0
          
          // Sobel算子
          for (let c = 0; c < 3; c++) {
            const tl = data[((y - 1) * edgeWidth + (x - 1)) * 4 + c]
            const tm = data[((y - 1) * edgeWidth + x) * 4 + c]
            const tr = data[((y - 1) * edgeWidth + (x + 1)) * 4 + c]
            const ml = data[(y * edgeWidth + (x - 1)) * 4 + c]
            const mr = data[(y * edgeWidth + (x + 1)) * 4 + c]
            const bl = data[((y + 1) * edgeWidth + (x - 1)) * 4 + c]
            const bm = data[((y + 1) * edgeWidth + x) * 4 + c]
            const br = data[((y + 1) * edgeWidth + (x + 1)) * 4 + c]
            
            gx = -tl - 2 * ml - bl + tr + 2 * mr + br
            gy = -tl - 2 * tm - tr + bl + 2 * bm + br
          }
          
          const magnitude = Math.sqrt(gx * gx + gy * gy)
          const value = Math.min(255, magnitude)
          
          edgeData[idx] = value
          edgeData[idx + 1] = value
          edgeData[idx + 2] = value
          edgeData[idx + 3] = data[idx + 3]
        }
      }
      
      for (let i = 0; i < data.length; i++) {
        data[i] = edgeData[i]
      }
      break
  }
}

// 导出类型定义
export {}
