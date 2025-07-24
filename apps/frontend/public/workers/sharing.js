// SharedArrayBuffer数据共享Worker

let sharedBuffer = null;
let sharedArray = null;
let workerId = 0;
let readCount = 0;
let writeCount = 0;
let isRunning = false;

self.onmessage = function(e) {
  const { type, sharedBuffer: buffer, workerId: id } = e.data;
  
  switch (type) {
    case 'init':
      initializeSharedBuffer(buffer, id);
      break;
    case 'start':
      startDataSharing();
      break;
    case 'stop':
      stopDataSharing();
      break;
    case 'write':
      writeData(e.data.data);
      break;
    case 'read':
      readData(e.data.offset, e.data.length);
      break;
    default:
      console.warn('Unknown message type:', type);
  }
};

// 初始化共享缓冲区
function initializeSharedBuffer(buffer, id) {
  try {
    sharedBuffer = buffer;
    sharedArray = new Int32Array(sharedBuffer);
    workerId = id;
    
    self.postMessage({
      type: 'initialized',
      workerId: workerId,
      bufferSize: sharedBuffer.byteLength,
      arrayLength: sharedArray.length
    });
    
    // 自动开始数据共享
    startDataSharing();
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      workerId: workerId
    });
  }
}

// 开始数据共享
function startDataSharing() {
  if (!sharedArray || isRunning) return;
  
  isRunning = true;
  
  // 定期执行读写操作
  const interval = setInterval(() => {
    if (!isRunning) {
      clearInterval(interval);
      return;
    }
    
    // 随机选择读或写操作
    if (Math.random() > 0.5) {
      performWrite();
    } else {
      performRead();
    }
    
    // 定期报告状态
    if ((readCount + writeCount) % 10 === 0) {
      reportStatus();
    }
    
  }, 100 + Math.random() * 200); // 随机间隔，模拟真实场景
}

// 停止数据共享
function stopDataSharing() {
  isRunning = false;
  reportStatus();
}

// 执行写操作
function performWrite() {
  try {
    const offset = Math.floor(Math.random() * (sharedArray.length - 10));
    const data = generateRandomData(10);
    
    // 使用原子操作确保线程安全
    for (let i = 0; i < data.length; i++) {
      Atomics.store(sharedArray, offset + i, data[i]);
    }
    
    writeCount++;
    
    // 通知其他Worker有新数据
    Atomics.notify(sharedArray, offset, 1);
    
    self.postMessage({
      type: 'write',
      workerId: workerId,
      offset: offset,
      length: data.length,
      data: data
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      operation: 'write',
      workerId: workerId
    });
  }
}

// 执行读操作
function performRead() {
  try {
    const offset = Math.floor(Math.random() * (sharedArray.length - 10));
    const length = 5 + Math.floor(Math.random() * 5);
    const data = [];
    
    // 使用原子操作读取数据
    for (let i = 0; i < length && offset + i < sharedArray.length; i++) {
      data.push(Atomics.load(sharedArray, offset + i));
    }
    
    readCount++;
    
    self.postMessage({
      type: 'read',
      workerId: workerId,
      offset: offset,
      length: length,
      data: data
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      operation: 'read',
      workerId: workerId
    });
  }
}

// 生成随机数据
function generateRandomData(length) {
  const data = new Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = Math.floor(Math.random() * 1000) + workerId * 1000;
  }
  return data;
}

// 报告状态
function reportStatus() {
  self.postMessage({
    type: 'status',
    workerId: workerId,
    readCount: readCount,
    writeCount: writeCount,
    status: isRunning ? 'active' : 'stopped',
    timestamp: Date.now()
  });
}

// 高级数据操作
function performAtomicOperations() {
  if (!sharedArray) return;
  
  try {
    const index = Math.floor(Math.random() * sharedArray.length);
    const oldValue = Atomics.load(sharedArray, index);
    
    // 原子加法
    const newValue = Atomics.add(sharedArray, index, 1);
    
    // 原子比较交换
    const expectedValue = newValue;
    const replacementValue = workerId;
    const actualValue = Atomics.compareExchange(
      sharedArray, 
      index, 
      expectedValue, 
      replacementValue
    );
    
    self.postMessage({
      type: 'atomic_operation',
      workerId: workerId,
      index: index,
      oldValue: oldValue,
      newValue: newValue,
      actualValue: actualValue,
      operation: 'add_and_compare_exchange'
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      operation: 'atomic_operations',
      workerId: workerId
    });
  }
}

// 数据同步操作
function performSynchronization() {
  if (!sharedArray) return;
  
  try {
    const syncIndex = 0; // 使用第一个元素作为同步点
    
    // 等待其他Worker
    const result = Atomics.wait(sharedArray, syncIndex, 0, 1000);
    
    if (result === 'ok') {
      // 同步成功，执行协调操作
      performCoordinatedOperation();
    } else if (result === 'timed-out') {
      // 超时，继续正常操作
      self.postMessage({
        type: 'sync_timeout',
        workerId: workerId,
        message: 'Synchronization timed out'
      });
    }
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      operation: 'synchronization',
      workerId: workerId
    });
  }
}

// 协调操作
function performCoordinatedOperation() {
  // 所有Worker协调执行的操作
  const startIndex = workerId * 100;
  const endIndex = Math.min(startIndex + 100, sharedArray.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    Atomics.store(sharedArray, i, workerId);
  }
  
  self.postMessage({
    type: 'coordinated_operation',
    workerId: workerId,
    startIndex: startIndex,
    endIndex: endIndex,
    message: 'Coordinated operation completed'
  });
}

// 内存屏障和缓存一致性测试
function testMemoryConsistency() {
  if (!sharedArray) return;
  
  const testIndex = sharedArray.length - 1;
  const testValue = Date.now() + workerId;
  
  // 写入测试值
  Atomics.store(sharedArray, testIndex, testValue);
  
  // 强制内存屏障
  Atomics.fence();
  
  // 立即读取
  const readValue = Atomics.load(sharedArray, testIndex);
  
  const isConsistent = readValue === testValue;
  
  self.postMessage({
    type: 'memory_consistency_test',
    workerId: workerId,
    testValue: testValue,
    readValue: readValue,
    isConsistent: isConsistent,
    timestamp: Date.now()
  });
}

// 性能基准测试
function performBenchmark() {
  if (!sharedArray) return;
  
  const iterations = 10000;
  const startTime = performance.now();
  
  // 连续读写操作
  for (let i = 0; i < iterations; i++) {
    const index = i % sharedArray.length;
    Atomics.store(sharedArray, index, i);
    Atomics.load(sharedArray, index);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  const opsPerSecond = (iterations * 2) / (duration / 1000); // 读写各一次
  
  self.postMessage({
    type: 'benchmark_result',
    workerId: workerId,
    iterations: iterations,
    duration: duration,
    opsPerSecond: Math.round(opsPerSecond),
    timestamp: Date.now()
  });
}

// 定期执行高级操作
setInterval(() => {
  if (isRunning && sharedArray) {
    const operation = Math.floor(Math.random() * 4);
    
    switch (operation) {
      case 0:
        performAtomicOperations();
        break;
      case 1:
        testMemoryConsistency();
        break;
      case 2:
        performBenchmark();
        break;
      case 3:
        performSynchronization();
        break;
    }
  }
}, 5000 + Math.random() * 5000);

// 错误处理
self.onerror = function(error) {
  self.postMessage({
    type: 'error',
    error: error.message,
    stack: error.stack,
    workerId: workerId
  });
};

// Worker就绪通知
self.postMessage({
  type: 'ready',
  message: 'Sharing Worker is ready',
  workerId: workerId,
  capabilities: [
    'shared_array_buffer',
    'atomic_operations',
    'memory_synchronization',
    'performance_benchmarks'
  ]
});
