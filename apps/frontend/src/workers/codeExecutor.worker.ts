// 代码执行沙箱Worker
interface ExecutionContext {
  code: string;
  language: 'javascript' | 'typescript';
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

// 创建安全的执行环境
function createSafeContext(imports: Record<string, any> = {}) {
  const logs: string[] = [];
  
  // 安全的console实现
  const safeConsole = {
    log: (...args: any[]) => logs.push(`LOG: ${args.map(String).join(' ')}`),
    error: (...args: any[]) => logs.push(`ERROR: ${args.map(String).join(' ')}`),
    warn: (...args: any[]) => logs.push(`WARN: ${args.map(String).join(' ')}`),
    info: (...args: any[]) => logs.push(`INFO: ${args.map(String).join(' ')}`),
  };

  // 安全的全局对象
  const safeGlobals = {
    console: safeConsole,
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Promise,
    setTimeout: (fn: Function, delay: number) => {
      if (delay > 5000) throw new Error('Timeout too long (max 5s)');
      return setTimeout(fn, delay);
    },
    setInterval: (fn: Function, delay: number) => {
      if (delay < 100) throw new Error('Interval too short (min 100ms)');
      return setInterval(fn, delay);
    },
    ...imports
  };

  return { safeGlobals, logs };
}

// TypeScript转JavaScript (简单实现)
function transpileTypeScript(code: string): string {
  // 移除类型注解的简单正则替换
  return code
    .replace(/:\s*\w+(\[\])?/g, '') // 移除类型注解
    .replace(/interface\s+\w+\s*{[^}]*}/g, '') // 移除interface
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // 移除type别名
    .replace(/as\s+\w+/g, '') // 移除as断言
    .replace(/<\w+>/g, ''); // 移除泛型
}

// 执行代码
async function executeCode(context: ExecutionContext): Promise<ExecutionResult> {
  const startTime = performance.now();
  const { safeGlobals, logs } = createSafeContext(context.imports);
  
  try {
    let codeToExecute = context.code;
    
    // TypeScript转换
    if (context.language === 'typescript') {
      codeToExecute = transpileTypeScript(codeToExecute);
    }
    
    // 创建函数包装器，限制访问全局对象
    const wrappedCode = `
      "use strict";
      const window = undefined;
      const document = undefined;
      const global = undefined;
      const process = undefined;
      const require = undefined;
      const module = undefined;
      const exports = undefined;
      
      ${Object.keys(safeGlobals).map(key => `const ${key} = arguments[0].${key};`).join('\n')}
      
      return (async function() {
        ${codeToExecute}
      })();
    `;
    
    // 创建函数并执行
    const func = new Function(wrappedCode);
    const result = await Promise.race([
      func(safeGlobals),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Execution timeout')), context.timeout || 5000)
      )
    ]);
    
    const executionTime = performance.now() - startTime;
    
    return {
      success: true,
      result,
      logs,
      executionTime
    };
    
  } catch (error) {
    const executionTime = performance.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      logs,
      executionTime
    };
  }
}

// Worker消息处理
self.onmessage = async (e: MessageEvent<ExecutionContext>) => {
  try {
    const result = await executeCode(e.data);
    self.postMessage(result);
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      logs: [],
      executionTime: 0
    });
  }
};