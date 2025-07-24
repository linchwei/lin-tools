// Web Worker for computation tasks

// 监听主线程消息
self.onmessage = function(e) {
  const { type, size, algorithm } = e.data
  
  if (type === 'compute') {
    try {
      const result = performComputation(size, algorithm)
      self.postMessage({
        type: 'result',
        result
      })
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : '计算错误'
      })
    }
  }
}

// 计算函数
function performComputation(size: number, algorithmType: string): string {
  switch (algorithmType) {
    case 'prime':
      return computePrimes(size)
    case 'fibonacci':
      return computeFibonacci(size)
    case 'matrix':
      return computeMatrix(size)
    case 'sort':
      return computeSort(size)
    default:
      return '未知算法'
  }
}

// 质数计算
function computePrimes(limit: number): string {
  const primes: number[] = []
  for (let i = 2; i < limit && primes.length < 1000; i++) {
    let isPrime = true
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) {
        isPrime = false
        break
      }
    }
    if (isPrime) primes.push(i)
  }
  return `找到 ${primes.length} 个质数，最大值: ${primes[primes.length - 1] || 0}`
}

// 斐波那契数列
function computeFibonacci(n: number): string {
  const limit = Math.min(n, 50) // 限制计算量
  let a = 0, b = 1
  for (let i = 2; i < limit; i++) {
    const temp = a + b
    a = b
    b = temp
  }
  return `第 ${limit} 个斐波那契数: ${b}`
}

// 矩阵乘法
function computeMatrix(size: number): string {
  const matrixSize = Math.min(Math.floor(Math.sqrt(size / 1000)), 500)
  const a = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(Math.random()))
  const b = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(Math.random()))
  const c = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(0))
  
  for (let i = 0; i < matrixSize; i++) {
    for (let j = 0; j < matrixSize; j++) {
      for (let k = 0; k < matrixSize; k++) {
        c[i][j] += a[i][k] * b[k][j]
      }
    }
  }
  
  return `${matrixSize}x${matrixSize} 矩阵乘法完成`
}

// 排序算法
function computeSort(size: number): string {
  const arraySize = Math.min(size, 100000)
  const arr = Array(arraySize).fill(0).map(() => Math.random())
  
  // 快速排序
  function quickSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr
    const pivot = arr[Math.floor(arr.length / 2)]
    const left = arr.filter(x => x < pivot)
    const middle = arr.filter(x => x === pivot)
    const right = arr.filter(x => x > pivot)
    return [...quickSort(left), ...middle, ...quickSort(right)]
  }
  
  const sorted = quickSort(arr)
  return `排序 ${arraySize} 个数字完成`
}

// 导出类型定义
export {}
