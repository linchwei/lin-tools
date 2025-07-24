// 可视化编排引擎示例流程

import type { FlowNode, Connection } from './nodeTypes'

export interface ExampleFlow {
  id: string
  name: string
  description: string
  nodes: FlowNode[]
  connections: Connection[]
  category: string
}

// 示例流程集合
export const exampleFlows: ExampleFlow[] = [
  {
    id: 'simple-data-processing',
    name: '简单数据处理',
    description: '演示基本的数据输入、转换和输出流程',
    category: 'basic',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        name: '开始',
        description: '流程开始',
        x: 100,
        y: 100,
        config: {
          message: '开始数据处理流程'
        }
      },
      {
        id: 'variable-1',
        type: 'variable',
        name: '输入数据',
        description: '定义输入数据',
        x: 300,
        y: 100,
        config: {
          name: 'inputData',
          type: 'object',
          defaultValue: '{"name": "张三", "age": 25, "score": 85}'
        }
      },
      {
        id: 'transform-1',
        type: 'transform',
        name: '数据转换',
        description: '解析JSON数据',
        x: 500,
        y: 100,
        config: {
          transformType: 'parseJSON'
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        name: '年龄判断',
        description: '判断是否成年',
        x: 700,
        y: 100,
        config: {
          condition: 'input.age >= 18',
          operator: '>='
        }
      },
      {
        id: 'log-1',
        type: 'log',
        name: '成年日志',
        description: '记录成年用户',
        x: 900,
        y: 50,
        config: {
          level: 'info',
          prefix: '[成年用户]'
        }
      },
      {
        id: 'log-2',
        type: 'log',
        name: '未成年日志',
        description: '记录未成年用户',
        x: 900,
        y: 150,
        config: {
          level: 'warn',
          prefix: '[未成年用户]'
        }
      },
      {
        id: 'end-1',
        type: 'end',
        name: '结束',
        description: '流程结束',
        x: 1100,
        y: 100,
        config: {
          message: '数据处理完成'
        }
      }
    ],
    connections: [
      {
        id: 'conn-1',
        sourceNodeId: 'start-1',
        sourcePortId: 'output',
        targetNodeId: 'variable-1',
        targetPortId: 'value',
        type: 'data'
      },
      {
        id: 'conn-2',
        sourceNodeId: 'variable-1',
        sourcePortId: 'output',
        targetNodeId: 'transform-1',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-3',
        sourceNodeId: 'transform-1',
        sourcePortId: 'output',
        targetNodeId: 'condition-1',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-4',
        sourceNodeId: 'condition-1',
        sourcePortId: 'true',
        targetNodeId: 'log-1',
        targetPortId: 'message',
        type: 'control'
      },
      {
        id: 'conn-5',
        sourceNodeId: 'condition-1',
        sourcePortId: 'false',
        targetNodeId: 'log-2',
        targetPortId: 'message',
        type: 'control'
      },
      {
        id: 'conn-6',
        sourceNodeId: 'log-1',
        sourcePortId: 'output',
        targetNodeId: 'end-1',
        targetPortId: 'input',
        type: 'control'
      },
      {
        id: 'conn-7',
        sourceNodeId: 'log-2',
        sourcePortId: 'output',
        targetNodeId: 'end-1',
        targetPortId: 'input',
        type: 'control'
      }
    ]
  },
  {
    id: 'http-api-workflow',
    name: 'HTTP API 工作流',
    description: '演示HTTP请求、错误处理和数据转换',
    category: 'async',
    nodes: [
      {
        id: 'start-2',
        type: 'start',
        name: '开始',
        description: '开始API调用流程',
        x: 100,
        y: 200,
        config: {
          message: '开始API调用'
        }
      },
      {
        id: 'variable-2',
        type: 'variable',
        name: 'API URL',
        description: '定义API地址',
        x: 300,
        y: 200,
        config: {
          name: 'apiUrl',
          type: 'string',
          defaultValue: 'https://jsonplaceholder.typicode.com/users/1'
        }
      },
      {
        id: 'http-1',
        type: 'http',
        name: 'HTTP请求',
        description: '发送GET请求',
        x: 500,
        y: 200,
        config: {
          method: 'GET',
          headers: '{"Content-Type": "application/json"}',
          timeout: 5000
        }
      },
      {
        id: 'transform-2',
        type: 'transform',
        name: '提取用户名',
        description: '提取用户名字段',
        x: 700,
        y: 150,
        config: {
          transformType: 'custom',
          customCode: 'return { username: input.username, name: input.name };'
        }
      },
      {
        id: 'log-3',
        type: 'log',
        name: '成功日志',
        description: '记录成功结果',
        x: 900,
        y: 150,
        config: {
          level: 'info',
          prefix: '[API成功]'
        }
      },
      {
        id: 'log-4',
        type: 'log',
        name: '错误日志',
        description: '记录错误信息',
        x: 700,
        y: 250,
        config: {
          level: 'error',
          prefix: '[API错误]'
        }
      },
      {
        id: 'end-2',
        type: 'end',
        name: '结束',
        description: '流程结束',
        x: 1100,
        y: 200,
        config: {
          message: 'API调用完成'
        }
      }
    ],
    connections: [
      {
        id: 'conn-8',
        sourceNodeId: 'start-2',
        sourcePortId: 'output',
        targetNodeId: 'variable-2',
        targetPortId: 'value',
        type: 'data'
      },
      {
        id: 'conn-9',
        sourceNodeId: 'variable-2',
        sourcePortId: 'output',
        targetNodeId: 'http-1',
        targetPortId: 'url',
        type: 'data'
      },
      {
        id: 'conn-10',
        sourceNodeId: 'http-1',
        sourcePortId: 'success',
        targetNodeId: 'transform-2',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-11',
        sourceNodeId: 'http-1',
        sourcePortId: 'error',
        targetNodeId: 'log-4',
        targetPortId: 'message',
        type: 'data'
      },
      {
        id: 'conn-12',
        sourceNodeId: 'transform-2',
        sourcePortId: 'output',
        targetNodeId: 'log-3',
        targetPortId: 'message',
        type: 'data'
      },
      {
        id: 'conn-13',
        sourceNodeId: 'log-3',
        sourcePortId: 'output',
        targetNodeId: 'end-2',
        targetPortId: 'input',
        type: 'control'
      },
      {
        id: 'conn-14',
        sourceNodeId: 'log-4',
        sourcePortId: 'output',
        targetNodeId: 'end-2',
        targetPortId: 'input',
        type: 'control'
      }
    ]
  },
  {
    id: 'data-processing-pipeline',
    name: '数据处理管道',
    description: '演示复杂的数据过滤、排序和聚合操作',
    category: 'data',
    nodes: [
      {
        id: 'start-3',
        type: 'start',
        name: '开始',
        description: '开始数据处理',
        x: 100,
        y: 300,
        config: {
          message: '开始数据处理管道'
        }
      },
      {
        id: 'variable-3',
        type: 'variable',
        name: '学生数据',
        description: '学生成绩数据',
        x: 300,
        y: 300,
        config: {
          name: 'students',
          type: 'array',
          defaultValue: '[{"name":"张三","age":20,"score":85},{"name":"李四","age":19,"score":92},{"name":"王五","age":21,"score":78},{"name":"赵六","age":18,"score":96}]'
        }
      },
      {
        id: 'transform-3',
        type: 'transform',
        name: '解析数据',
        description: '解析JSON数组',
        x: 500,
        y: 300,
        config: {
          transformType: 'parseJSON'
        }
      },
      {
        id: 'filter-1',
        type: 'filter',
        name: '过滤成年学生',
        description: '过滤年龄>=18的学生',
        x: 700,
        y: 300,
        config: {
          filterCondition: 'return item.age >= 18;'
        }
      },
      {
        id: 'sort-1',
        type: 'sort',
        name: '按成绩排序',
        description: '按成绩降序排列',
        x: 900,
        y: 300,
        config: {
          sortField: 'score',
          sortOrder: 'desc'
        }
      },
      {
        id: 'aggregate-1',
        type: 'aggregate',
        name: '计算平均分',
        description: '计算平均成绩',
        x: 1100,
        y: 250,
        config: {
          operation: 'avg',
          field: 'score'
        }
      },
      {
        id: 'aggregate-2',
        type: 'aggregate',
        name: '统计人数',
        description: '统计学生人数',
        x: 1100,
        y: 350,
        config: {
          operation: 'count',
          field: ''
        }
      },
      {
        id: 'log-5',
        type: 'log',
        name: '结果日志',
        description: '输出处理结果',
        x: 1300,
        y: 300,
        config: {
          level: 'info',
          prefix: '[处理结果]'
        }
      },
      {
        id: 'end-3',
        type: 'end',
        name: '结束',
        description: '处理完成',
        x: 1500,
        y: 300,
        config: {
          message: '数据处理管道完成'
        }
      }
    ],
    connections: [
      {
        id: 'conn-15',
        sourceNodeId: 'start-3',
        sourcePortId: 'output',
        targetNodeId: 'variable-3',
        targetPortId: 'value',
        type: 'data'
      },
      {
        id: 'conn-16',
        sourceNodeId: 'variable-3',
        sourcePortId: 'output',
        targetNodeId: 'transform-3',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-17',
        sourceNodeId: 'transform-3',
        sourcePortId: 'output',
        targetNodeId: 'filter-1',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-18',
        sourceNodeId: 'filter-1',
        sourcePortId: 'output',
        targetNodeId: 'sort-1',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-19',
        sourceNodeId: 'sort-1',
        sourcePortId: 'output',
        targetNodeId: 'aggregate-1',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-20',
        sourceNodeId: 'sort-1',
        sourcePortId: 'output',
        targetNodeId: 'aggregate-2',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-21',
        sourceNodeId: 'aggregate-1',
        sourcePortId: 'output',
        targetNodeId: 'log-5',
        targetPortId: 'message',
        type: 'data'
      },
      {
        id: 'conn-22',
        sourceNodeId: 'log-5',
        sourcePortId: 'output',
        targetNodeId: 'end-3',
        targetPortId: 'input',
        type: 'control'
      }
    ]
  },
  {
    id: 'parallel-processing',
    name: '并行处理流程',
    description: '演示并行执行和结果合并',
    category: 'async',
    nodes: [
      {
        id: 'start-4',
        type: 'start',
        name: '开始',
        description: '开始并行处理',
        x: 100,
        y: 400,
        config: {
          message: '开始并行处理流程'
        }
      },
      {
        id: 'variable-4',
        type: 'variable',
        name: '输入数据',
        description: '待处理数据',
        x: 300,
        y: 400,
        config: {
          name: 'data',
          type: 'array',
          defaultValue: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]'
        }
      },
      {
        id: 'parallel-1',
        type: 'parallel',
        name: '并行分支',
        description: '创建并行处理分支',
        x: 500,
        y: 400,
        config: {
          waitAll: true,
          timeout: 10000
        }
      },
      {
        id: 'transform-4',
        type: 'transform',
        name: '分支1-求和',
        description: '计算数组总和',
        x: 700,
        y: 300,
        config: {
          transformType: 'custom',
          customCode: 'return input.reduce((sum, num) => sum + num, 0);'
        }
      },
      {
        id: 'transform-5',
        type: 'transform',
        name: '分支2-求积',
        description: '计算数组乘积',
        x: 700,
        y: 400,
        config: {
          transformType: 'custom',
          customCode: 'return input.reduce((product, num) => product * num, 1);'
        }
      },
      {
        id: 'transform-6',
        type: 'transform',
        name: '分支3-平均值',
        description: '计算平均值',
        x: 700,
        y: 500,
        config: {
          transformType: 'custom',
          customCode: 'return input.reduce((sum, num) => sum + num, 0) / input.length;'
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        name: '延时1秒',
        description: '模拟处理时间',
        x: 900,
        y: 400,
        config: {
          duration: 1000
        }
      },
      {
        id: 'log-6',
        type: 'log',
        name: '结果日志',
        description: '输出合并结果',
        x: 1100,
        y: 400,
        config: {
          level: 'info',
          prefix: '[并行结果]'
        }
      },
      {
        id: 'end-4',
        type: 'end',
        name: '结束',
        description: '并行处理完成',
        x: 1300,
        y: 400,
        config: {
          message: '并行处理流程完成'
        }
      }
    ],
    connections: [
      {
        id: 'conn-23',
        sourceNodeId: 'start-4',
        sourcePortId: 'output',
        targetNodeId: 'variable-4',
        targetPortId: 'value',
        type: 'data'
      },
      {
        id: 'conn-24',
        sourceNodeId: 'variable-4',
        sourcePortId: 'output',
        targetNodeId: 'parallel-1',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-25',
        sourceNodeId: 'parallel-1',
        sourcePortId: 'branch1',
        targetNodeId: 'transform-4',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-26',
        sourceNodeId: 'parallel-1',
        sourcePortId: 'branch2',
        targetNodeId: 'transform-5',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-27',
        sourceNodeId: 'parallel-1',
        sourcePortId: 'branch3',
        targetNodeId: 'transform-6',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-28',
        sourceNodeId: 'parallel-1',
        sourcePortId: 'result',
        targetNodeId: 'delay-1',
        targetPortId: 'input',
        type: 'data'
      },
      {
        id: 'conn-29',
        sourceNodeId: 'delay-1',
        sourcePortId: 'output',
        targetNodeId: 'log-6',
        targetPortId: 'message',
        type: 'data'
      },
      {
        id: 'conn-30',
        sourceNodeId: 'log-6',
        sourcePortId: 'output',
        targetNodeId: 'end-4',
        targetPortId: 'input',
        type: 'control'
      }
    ]
  }
]

// 获取示例流程
export function getExampleFlow(id: string): ExampleFlow | undefined {
  return exampleFlows.find(flow => flow.id === id)
}

// 获取分类的示例流程
export function getExamplesByCategory(category: string): ExampleFlow[] {
  return exampleFlows.filter(flow => flow.category === category)
}

// 获取所有分类
export function getExampleCategories(): string[] {
  const categories = new Set(exampleFlows.map(flow => flow.category))
  return Array.from(categories)
}

// 创建示例流程的快捷方法
export function createExampleFlow(id: string): { nodes: FlowNode[], connections: Connection[] } | null {
  const example = getExampleFlow(id)
  if (!example) return null
  
  return {
    nodes: example.nodes.map(node => ({ ...node })),
    connections: example.connections.map(conn => ({ ...conn }))
  }
}
