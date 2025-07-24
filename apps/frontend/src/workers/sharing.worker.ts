// Web Worker for data sharing with SharedArrayBuffer

let sharedBuffer: SharedArrayBuffer | null = null
let sharedView: Int32Array | null = null
let workerId = 0
let isRunning = false
let readCount = 0
let writeCount = 0

// 监听主线程消息
self.onmessage = function(e) {
  const { type, buffer, workerId: id } = e.data
  
  switch (type) {
    case 'init':
      sharedBuffer = buffer
      sharedView = new Int32Array(buffer)
      workerId = id
      isRunning = true
      startDataOperations()
      break
      
    case 'stop':
      isRunning = false
      break
  }
}

// 开始数据操作
function startDataOperations() {
  if (!sharedView) return
  
  const operate = () => {
    if (!isRunning || !sharedView) return
    
    // 随机读写操作
    const operation = Math.random() > 0.5 ? 'read' : 'write'
    const index = Math.floor(Math.random() * sharedView.length)
    
    if (operation === 'read') {
      // 读取数据
      const value = Atomics.load(sharedView, index)
      readCount++
    } else {
      // 写入数据
      const newValue = Math.floor(Math.random() * 1000)
      Atomics.store(sharedView, index, newValue)
      writeCount++
    }
    
    // 每100次操作发送一次统计
    if ((readCount + writeCount) % 100 === 0) {
      self.postMessage({
        type: 'stats',
        workerId,
        reads: readCount,
        writes: writeCount
      })
      readCount = 0
      writeCount = 0
    }
    
    // 继续操作
    setTimeout(operate, Math.random() * 10)
  }
  
  operate()
}

// 导出类型定义
export {}
