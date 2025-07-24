// 智能表单核心类型定义
export interface SmartFormSchema {
  id: string;
  version: string;
  title: string;
  description?: string;
  fields: SmartField[];
  rules: ValidationRule[];
  conditions: ConditionalRule[];
  layout: LayoutConfig;
  ai?: AIConfig;
}

export interface SmartField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  validation?: FieldValidation;
  dependencies?: string[];
  aiSuggestions?: boolean;
  dynamicOptions?: DynamicOptionsConfig;
  [key: string]: any;
}

export interface ConditionalRule {
  id: string;
  condition: LogicalExpression;
  actions: ConditionalAction[];
  priority: number;
}

export interface LogicalExpression {
  operator: "AND" | "OR" | "NOT";
  conditions: (FieldCondition | LogicalExpression)[];
}

export interface FieldCondition {
  field: string;
  operator: "eq" | "ne" | "gt" | "lt" | "in" | "contains" | "regex";
  value: any;
}

export interface ConditionalAction {
  type:
    | "show"
    | "hide"
    | "require"
    | "disable"
    | "setValue"
    | "addField"
    | "removeField";
  target: string | string[];
  value?: any;
}

export interface AIConfig {
  enabled: boolean;
  autoComplete: boolean;
  smartValidation: boolean;
  fieldSuggestions: boolean;
  dataAnalysis: boolean;
}

// 字段类型枚举
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "switch"
  | "date"
  | "datetime"
  | "time"
  | "file"
  | "image"
  | "slider"
  | "rate"
  | "cascader"
  | "tree-select"
  | "color-picker";

// 验证规则
export interface ValidationRule {
  id: string;
  field: string;
  type: "required" | "pattern" | "length" | "range" | "custom" | "async";
  message: string;
  value?: any;
  validator?: (
    value: any,
    formData: Record<string, any>
  ) => boolean | Promise<boolean>;
  trigger?: "blur" | "change" | "submit";
}

// 字段验证配置
export interface FieldValidation {
  rules: ValidationRule[];
  realtime?: boolean;
  debounce?: number;
}

// 布局配置
export interface LayoutConfig {
  type: "vertical" | "horizontal" | "inline" | "grid";
  columns?: number;
  spacing?: number;
  responsive?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

// 动态选项配置
export interface DynamicOptionsConfig {
  source: "api" | "function" | "dependency";
  url?: string;
  method?: "GET" | "POST";
  params?: Record<string, any>;
  transform?: (data: any) => Array<{ label: string; value: any }>;
  dependsOn?: string[];
  cache?: boolean;
  cacheDuration?: number;
}

// 表单分析数据
export interface FormAnalytics {
  completionRate: number;
  averageTime: number;
  fieldDifficulty: Array<{
    name: string;
    label: string;
    difficulty: number;
    abandonRate: number;
  }>;
  suggestions: OptimizationSuggestion[];
  userBehavior: {
    mostSkipped: string[];
    mostCorrected: string[];
    timeSpent: Record<string, number>;
  };
}

// 优化建议
export interface OptimizationSuggestion {
  id: string;
  type: "field" | "layout" | "validation" | "ux";
  priority: "high" | "medium" | "low";
  description: string;
  impact: string;
  implementation: {
    action: string;
    target: string;
    value?: any;
  };
}

// 表单状态
export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  values: Record<string, any>;
}

// 字段选项
export interface FieldOption {
  label: string;
  value: any;
  disabled?: boolean;
  children?: FieldOption[];
  [key: string]: any;
}
