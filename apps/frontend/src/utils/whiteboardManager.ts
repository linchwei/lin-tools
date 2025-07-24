interface DrawingOptions {
  tool: string;
  color: string;
  size: number;
}

interface Point {
  x: number;
  y: number;
}

interface DrawingOperation {
  id: string;
  type: "draw" | "erase" | "shape" | "text" | "clear";
  tool: string;
  color: string;
  size: number;
  points: Point[];
  timestamp: number;
  userId: string;
}

export class WhiteboardManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentPath: Point[] = [];
  private currentOptions: DrawingOptions | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.setupCanvas();
  }

  private setupCanvas() {
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.imageSmoothingEnabled = true;
  }

  startPath(point: Point, options: DrawingOptions) {
    this.currentPath = [point];
    this.currentOptions = options;

    this.ctx.globalCompositeOperation =
      options.tool === "eraser" ? "destination-out" : "source-over";
    this.ctx.strokeStyle = options.color;
    this.ctx.lineWidth = options.size;

    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);
  }

  addPointToPath(point: Point) {
    if (!this.currentOptions) return;

    this.currentPath.push(point);
    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();
  }

  endPath() {
    this.currentPath = [];
    this.currentOptions = null;
  }

  executeOperation(operation: DrawingOperation) {
    switch (operation.type) {
      case "draw":
        this.drawPath(operation.points, operation);
        break;
      case "clear":
        this.clear();
        break;
      case "shape":
        this.drawShape(operation);
        break;
      case "text":
        this.drawText(operation);
        break;
    }
  }

  private drawPath(points: Point[], options: DrawingOperation) {
    if (points.length < 2) return;

    this.ctx.save();
    this.ctx.globalCompositeOperation =
      options.tool === "eraser" ? "destination-out" : "source-over";
    this.ctx.strokeStyle = options.color;
    this.ctx.lineWidth = options.size;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawShape(operation: DrawingOperation) {
    if (operation.points.length < 2) return;

    const [start, end] = operation.points;
    this.ctx.save();
    this.ctx.strokeStyle = operation.color;
    this.ctx.lineWidth = operation.size;

    this.ctx.beginPath();

    switch (operation.tool) {
      case "line":
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        break;
      case "rectangle":
        this.ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;
      case "circle":
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        this.ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        break;
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawText(operation: DrawingOperation) {
    // TODO: 实现文字绘制
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // 平滑绘制优化
  private smoothPath(points: Point[]): Point[] {
    if (points.length < 3) return points;

    const smoothed: Point[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      // 使用二次贝塞尔曲线平滑
      const smoothed1 = {
        x: (prev.x + curr.x) / 2,
        y: (prev.y + curr.y) / 2,
      };
      const smoothed2 = {
        x: (curr.x + next.x) / 2,
        y: (curr.y + next.y) / 2,
      };

      smoothed.push(smoothed1, curr, smoothed2);
    }

    smoothed.push(points[points.length - 1]);
    return smoothed;
  }
}
