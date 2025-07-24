// 计算Worker - 处理大数据计算任务

self.onmessage = function(e) {
  const { type, size } = e.data;
  
  let result;
  
  try {
    switch (type) {
      case 'prime':
        result = calculatePrimes(size);
        break;
      case 'fibonacci':
        result = calculateFibonacci(size);
        break;
      case 'matrix':
        result = matrixMultiplication(Math.sqrt(size));
        break;
      case 'sort':
        result = sortLargeArray(size).length;
        break;
      default:
        throw new Error('Unknown computation type');
    }
    
    self.postMessage({
      success: true,
      result: result,
      type: type
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
      type: type
    });
  }
};

// 质数计算
function calculatePrimes(limit) {
  let count = 0;
  const sieve = new Array(limit).fill(true);
  sieve[0] = sieve[1] = false;
  
  for (let i = 2; i * i < limit; i++) {
    if (sieve[i]) {
      for (let j = i * i; j < limit; j += i) {
        sieve[j] = false;
      }
    }
  }
  
  for (let i = 2; i < limit; i++) {
    if (sieve[i]) count++;
  }
  
  return count;
}

// 斐波那契数列计算
function calculateFibonacci(n) {
  if (n <= 1) return n;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
    
    // 防止数值过大，取模运算
    if (b > Number.MAX_SAFE_INTEGER / 2) {
      b = b % 1000000007;
      a = a % 1000000007;
    }
  }
  
  return b;
}

// 矩阵乘法
function matrixMultiplication(size) {
  const matrixA = createRandomMatrix(size, size);
  const matrixB = createRandomMatrix(size, size);
  const result = new Array(size).fill(0).map(() => new Array(size).fill(0));
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }
  
  // 返回结果矩阵的和
  let sum = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      sum += result[i][j];
    }
  }
  
  return Math.round(sum);
}

// 创建随机矩阵
function createRandomMatrix(rows, cols) {
  const matrix = new Array(rows);
  for (let i = 0; i < rows; i++) {
    matrix[i] = new Array(cols);
    for (let j = 0; j < cols; j++) {
      matrix[i][j] = Math.random() * 10;
    }
  }
  return matrix;
}

// 大数组排序
function sortLargeArray(size) {
  const arr = new Array(size);
  
  // 生成随机数组
  for (let i = 0; i < size; i++) {
    arr[i] = Math.random() * 1000000;
  }
  
  // 使用快速排序
  quickSort(arr, 0, arr.length - 1);
  
  return arr;
}

// 快速排序实现
function quickSort(arr, low, high) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

// 进度报告功能
function reportProgress(current, total, operation) {
  if (current % Math.floor(total / 10) === 0) {
    self.postMessage({
      type: 'progress',
      progress: (current / total) * 100,
      operation: operation
    });
  }
}

// 错误处理
self.onerror = function(error) {
  self.postMessage({
    success: false,
    error: error.message,
    stack: error.stack
  });
};

// Worker信息
self.postMessage({
  type: 'ready',
  message: 'Computation Worker is ready',
  capabilities: ['prime', 'fibonacci', 'matrix', 'sort']
});
