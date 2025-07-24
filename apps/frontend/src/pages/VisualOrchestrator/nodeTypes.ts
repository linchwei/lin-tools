// 节点类型定义

export interface FlowNode {
  id: string
  type: string
  name: string
  description: string
  x: number
  y: number
  config: Record<string, any>
  hasError?: boolean
}

export interface Connection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
  type?: 'data' | 'control' | 'condition'
  condition?: string
  hasError?: boolean
}

export interface NodePort {
  id: string
  name: string
  type: 'input' | 'output'
  dataType: string
  required?: boolean
}

export interface ConfigItem {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'code' | 'textarea'
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  min?: number
  max?: number
  default?: any
}

export interface NodeType {
  type: string
  name: string
  description: string
  icon: string
  color: string
  inputs: NodePort[]
  outputs: NodePort[]
  configSchema: ConfigItem[]
  category: string
}

export interface NodeCategory {
  name: string
  title: string
  nodes: NodeType[]
}

// 基础节点类型
export const nodeTypes: NodeCategory[] = [
  {
    name: 'basic',
    title: '🔧 基础节点',
    nodes: [
      {
        type: 'start',
        name: '开始',
        description: '流程开始节点',
        icon: 'fas fa-play',
        color: '#67c23a',
        inputs: [],
        outputs: [
          { id: 'output', name: '输出', type: 'output', dataType: 'any' }
        ],
        configSchema: [
          {
            key: 'message',
            label: '启动消息',
            type: 'text',
            placeholder: '请输入启动消息',
            default: '流程开始'
          }
        ],
        category: 'basic'
      },
      {
        type: 'end',
        name: '结束',
        description: '流程结束节点',
        icon: 'fas fa-stop',
        color: '#f56c6c',
        inputs: [
          { id: 'input', name: '输入', type: 'input', dataType: 'any' }
        ],
        outputs: [],
        configSchema: [
          {
            key: 'message',
            label: '结束消息',
            type: 'text',
            placeholder: '请输入结束消息',
            default: '流程结束'
          }
        ],
        category: 'basic'
      },
      {
        type: 'variable',
        name: '变量',
        description: '定义和存储变量',
        icon: 'fas fa-cube',
        color: '#409eff',
        inputs: [
          { id: 'value', name: '值', type: 'input', dataType: 'any' }
        ],
        outputs: [
          { id: 'output', name: '输出', type: 'output', dataType: 'any' }
        ],
        configSchema: [
          {
            key: 'name',
            label: '变量名',
            type: 'text',
            placeholder: '请输入变量名',
            default: 'variable1'
          },
          {
            key: 'type',
            label: '数据类型',
            type: 'select',
            options: [
              { label: '字符串', value: 'string' },
              { label: '数字', value: 'number' },
              { label: '布尔值', value: 'boolean' },
              { label: '对象', value: 'object' },
              { label: '数组', value: 'array' }
            ],
            default: 'string'
          },
          {
            key: 'defaultValue',
            label: '默认值',
            type: 'text',
            placeholder: '请输入默认值'
          }
        ],
        category: 'basic'
      },
      {
        type: 'log',
        name: '日志输出',
        description: '输出日志信息',
        icon: 'fas fa-file-alt',
        color: '#909399',
        inputs: [
          { id: 'message', name: '消息', type: 'input', dataType: 'string' }
        ],
        outputs: [
          { id: 'output', name: '输出', type: 'output', dataType: 'string' }
        ],
        configSchema: [
          {
            key: 'level',
            label: '日志级别',
            type: 'select',
            options: [
              { label: '信息', value: 'info' },
              { label: '警告', value: 'warn' },
              { label: '错误', value: 'error' },
              { label: '调试', value: 'debug' }
            ],
            default: 'info'
          },
          {
            key: 'prefix',
            label: '前缀',
            type: 'text',
            placeholder: '日志前缀',
            default: '[LOG]'
          }
        ],
        category: 'basic'
      }
    ]
  },
  {
    name: 'logic',
    title: '🧠 逻辑控制',
    nodes: [
      {
        type: 'condition',
        name: '条件判断',
        description: '根据条件进行分支控制',
        icon: 'fas fa-code-branch',
        color: '#e6a23c',
        inputs: [
          { id: 'input', name: '输入', type: 'input', dataType: 'any' }
        ],
        outputs: [
          { id: 'true', name: '真', type: 'output', dataType: 'any' },
          { id: 'false', name: '假', type: 'output', dataType: 'any' }
        ],
        configSchema: [
          {
            key: 'condition',
            label: '条件表达式',
            type: 'code',
            placeholder: '例如: value > 10',
            default: 'input > 0'
          },
          {
            key: 'operator',
            label: '比较操作符',
            type: 'select',
            options: [
              { label: '等于 (==)', value: '==' },
              { label: '不等于 (!=)', value: '!=' },
              { label: '大于 (>)', value: '>' },
              { label: '小于 (<)', value: '<' },
              { label: '大于等于 (>=)', value: '>=' },
              { label: '小于等于 (<=)', value: '<=' }
            ],
            default: '>'
          }
        ],
        category: 'logic'
      },
      {
        type: 'loop',
        name: '循环',
        description: '循环执行节点',
        icon: 'fas fa-redo',
        color: '#722ed1',
        inputs: [
          { id: 'input', name: '输入', type: 'input', dataType: 'any' },
          { id: 'condition', name: '条件', type: 'input', dataType: 'boolean' }
        ],
        outputs: [
          { id: 'body', name: '循环体', type: 'output', dataType: 'any' },
          { id: 'output', name: '输出', type: 'output', dataType: 'any' }
        ],
        configSchema: [
          {
            key: 'type',
            label: '循环类型',
            type: 'select',
            options: [
              { label: 'for循环', value: 'for' },
              { label: 'while循环', value: 'while' },
              { label: 'forEach循环', value: 'forEach' }
            ],
            default: 'for'
          },
          {
            key: 'maxIterations',
            label: '最大迭代次数',
            type: 'number',
            min: 1,
            max: 10000,
            default: 100
          }
        ],
        category: 'logic'
      },
      {
        type: 'switch',
        name: '多路分支',
        description: '多条件分支控制',
        icon: 'fas fa-sitemap',
        color: '#13c2c2',
        inputs: [
          { id: 'input', name: '输入', type: 'input', dataType: 'any' }
        ],
        outputs: [
          { id: 'case1', name: '分支1', type: 'output', dataType: 'any' },
          { id: 'case2', name: '分支2', type: 'output', dataType: 'any' },
          { id: 'case3', name: '分支3', type: 'output', dataType: 'any' },
          { id: 'default', name: '默认', type: 'output', dataType: 'any' }
        ],
        configSchema: [
          {
            key: 'cases',
            label: '分支条件',
            type: 'textarea',
            placeholder: '每行一个条件，例如:\ncase1: value === "A"\ncase2: value === "B"',
            default: 'case1: value === "A"\ncase2: value === "B"\ncase3: value === "C"'
          }
        ],
        category: 'logic'
      }
    ]
  },
  {
    name: 'data',
    title: '📊 数据处理',
    nodes: [
      {
        type: 'transform',
        name: '数据转换',
        description: '转换数据格式',
        icon: 'fas fa-exchange-alt',
        color: '#52c41a',
        inputs: [
          { id: 'input', name: '输入', type: 'input', dataType: 'any' }
        ],
        outputs: [
          { id: 'output', name: '输出', type: 'output', dataType: 'any' }
        ],
        configSchema: [
          {
            key: 'transformType',
            label: '转换类型',
            type: 'select',
            options: [
              { label: 'JSON解析', value: 'parseJSON' },
              { label: 'JSON字符串化', value: 'stringifyJSON' },
              { label: '字符串转数字', value: 'toNumber' },
              { label: '数字转字符串', value: 'toString' },
              { label: '自定义转换', value: 'custom' }
            ],
            default: 'parseJSON'
          },
          {
            key: 'customCode',
            label: '自定义转换代码',
            type: 'code',
            placeholder: '// 返回转换后的数据\nreturn input.toUpperCase();'
          }
        ],
        category: 'data'
      },
      {
        type: 'filter',
        name: '数据过滤',
        description: '过滤数组数据',
        icon: 'fas fa-filter',
        color: '#fa8c16',
        inputs: [
          { id: 'input', name: '输入数组', type: 'input', dataType: 'array' }
        ],
        outputs: [
          { id: 'output', name: '过滤结果', type: 'output', dataType: 'array' }
        ],
        configSchema: [
          {
            key: 'filterCondition',
            label: '过滤条件',
            type: 'code',
            placeholder: '// item为数组中的每一项\nreturn item.age > 18;',
            default: 'return item !== null && item !== undefined;'
          }
        ],
        category: 'data'
      },
      {
        type: 'sort',
        name: '数据排序',
        description: '对数组进行排序',
        icon: 'fas fa-sort',
        color: '#1890ff',
        inputs: [
          { id: 'input', name: '输入数组', type: 'input', dataType: 'array' }
        ],
        outputs: [
          { id: 'output', name: '排序结果', type: 'output', dataType: 'array' }
        ],
        configSchema: [
          {
            key: 'sortField',
            label: '排序字段',
            type: 'text',
            placeholder: '对象属性名，留空则直接排序',
            default: ''
          },
          {
            key: 'sortOrder',
            label: '排序顺序',
            type: 'select',
            options: [
              { label: '升序', value: 'asc' },
              { label: '降序', value: 'desc' }
            ],
            default: 'asc'
          }
        ],
        category: 'data'
      },
      {
        type: 'aggregate',
        name: '数据聚合',
        description: '对数据进行聚合计算',
        icon: 'fas fa-calculator',
        color: '#eb2f96',
        inputs: [
          { id: 'input', name: '输入数组', type: 'input', dataType: 'array' }
        ],
        outputs: [
          { id: 'output', name: '聚合结果', type: 'output', dataType: 'any' }
        ],
        configSchema: [
          {
            key: 'operation',
            label: '聚合操作',
            type: 'select',
            options: [
              { label: '求和', value: 'sum' },
              { label: '平均值', value: 'avg' },
              { label: '最大值', value: 'max' },
              { label: '最小值', value: 'min' },
              { label: '计数', value: 'count' }
            ],
            default: 'sum'
          },
          {
            key: 'field',
            label: '聚合字段',
            type: 'text',
            placeholder: '对象属性名，留空则对整个值聚合',
            default: ''
          }
        ],
        category: 'data'
      }
    ]
  },
  {
    name: 'async',
    title: '⚡ 异步操作',
    nodes: [
      {
        type: 'http',
        name: 'HTTP请求',
        description: '发送HTTP请求',
        icon: 'fas fa-globe',
        color: '#722ed1',
        inputs: [
          { id: 'url', name: 'URL', type: 'input', dataType: 'string' },
          { id: 'data', name: '数据', type: 'input', dataType: 'any' }
        ],
        outputs: [
          { id: 'success', name: '成功', type: 'output', dataType: 'any' },
          { id: 'error', name: '错误', type: 'output', dataType: 'any' }
        ],
        configSchema: [
          {
            key: 'method',
            label: '请求方法',
            type: 'select',
            options: [
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' },
              { label: 'DELETE', value: 'DELETE' }
            ],
            default: 'GET'
          },
          {
            key: 'headers',
            label: '请求头',
            type: 'textarea',
            placeholder: 'JSON格式的请求头\n{"Content-Type": "application/json"}',
            default: '{"Content-Type": "application/json"}'
          },
          {
            key: 'timeout',
            label: '超时时间(ms)',
            type: 'number',
            min: 1000,
            max: 60000,
            default: 5000
          }
        ],
        category: 'async'
      },
      {
        type: 'delay',
        name: '延时',
        description: '延时执行',
        icon: 'fas fa-clock',
        color: '#fa541c',
        inputs: [
          { id: 'input', name: '输入', type: 'input', dataType: 'any' }
        ],
        outputs: [
          { id: 'output', name: '输出', type: 'output', dataType: 'any' }
        ],
        configSchema: [
          {
            key: 'duration',
            label: '延时时间(ms)',
            type: 'number',
            min: 0,
            max: 60000,
            default: 1000
          }
        ],
        category: 'async'
      },
      {
        type: 'parallel',
        name: '并行执行',
        description: '并行执行多个分支',
        icon: 'fas fa-tasks',
        color: '#13c2c2',
        inputs: [
          { id: 'input', name: '输入', type: 'input', dataType: 'any' }
        ],
        outputs: [
          { id: 'branch1', name: '分支1', type: 'output', dataType: 'any' },
          { id: 'branch2', name: '分支2', type: 'output', dataType: 'any' },
          { id: 'branch3', name: '分支3', type: 'output', dataType: 'any' },
          { id: 'result', name: '合并结果', type: 'output', dataType: 'array' }
        ],
        configSchema: [
          {
            key: 'waitAll',
            label: '等待所有分支完成',
            type: 'boolean',
            default: true
          },
          {
            key: 'timeout',
            label: '超时时间(ms)',
            type: 'number',
            min: 1000,
            max: 300000,
            default: 30000
          }
        ],
        category: 'async'
      }
    ]
  }
]
