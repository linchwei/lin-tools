interface SandboxOptions {
  timeout?: number;
  imports?: Record<string, any>;
}

interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  logs: string[];
  executionTime: number;
}

export class CodeSandbox {
  private worker: Worker | null = null;
  private executionId = 0;
  private pendingExecutions = new Map<number, {
    resolve: (result: ExecutionResult) => void;
    reject: (error: Error) => void;
  }>();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    this.worker = new Worker(
      new URL('../workers/codeExecutor.worker.ts', import.meta.url),
      { type: 'module' }
    );

    this.worker.onmessage = (e: MessageEvent<ExecutionResult & { id?: number }>) => {
      const { id, ...result } = e.data;
      if (id !== undefined) {
        const pending = this.pendingExecutions.get(id);
        if (pending) {
          pending.resolve(result);
          this.pendingExecutions.delete(id);
        }
      }
    };

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
      // 拒绝所有待处理的执行
      this.pendingExecutions.forEach(({ reject }) => {
        reject(new Error('Worker error'));
      });
      this.pendingExecutions.clear();
    };
  }

  async executeJavaScript(code: string, options: SandboxOptions = {}): Promise<ExecutionResult> {
    return this.execute(code, 'javascript', options);
  }

  async executeTypeScript(code: string, options: SandboxOptions = {}): Promise<ExecutionResult> {
    return this.execute(code, 'typescript', options);
  }

  private async execute(
    code: string, 
    language: 'javascript' | 'typescript', 
    options: SandboxOptions
  ): Promise<ExecutionResult> {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    const id = ++this.executionId;
    
    return new Promise((resolve, reject) => {
      this.pendingExecutions.set(id, { resolve, reject });
      
      this.worker!.postMessage({
        id,
        code,
        language,
        timeout: options.timeout || 5000,
        imports: options.imports || {}
      });

      // 超时保护
      setTimeout(() => {
        if (this.pendingExecutions.has(id)) {
          this.pendingExecutions.delete(id);
          reject(new Error('Execution timeout'));
        }
      }, (options.timeout || 5000) + 1000);
    });
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingExecutions.clear();
  }
}

// 单例实例
export const codeSandbox = new CodeSandbox();