import * as d3 from 'd3'

export interface ParticleConfig {
  count: number
  speed: number
  size: number
  color: string
  opacity: number
  trail: boolean
}

export interface FlowConfig {
  pathData: string
  particleCount: number
  speed: number
  particleSize: number
  colors: string[]
  duration: number
}

export interface PulseConfig {
  center: [number, number]
  maxRadius: number
  duration: number
  color: string
  opacity: number
  strokeWidth: number
}

export interface GeoVisualizationConfig {
  width: number
  height: number
  projection: d3.GeoProjection
  colors: string[]
  heatmapData?: Array<{ lat: number; lng: number; value: number }>
}

export class AdvancedVisualizer {
  private container: d3.Selection<HTMLElement, unknown, null, undefined>
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  private defs: d3.Selection<SVGDefsElement, unknown, null, undefined>
  private width: number
  private height: number
  private animationFrameId: number | null = null

  constructor(element: HTMLElement, width: number, height: number) {
    this.container = d3.select(element)
    this.width = width
    this.height = height
    this.initSVG()
  }

  private initSVG() {
    this.container.selectAll('*').remove()
    
    this.svg = this.container
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background', 'transparent')
      .style('overflow', 'visible')

    this.defs = this.svg.append('defs')
    this.setupGradients()
    this.setupFilters()
  }

  private setupGradients() {
    // 流动效果渐变
    const flowGradient = this.defs.append('linearGradient')
      .attr('id', 'flow-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')

    flowGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4facfe')
      .attr('stop-opacity', 0)

    flowGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#00f2fe')
      .attr('stop-opacity', 1)

    flowGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4facfe')
      .attr('stop-opacity', 0)

    // 脉冲渐变
    const pulseGradient = this.defs.append('radialGradient')
      .attr('id', 'pulse-gradient')

    pulseGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00f2fe')
      .attr('stop-opacity', 0.8)

    pulseGradient.append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#4facfe')
      .attr('stop-opacity', 0.3)

    pulseGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4facfe')
      .attr('stop-opacity', 0)
  }

  private setupFilters() {
    // 发光效果滤镜
    const glowFilter = this.defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur')

    const feMerge = glowFilter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // 模糊效果滤镜
    this.defs.append('filter')
      .attr('id', 'blur')
      .append('feGaussianBlur')
      .attr('stdDeviation', '2')
  }

  // 创建粒子流动效果
  createParticleFlow(config: FlowConfig): void {
    const { pathData, particleCount, speed, particleSize, colors, duration } = config
    
    const flowGroup = this.svg.append('g').attr('class', 'particle-flow')
    
    // 创建路径
    const path = flowGroup.append('path')
      .attr('d', pathData)
      .style('fill', 'none')
      .style('stroke', 'url(#flow-gradient)')
      .style('stroke-width', 2)
      .style('filter', 'url(#glow)')

    const pathNode = path.node() as SVGPathElement
    const pathLength = pathNode.getTotalLength()

    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
      const particle = flowGroup.append('circle')
        .attr('class', 'particle')
        .attr('r', particleSize)
        .style('fill', colors[i % colors.length])
        .style('filter', 'url(#glow)')
        .style('opacity', 0.8)

      this.animateParticle(particle, pathNode, pathLength, speed, duration, i * (duration / particleCount))
    }
  }

  private animateParticle(
    particle: d3.Selection<SVGCircleElement, unknown, null, undefined>,
    path: SVGPathElement,
    pathLength: number,
    speed: number,
    duration: number,
    delay: number
  ) {
    const animate = () => {
      particle
        .style('opacity', 0)
        .transition()
        .delay(delay)
        .duration(100)
        .style('opacity', 0.8)
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .attrTween('transform', () => {
          return (t: number) => {
            const point = path.getPointAtLength(t * pathLength)
            return `translate(${point.x},${point.y})`
          }
        })
        .transition()
        .duration(100)
        .style('opacity', 0)
        .on('end', animate)
    }

    animate()
  }

  // 创建脉冲动画
  createPulseAnimation(config: PulseConfig): void {
    const { center, maxRadius, duration, color, opacity, strokeWidth } = config
    
    const pulseGroup = this.svg.append('g')
      .attr('class', 'pulse-animation')
      .attr('transform', `translate(${center[0]},${center[1]})`)

    const createPulse = () => {
      const pulse = pulseGroup.append('circle')
        .attr('r', 0)
        .style('fill', 'none')
        .style('stroke', color)
        .style('stroke-width', strokeWidth)
        .style('opacity', opacity)
        .style('filter', 'url(#glow)')

      pulse
        .transition()
        .duration(duration)
        .ease(d3.easeCircleOut)
        .attr('r', maxRadius)
        .style('opacity', 0)
        .remove()
    }

    // 持续创建脉冲
    const interval = setInterval(createPulse, duration / 3)
    
    // 立即创建第一个脉冲
    createPulse()

    // 存储定时器以便清理
    ;(pulseGroup.node() as any).__interval = interval
  }

  // 创建数据流动画
  createDataFlow(startPoint: [number, number], endPoint: [number, number], data: any[]): void {
    const flowGroup = this.svg.append('g').attr('class', 'data-flow')
    
    // 创建连接线
    const line = d3.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveBasis)

    const pathData = line([startPoint, 
      [(startPoint[0] + endPoint[0]) / 2, startPoint[1] - 50],
      endPoint
    ])

    const path = flowGroup.append('path')
      .attr('d', pathData!)
      .style('fill', 'none')
      .style('stroke', '#4facfe')
      .style('stroke-width', 1)
      .style('opacity', 0.3)

    // 创建数据包动画
    data.forEach((item, index) => {
      setTimeout(() => {
        this.createDataPacket(flowGroup, pathData!, item, 2000)
      }, index * 500)
    })
  }

  private createDataPacket(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    pathData: string,
    data: any,
    duration: number
  ) {
    const packet = group.append('g').attr('class', 'data-packet')
    
    // 数据包圆圈
    const circle = packet.append('circle')
      .attr('r', 6)
      .style('fill', '#00f2fe')
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('filter', 'url(#glow)')

    // 数据标签
    const label = packet.append('text')
      .attr('dy', -10)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text(data.value || data.name || 'Data')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', pathData)
    const pathLength = path.getTotalLength()

    packet
      .transition()
      .duration(duration)
      .ease(d3.easeLinear)
      .attrTween('transform', () => {
        return (t: number) => {
          const point = path.getPointAtLength(t * pathLength)
          return `translate(${point.x},${point.y})`
        }
      })
      .on('end', () => {
        packet.remove()
      })
  }

  // 创建热力图
  createHeatmap(data: Array<{ x: number; y: number; value: number }>, config: {
    colorScale: d3.ScaleSequential<string>
    radius: number
  }): void {
    const { colorScale, radius } = config
    
    const heatmapGroup = this.svg.append('g').attr('class', 'heatmap')
    
    // 创建径向渐变用于热力点
    data.forEach((point, index) => {
      const gradientId = `heatmap-gradient-${index}`
      const gradient = this.defs.append('radialGradient')
        .attr('id', gradientId)

      const color = d3.color(colorScale(point.value))!
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color.toString())
        .attr('stop-opacity', 0.8)

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color.toString())
        .attr('stop-opacity', 0)

      heatmapGroup.append('circle')
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 0)
        .style('fill', `url(#${gradientId})`)
        .transition()
        .duration(1000)
        .delay(index * 50)
        .attr('r', radius * (point.value / 100))
    })
  }

  // 清理动画
  cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    // 清理定时器
    this.svg.selectAll('g').each(function() {
      const interval = (this as any).__interval
      if (interval) {
        clearInterval(interval)
      }
    })

    this.svg.selectAll('*').interrupt()
  }

  // 调整大小
  resize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.svg
      .attr('width', width)
      .attr('height', height)
  }

  // 清除所有内容
  clear(): void {
    this.cleanup()
    this.svg.selectAll('g').remove()
  }
}
