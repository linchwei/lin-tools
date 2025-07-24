import * as d3 from 'd3'

export interface ChartData {
  name: string
  value: number
  timestamp?: number
  category?: string
  [key: string]: any
}

export interface ChartConfig {
  width: number
  height: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colors?: string[]
  duration?: number
}

export class D3Visualizer {
  private container: d3.Selection<HTMLElement, unknown, null, undefined>
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  private config: Required<ChartConfig>

  constructor(element: HTMLElement, config: ChartConfig) {
    this.container = d3.select(element)
    this.config = {
      margin: { top: 20, right: 20, bottom: 30, left: 40 },
      colors: d3.schemeCategory10,
      duration: 750,
      ...config
    }
    
    this.initSVG()
  }

  private initSVG() {
    this.container.selectAll('*').remove()
    
    this.svg = this.container
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .style('background', 'transparent')
  }

  // 实时折线图
  renderLineChart(data: ChartData[], options: {
    xKey: string
    yKey: string
    maxPoints?: number
  }) {
    const { margin, width, height, duration } = this.config
    const { xKey, yKey, maxPoints = 50 } = options
    
    // 限制数据点数量
    const limitedData = data.slice(-maxPoints)
    
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // 清除之前的内容
    this.svg.selectAll('.line-chart').remove()
    
    const g = this.svg.append('g')
      .attr('class', 'line-chart')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 比例尺
    const xScale = d3.scaleTime()
      .domain(d3.extent(limitedData, d => new Date(d[xKey])) as [Date, Date])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(limitedData, d => d[yKey]) as [number, number])
      .nice()
      .range([innerHeight, 0])

    // 线条生成器
    const line = d3.line<ChartData>()
      .x(d => xScale(new Date(d[xKey])))
      .y(d => yScale(d[yKey]))
      .curve(d3.curveMonotoneX)

    // 渐变定义
    const gradient = this.svg.append('defs')
      .append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', innerHeight)
      .attr('x2', 0).attr('y2', 0)

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4facfe')
      .attr('stop-opacity', 0.1)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00f2fe')
      .attr('stop-opacity', 0.8)

    // 区域生成器
    const area = d3.area<ChartData>()
      .x(d => xScale(new Date(d[xKey])))
      .y0(innerHeight)
      .y1(d => yScale(d[yKey]))
      .curve(d3.curveMonotoneX)

    // 绘制区域
    g.append('path')
      .datum(limitedData)
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', 'url(#line-gradient)')

    // 绘制线条
    const path = g.append('path')
      .datum(limitedData)
      .attr('class', 'line')
      .attr('d', line)
      .style('fill', 'none')
      .style('stroke', '#00f2fe')
      .style('stroke-width', 2)

    // 线条动画
    const totalLength = path.node()!.getTotalLength()
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(duration)
      .attr('stroke-dashoffset', 0)

    // 数据点
    g.selectAll('.dot')
      .data(limitedData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(new Date(d[xKey])))
      .attr('cy', d => yScale(d[yKey]))
      .attr('r', 0)
      .style('fill', '#00f2fe')
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .transition()
      .delay((d, i) => i * 50)
      .duration(300)
      .attr('r', 4)

    // 坐标轴
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%H:%M')))
      .style('color', '#8892b0')

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .style('color', '#8892b0')
  }

  // 实时柱状图
  renderBarChart(data: ChartData[], options: {
    xKey: string
    yKey: string
  }) {
    const { margin, width, height, duration, colors } = this.config
    const { xKey, yKey } = options
    
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    this.svg.selectAll('.bar-chart').remove()
    
    const g = this.svg.append('g')
      .attr('class', 'bar-chart')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 比例尺
    const xScale = d3.scaleBand()
      .domain(data.map(d => d[xKey]))
      .range([0, innerWidth])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[yKey]) as number])
      .nice()
      .range([innerHeight, 0])

    const colorScale = d3.scaleOrdinal(colors)

    // 柱状图
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d[xKey])!)
      .attr('width', xScale.bandwidth())
      .attr('y', innerHeight)
      .attr('height', 0)
      .style('fill', (d, i) => colorScale(i.toString()))
      .style('rx', 4)
      .transition()
      .duration(duration)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(d[yKey]))
      .attr('height', d => innerHeight - yScale(d[yKey]))

    // 数值标签
    g.selectAll('.label')
      .data(data)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d[xKey])! + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d[yKey]) - 5)
      .attr('text-anchor', 'middle')
      .style('fill', '#8892b0')
      .style('font-size', '12px')
      .style('opacity', 0)
      .text(d => d[yKey])
      .transition()
      .duration(duration)
      .delay((d, i) => i * 100 + 300)
      .style('opacity', 1)

    // 坐标轴
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('color', '#8892b0')

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .style('color', '#8892b0')
  }

  // 饼图
  renderPieChart(data: ChartData[], options: {
    valueKey: string
    labelKey: string
  }) {
    const { width, height, duration, colors } = this.config
    const { valueKey, labelKey } = options
    
    const radius = Math.min(width, height) / 2 - 40

    this.svg.selectAll('.pie-chart').remove()
    
    const g = this.svg.append('g')
      .attr('class', 'pie-chart')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    const pie = d3.pie<ChartData>()
      .value(d => d[valueKey])
      .sort(null)

    const arc = d3.arc<d3.PieArcDatum<ChartData>>()
      .innerRadius(radius * 0.4)
      .outerRadius(radius)

    const outerArc = d3.arc<d3.PieArcDatum<ChartData>>()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1)

    const colorScale = d3.scaleOrdinal(colors)

    // 饼图扇形
    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc')

    arcs.append('path')
      .attr('d', arc)
      .style('fill', (d, i) => colorScale(i.toString()))
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .each(function(d) { (this as any)._current = { startAngle: 0, endAngle: 0 } })
      .transition()
      .duration(duration)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate((this as any)._current, d)
        return (t: number) => {
          (this as any)._current = interpolate(t)
          return arc(interpolate(t))!
        }
      })

    // 标签线
    arcs.append('polyline')
      .style('opacity', 0)
      .style('stroke', '#8892b0')
      .style('stroke-width', 1)
      .style('fill', 'none')
      .transition()
      .delay(duration)
      .duration(300)
      .style('opacity', 1)
      .attr('points', d => {
        const pos = outerArc.centroid(d)
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1)
        return [arc.centroid(d), outerArc.centroid(d), pos].join(',')
      })

    // 标签文本
    arcs.append('text')
      .style('opacity', 0)
      .attr('dy', '.35em')
      .style('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
      .style('fill', '#8892b0')
      .style('font-size', '12px')
      .transition()
      .delay(duration)
      .duration(300)
      .style('opacity', 1)
      .attr('transform', d => {
        const pos = outerArc.centroid(d)
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1)
        return `translate(${pos})`
      })
      .text(d => `${d.data[labelKey]}: ${d.data[valueKey]}`)

    function midAngle(d: d3.PieArcDatum<ChartData>) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2
    }
  }

  // 仪表盘
  renderGauge(value: number, options: {
    min?: number
    max?: number
    title?: string
    unit?: string
  }) {
    const { width, height, colors } = this.config
    const { min = 0, max = 100, title = '', unit = '' } = options
    
    const radius = Math.min(width, height) / 2 - 40
    const range = max - min
    const ratio = (value - min) / range

    this.svg.selectAll('.gauge').remove()
    
    const g = this.svg.append('g')
      .attr('class', 'gauge')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // 背景弧
    const backgroundArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)

    g.append('path')
      .attr('d', backgroundArc)
      .style('fill', '#e6e6e6')

    // 值弧
    const valueArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(-Math.PI / 2 + Math.PI * ratio)

    g.append('path')
      .attr('d', valueArc)
      .style('fill', colors[0])
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1)

    // 中心文本
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', colors[0])
      .text(value + unit)

    if (title) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.5em')
        .style('font-size', '14px')
        .style('fill', '#8892b0')
        .text(title)
    }
  }

  // 更新尺寸
  resize(width: number, height: number) {
    this.config.width = width
    this.config.height = height
    this.svg
      .attr('width', width)
      .attr('height', height)
  }

  // 清除
  clear() {
    this.svg.selectAll('*').remove()
  }
}