import type {
  ConditionalRule,
  LogicalExpression,
  FieldCondition,
  ConditionalAction,
} from "../types";

export class ConditionalEngine {
  private rules: ConditionalRule[] = [];
  private formData: Record<string, any> = {};
  private callbacks: Map<string, Function[]> = new Map();

  setRules(rules: ConditionalRule[]) {
    this.rules = rules.sort((a, b) => b.priority - a.priority);
  }

  evaluate(changedField: string, value: any, formData: Record<string, any>) {
    this.formData = { ...formData, [changedField]: value };

    // 找到相关规则
    const relevantRules = this.rules.filter((rule) =>
      this.isRuleRelevant(rule, changedField)
    );

    // 执行规则
    relevantRules.forEach((rule) => {
      if (this.evaluateCondition(rule.condition)) {
        this.executeActions(rule.actions);
      }
    });
  }

  private isRuleRelevant(rule: ConditionalRule, changedField: string): boolean {
    return this.checkConditionFields(rule.condition, changedField);
  }

  private checkConditionFields(
    expression: LogicalExpression,
    targetField: string
  ): boolean {
    return expression.conditions.some((condition) => {
      if ("operator" in condition) {
        return this.checkConditionFields(
          condition as LogicalExpression,
          targetField
        );
      } else {
        return (condition as FieldCondition).field === targetField;
      }
    });
  }

  private evaluateCondition(expression: LogicalExpression): boolean {
    const { operator, conditions } = expression;

    const results = conditions.map((condition) => {
      if ("operator" in condition) {
        // 嵌套逻辑表达式
        return this.evaluateCondition(condition as LogicalExpression);
      } else {
        // 字段条件
        return this.evaluateFieldCondition(condition as FieldCondition);
      }
    });

    switch (operator) {
      case "AND":
        return results.every(Boolean);
      case "OR":
        return results.some(Boolean);
      case "NOT":
        return !results[0];
      default:
        return false;
    }
  }

  private evaluateFieldCondition(condition: FieldCondition): boolean {
    const { field, operator, value } = condition;
    const fieldValue = this.formData[field];

    switch (operator) {
      case "eq":
        return fieldValue === value;
      case "ne":
        return fieldValue !== value;
      case "gt":
        return Number(fieldValue) > Number(value);
      case "lt":
        return Number(fieldValue) < Number(value);
      case "in":
        return Array.isArray(value) && value.includes(fieldValue);
      case "contains":
        return String(fieldValue).includes(String(value));
      case "regex":
        return new RegExp(value).test(String(fieldValue));
      default:
        return false;
    }
  }

  private executeActions(actions: ConditionalAction[]) {
    actions.forEach((action) => {
      const callback = this.callbacks.get(action.type);
      if (callback) {
        callback.forEach((fn) => fn(action));
      }
    });
  }

  // 注册动作回调
  onAction(type: string, callback: Function) {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type)!.push(callback);
  }
}
