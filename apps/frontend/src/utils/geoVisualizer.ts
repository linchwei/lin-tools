import * as d3 from "d3";
import type { GeoPoint, GeoConfig, WorldMapData } from "@/types/geo";

// 重新导出类型以保持向后兼容
export type { GeoPoint, GeoConfig, WorldMapData } from "@/types/geo";

export class GeoVisualizer {
  private container: d3.Selection<HTMLElement, unknown, null, undefined>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private mapGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private projection: d3.GeoProjection;
  private path: d3.GeoPath;
  private config: GeoConfig;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;

  constructor(element: HTMLElement, config: GeoConfig) {
    this.container = d3.select(element);
    this.config = {
      showGraticule: true,
      enableZoom: true,
      ...config,
    };

    this.setupProjection();
    this.initSVG();
    this.setupZoom();
  }

  private setupProjection() {
    this.projection =
      this.config.projection ||
      d3
        .geoNaturalEarth1()
        .scale(150)
        .translate([this.config.width / 2, this.config.height / 2]);

    this.path = d3.geoPath().projection(this.projection);
  }

  private initSVG() {
    this.container.selectAll("*").remove();

    this.svg = this.container
      .append("svg")
      .attr("width", this.config.width)
      .attr("height", this.config.height)
      .style("background", "transparent");

    // 创建地图组
    this.mapGroup = this.svg.append("g").attr("class", "map-group");

    // 添加背景
    this.mapGroup
      .append("rect")
      .attr("class", "background")
      .attr("width", this.config.width)
      .attr("height", this.config.height)
      .style("fill", "transparent")
      .style("pointer-events", "all");

    this.setupDefs();
  }

  private setupDefs() {
    const defs = this.svg.append("defs");

    // 发光效果
    const glowFilter = defs
      .append("filter")
      .attr("id", "geo-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    glowFilter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "coloredBlur");

    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // 连接线渐变
    const connectionGradient = defs
      .append("linearGradient")
      .attr("id", "connection-gradient")
      .attr("gradientUnits", "userSpaceOnUse");

    connectionGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#4facfe")
      .attr("stop-opacity", 0.8);

    connectionGradient
      .append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#00f2fe")
      .attr("stop-opacity", 1);

    connectionGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#4facfe")
      .attr("stop-opacity", 0.8);
  }

  private setupZoom() {
    if (!this.config.enableZoom) return;

    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        this.mapGroup.attr("transform", event.transform);
      });

    this.svg.call(this.zoom);
  }

  // 渲染世界地图
  renderWorldMap(
    worldData: any,
    options: {
      countryFill?: string;
      countryStroke?: string;
      strokeWidth?: number;
    } = {}
  ) {
    const {
      countryFill = "#2a2a2a",
      countryStroke = "#4facfe",
      strokeWidth = 0.5,
    } = options;

    // 添加经纬网
    if (this.config.showGraticule) {
      const graticule = d3.geoGraticule();
      this.mapGroup
        .append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", this.path)
        .style("fill", "none")
        .style("stroke", "#333")
        .style("stroke-width", 0.5)
        .style("opacity", 0.3);
    }

    // 渲染国家
    this.mapGroup
      .selectAll(".country")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", this.path)
      .style("fill", countryFill)
      .style("stroke", countryStroke)
      .style("stroke-width", strokeWidth)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 2)
      .style("opacity", 1)
      .on("end", function () {
        d3.select(this)
          .on("mouseover", function () {
            d3.select(this).style("fill", "#4facfe").style("opacity", 0.8);
          })
          .on("mouseout", function () {
            d3.select(this).style("fill", countryFill).style("opacity", 1);
          });
      });
  }

  // 渲染热力图点
  renderHeatmapPoints(
    points: GeoPoint[],
    options: {
      maxRadius?: number;
      colorScale?: d3.ScaleSequential<string>;
    } = {}
  ) {
    const {
      maxRadius = 20,
      colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 100]),
    } = options;

    const pointsGroup = this.mapGroup
      .append("g")
      .attr("class", "heatmap-points");

    points.forEach((point, index) => {
      const [x, y] = this.projection([point.lng, point.lat])!;

      // 创建径向渐变
      const gradientId = `heatmap-point-${index}`;
      const gradient = this.svg
        .select("defs")
        .append("radialGradient")
        .attr("id", gradientId);

      const color = d3.color(colorScale(point.value))!;

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color.toString())
        .attr("stop-opacity", 0.8);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color.toString())
        .attr("stop-opacity", 0);

      // 创建热力点
      pointsGroup
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 0)
        .style("fill", `url(#${gradientId})`)
        .style("pointer-events", "none")
        .transition()
        .duration(1000)
        .delay(index * 100)
        .attr("r", maxRadius * (point.value / 100));
    });
  }

  // 渲染城市点
  renderCityPoints(
    cities: GeoPoint[],
    options: {
      radius?: number;
      color?: string;
      showLabels?: boolean;
    } = {}
  ) {
    const { radius = 4, color = "#00f2fe", showLabels = true } = options;

    const citiesGroup = this.mapGroup.append("g").attr("class", "cities");

    cities.forEach((city, index) => {
      const [x, y] = this.projection([city.lng, city.lat])!;

      const cityGroup = citiesGroup
        .append("g")
        .attr("class", "city")
        .attr("transform", `translate(${x},${y})`);

      // 城市点
      cityGroup
        .append("circle")
        .attr("r", 0)
        .style("fill", color)
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .style("filter", "url(#geo-glow)")
        .transition()
        .duration(500)
        .delay(index * 50)
        .attr("r", radius);

      // 脉冲效果
      this.createCityPulse(cityGroup, radius * 2, color);

      // 标签
      if (showLabels && city.name) {
        cityGroup
          .append("text")
          .attr("dy", -radius - 5)
          .attr("text-anchor", "middle")
          .style("fill", "#fff")
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
          .style("opacity", 0)
          .text(city.name)
          .transition()
          .duration(500)
          .delay(index * 50 + 300)
          .style("opacity", 1);
      }
    });
  }

  private createCityPulse(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    maxRadius: number,
    color: string
  ) {
    const createPulse = () => {
      const pulse = group
        .append("circle")
        .attr("r", 0)
        .style("fill", "none")
        .style("stroke", color)
        .style("stroke-width", 2)
        .style("opacity", 0.8);

      pulse
        .transition()
        .duration(2000)
        .ease(d3.easeCircleOut)
        .attr("r", maxRadius)
        .style("opacity", 0)
        .remove();
    };

    // 每2秒创建一个脉冲
    const interval = setInterval(createPulse, 2000);
    (group.node() as any).__interval = interval;

    // 立即创建第一个脉冲
    setTimeout(createPulse, Math.random() * 2000);
  }

  // 渲染连接线
  renderConnections(
    connections: Array<{ source: GeoPoint; target: GeoPoint; value: number }>,
    options: {
      strokeWidth?: number;
      animated?: boolean;
    } = {}
  ) {
    const { strokeWidth = 2, animated = true } = options;

    const connectionsGroup = this.mapGroup
      .append("g")
      .attr("class", "connections");

    connections.forEach((connection, index) => {
      const sourceCoords = this.projection([
        connection.source.lng,
        connection.source.lat,
      ])!;
      const targetCoords = this.projection([
        connection.target.lng,
        connection.target.lat,
      ])!;

      // 创建弧形路径
      const midPoint = [
        (sourceCoords[0] + targetCoords[0]) / 2,
        (sourceCoords[1] + targetCoords[1]) / 2 - 50,
      ];

      const pathData = d3.line().curve(d3.curveBasis)([
        sourceCoords,
        midPoint,
        targetCoords,
      ]);

      const path = connectionsGroup
        .append("path")
        .attr("d", pathData!)
        .style("fill", "none")
        .style("stroke", "url(#connection-gradient)")
        .style("stroke-width", strokeWidth * (connection.value / 100))
        .style("opacity", 0.6)
        .style("filter", "url(#geo-glow)");

      if (animated) {
        // 路径动画
        const totalLength = (path.node() as SVGPathElement).getTotalLength();
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(2000)
          .delay(index * 200)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);

        // 添加流动粒子
        setTimeout(() => {
          this.createFlowingParticle(
            connectionsGroup,
            pathData!,
            connection.value
          );
        }, index * 200 + 2000);
      }
    });
  }

  private createFlowingParticle(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    pathData: string,
    value: number
  ) {
    const particle = group
      .append("circle")
      .attr("r", 3)
      .style("fill", "#00f2fe")
      .style("filter", "url(#geo-glow)");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    const pathLength = path.getTotalLength();

    const animate = () => {
      particle
        .transition()
        .duration(3000)
        .ease(d3.easeLinear)
        .attrTween("transform", () => {
          return (t: number) => {
            const point = path.getPointAtLength(t * pathLength);
            return `translate(${point.x},${point.y})`;
          };
        })
        .on("end", () => {
          setTimeout(animate, Math.random() * 2000 + 1000);
        });
    };

    animate();
  }

  // 重置缩放
  resetZoom() {
    if (this.zoom) {
      this.svg
        .transition()
        .duration(750)
        .call(this.zoom.transform, d3.zoomIdentity);
    }
  }

  // 缩放到指定区域
  zoomToFeature(feature: any) {
    const bounds = this.path.bounds(feature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.min(
      8,
      0.9 / Math.max(dx / this.config.width, dy / this.config.height)
    );
    const translate = [
      this.config.width / 2 - scale * x,
      this.config.height / 2 - scale * y,
    ];

    if (this.zoom) {
      this.svg
        .transition()
        .duration(750)
        .call(
          this.zoom.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    }
  }

  // 清理
  cleanup() {
    this.mapGroup.selectAll("g").each(function () {
      const interval = (this as any).__interval;
      if (interval) {
        clearInterval(interval);
      }
    });
  }

  // 调整大小
  resize(width: number, height: number) {
    this.config.width = width;
    this.config.height = height;
    this.projection.translate([width / 2, height / 2]);
    this.svg.attr("width", width).attr("height", height);
    this.mapGroup
      .select(".background")
      .attr("width", width)
      .attr("height", height);
  }

  // 清除
  clear() {
    this.cleanup();
    this.mapGroup.selectAll("*").remove();
  }
}
