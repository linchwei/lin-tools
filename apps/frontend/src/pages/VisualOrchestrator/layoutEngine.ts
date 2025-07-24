// 自动布局引擎 - 基于有向无环图的自动布局算法

import type { FlowNode, Connection } from './nodeTypes'

export interface LayoutOptions {
  nodeWidth: number
  nodeHeight: number
  horizontalSpacing: number
  verticalSpacing: number
  direction: 'TB' | 'BT' | 'LR' | 'RL' // Top-Bottom, Bottom-Top, Left-Right, Right-Left
}

export interface Point {
  x: number
  y: number
}

export interface LayoutResult {
  nodes: Array<FlowNode & { x: number; y: number }>
  bounds: {
    width: number
    height: number
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
}

// 默认布局选项
const defaultOptions: LayoutOptions = {
  nodeWidth: 120,
  nodeHeight: 80,
  horizontalSpacing: 100,
  verticalSpacing: 80,
  direction: 'TB'
}

// 主要的自动布局函数
export function autoLayout(
  nodes: FlowNode[],
  connections: Connection[],
  options: Partial<LayoutOptions> = {}
): LayoutResult {
  const opts = { ...defaultOptions, ...options }
  
  // 构建图结构
  const graph = buildGraph(nodes, connections)
  
  // 拓扑排序
  const layers = topologicalSort(graph)
  
  // 计算节点位置
  const positionedNodes = calculatePositions(layers, opts)
  
  // 计算边界
  const bounds = calculateBounds(positionedNodes, opts)
  
  return {
    nodes: positionedNodes,
    bounds
  }
}

// 构建图结构
function buildGraph(nodes: FlowNode[], connections: Connection[]): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>()
  
  // 初始化节点
  for (const node of nodes) {
    graph.set(node.id, {
      id: node.id,
      node,
      inEdges: [],
      outEdges: [],
      layer: 0,
      position: 0
    })
  }
  
  // 添加边
  for (const connection of connections) {
    const sourceNode = graph.get(connection.sourceNodeId)
    const targetNode = graph.get(connection.targetNodeId)
    
    if (sourceNode && targetNode) {
      sourceNode.outEdges.push(targetNode)
      targetNode.inEdges.push(sourceNode)
    }
  }
  
  return graph
}

// 图节点接口
interface GraphNode {
  id: string
  node: FlowNode
  inEdges: GraphNode[]
  outEdges: GraphNode[]
  layer: number
  position: number
}

// 拓扑排序 - 将节点分层
function topologicalSort(graph: Map<string, GraphNode>): GraphNode[][] {
  const layers: GraphNode[][] = []
  const visited = new Set<string>()
  const inDegree = new Map<string, number>()
  
  // 计算入度
  for (const [nodeId, node] of graph) {
    inDegree.set(nodeId, node.inEdges.length)
  }
  
  // 找到所有入度为0的节点作为第一层
  let currentLayer: GraphNode[] = []
  for (const [nodeId, node] of graph) {
    if (inDegree.get(nodeId) === 0) {
      currentLayer.push(node)
      node.layer = 0
    }
  }
  
  let layerIndex = 0
  
  while (currentLayer.length > 0) {
    layers.push([...currentLayer])
    const nextLayer: GraphNode[] = []
    
    // 处理当前层的每个节点
    for (const node of currentLayer) {
      visited.add(node.id)
      
      // 更新其后继节点的入度
      for (const successor of node.outEdges) {
        if (!visited.has(successor.id)) {
          const newInDegree = (inDegree.get(successor.id) || 0) - 1
          inDegree.set(successor.id, newInDegree)
          
          // 如果入度变为0，加入下一层
          if (newInDegree === 0) {
            successor.layer = layerIndex + 1
            nextLayer.push(successor)
          }
        }
      }
    }
    
    currentLayer = nextLayer
    layerIndex++
  }
  
  // 检查是否有环
  if (visited.size !== graph.size) {
    console.warn('检测到环形依赖，使用备用布局策略')
    return fallbackLayout(graph)
  }
  
  return layers
}

// 备用布局策略（当检测到环时）
function fallbackLayout(graph: Map<string, GraphNode>): GraphNode[][] {
  const layers: GraphNode[][] = []
  const nodes = Array.from(graph.values())
  
  // 简单地按节点类型分层
  const startNodes = nodes.filter(n => n.node.type === 'start')
  const endNodes = nodes.filter(n => n.node.type === 'end')
  const otherNodes = nodes.filter(n => n.node.type !== 'start' && n.node.type !== 'end')
  
  if (startNodes.length > 0) {
    layers.push(startNodes)
    startNodes.forEach(n => n.layer = 0)
  }
  
  if (otherNodes.length > 0) {
    // 将其他节点分成多层
    const chunkSize = Math.ceil(otherNodes.length / 3)
    for (let i = 0; i < otherNodes.length; i += chunkSize) {
      const chunk = otherNodes.slice(i, i + chunkSize)
      layers.push(chunk)
      chunk.forEach(n => n.layer = layers.length - 1)
    }
  }
  
  if (endNodes.length > 0) {
    layers.push(endNodes)
    endNodes.forEach(n => n.layer = layers.length - 1)
  }
  
  return layers
}

// 计算节点位置
function calculatePositions(
  layers: GraphNode[][],
  options: LayoutOptions
): Array<FlowNode & { x: number; y: number }> {
  const { nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing, direction } = options
  const positionedNodes: Array<FlowNode & { x: number; y: number }> = []
  
  // 为每层分配位置
  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const layer = layers[layerIndex]
    const layerWidth = layer.length * nodeWidth + (layer.length - 1) * horizontalSpacing
    
    for (let nodeIndex = 0; nodeIndex < layer.length; nodeIndex++) {
      const node = layer[nodeIndex]
      let x: number, y: number
      
      switch (direction) {
        case 'TB': // Top to Bottom
          x = nodeIndex * (nodeWidth + horizontalSpacing) - layerWidth / 2
          y = layerIndex * (nodeHeight + verticalSpacing)
          break
        case 'BT': // Bottom to Top
          x = nodeIndex * (nodeWidth + horizontalSpacing) - layerWidth / 2
          y = (layers.length - 1 - layerIndex) * (nodeHeight + verticalSpacing)
          break
        case 'LR': // Left to Right
          x = layerIndex * (nodeWidth + horizontalSpacing)
          y = nodeIndex * (nodeHeight + verticalSpacing) - layerWidth / 2
          break
        case 'RL': // Right to Left
          x = (layers.length - 1 - layerIndex) * (nodeWidth + horizontalSpacing)
          y = nodeIndex * (nodeHeight + verticalSpacing) - layerWidth / 2
          break
        default:
          x = nodeIndex * (nodeWidth + horizontalSpacing)
          y = layerIndex * (nodeHeight + verticalSpacing)
      }
      
      positionedNodes.push({
        ...node.node,
        x: Math.round(x),
        y: Math.round(y)
      })
    }
  }
  
  // 优化位置 - 减少连线交叉
  return optimizePositions(positionedNodes, layers, options)
}

// 优化节点位置以减少连线交叉
function optimizePositions(
  nodes: Array<FlowNode & { x: number; y: number }>,
  layers: GraphNode[][],
  options: LayoutOptions
): Array<FlowNode & { x: number; y: number }> {
  // 简单的重心调整算法
  const iterations = 3
  
  for (let iter = 0; iter < iterations; iter++) {
    for (let layerIndex = 1; layerIndex < layers.length - 1; layerIndex++) {
      const layer = layers[layerIndex]
      
      for (const graphNode of layer) {
        const node = nodes.find(n => n.id === graphNode.id)
        if (!node) continue
        
        // 计算前驱和后继节点的重心
        const predecessors = graphNode.inEdges
        const successors = graphNode.outEdges
        
        let totalX = 0
        let count = 0
        
        // 前驱节点的影响
        for (const pred of predecessors) {
          const predNode = nodes.find(n => n.id === pred.id)
          if (predNode) {
            totalX += predNode.x
            count++
          }
        }
        
        // 后继节点的影响
        for (const succ of successors) {
          const succNode = nodes.find(n => n.id === succ.id)
          if (succNode) {
            totalX += succNode.x
            count++
          }
        }
        
        if (count > 0) {
          const targetX = totalX / count
          // 平滑移动到目标位置
          node.x = Math.round(node.x * 0.7 + targetX * 0.3)
        }
      }
    }
  }
  
  return nodes
}

// 计算布局边界
function calculateBounds(
  nodes: Array<FlowNode & { x: number; y: number }>,
  options: LayoutOptions
): LayoutResult['bounds'] {
  if (nodes.length === 0) {
    return { width: 0, height: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }
  
  const { nodeWidth, nodeHeight } = options
  
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  
  for (const node of nodes) {
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + nodeWidth)
    maxY = Math.max(maxY, node.y + nodeHeight)
  }
  
  // 添加边距
  const margin = 50
  minX -= margin
  minY -= margin
  maxX += margin
  maxY += margin
  
  return {
    width: maxX - minX,
    height: maxY - minY,
    minX,
    minY,
    maxX,
    maxY
  }
}

// 力导向布局算法（可选的高级布局）
export function forceDirectedLayout(
  nodes: FlowNode[],
  connections: Connection[],
  options: {
    iterations?: number
    repulsionStrength?: number
    attractionStrength?: number
    damping?: number
  } = {}
): Array<FlowNode & { x: number; y: number }> {
  const {
    iterations = 100,
    repulsionStrength = 1000,
    attractionStrength = 0.1,
    damping = 0.9
  } = options
  
  // 初始化节点位置和速度
  const particles = nodes.map((node, index) => ({
    ...node,
    x: Math.random() * 800,
    y: Math.random() * 600,
    vx: 0,
    vy: 0
  }))
  
  // 构建连接映射
  const connectionMap = new Map<string, string[]>()
  for (const connection of connections) {
    if (!connectionMap.has(connection.sourceNodeId)) {
      connectionMap.set(connection.sourceNodeId, [])
    }
    connectionMap.get(connection.sourceNodeId)!.push(connection.targetNodeId)
  }
  
  // 迭代计算
  for (let iter = 0; iter < iterations; iter++) {
    // 计算排斥力
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i]
        const p2 = particles[j]
        
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        const force = repulsionStrength / (distance * distance)
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        p1.vx += fx
        p1.vy += fy
        p2.vx -= fx
        p2.vy -= fy
      }
    }
    
    // 计算吸引力（连接的节点之间）
    for (const [sourceId, targetIds] of connectionMap) {
      const source = particles.find(p => p.id === sourceId)
      if (!source) continue
      
      for (const targetId of targetIds) {
        const target = particles.find(p => p.id === targetId)
        if (!target) continue
        
        const dx = target.x - source.x
        const dy = target.y - source.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        const force = attractionStrength * distance
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        source.vx += fx
        source.vy += fy
        target.vx -= fx
        target.vy -= fy
      }
    }
    
    // 更新位置
    for (const particle of particles) {
      particle.vx *= damping
      particle.vy *= damping
      particle.x += particle.vx
      particle.y += particle.vy
      
      // 边界约束
      particle.x = Math.max(50, Math.min(1950, particle.x))
      particle.y = Math.max(50, Math.min(1450, particle.y))
    }
  }
  
  return particles.map(p => ({
    ...p,
    x: Math.round(p.x),
    y: Math.round(p.y)
  }))
}

// 网格对齐布局
export function gridLayout(
  nodes: FlowNode[],
  options: {
    columns?: number
    cellWidth?: number
    cellHeight?: number
    padding?: number
  } = {}
): Array<FlowNode & { x: number; y: number }> {
  const {
    columns = Math.ceil(Math.sqrt(nodes.length)),
    cellWidth = 150,
    cellHeight = 100,
    padding = 20
  } = options
  
  return nodes.map((node, index) => {
    const row = Math.floor(index / columns)
    const col = index % columns
    
    return {
      ...node,
      x: col * cellWidth + padding,
      y: row * cellHeight + padding
    }
  })
}

// 圆形布局
export function circularLayout(
  nodes: FlowNode[],
  options: {
    radius?: number
    centerX?: number
    centerY?: number
  } = {}
): Array<FlowNode & { x: number; y: number }> {
  const {
    radius = Math.max(200, nodes.length * 30),
    centerX = 400,
    centerY = 300
  } = options
  
  return nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    
    return {
      ...node,
      x: Math.round(x),
      y: Math.round(y)
    }
  })
}
