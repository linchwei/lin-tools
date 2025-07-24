import type { ValidationRule } from "../types";

export class ValidationEngine {
  private rules: ValidationRule[] = [];
  private customValidators: Record<string, Function> = {};

  setRules(rules: ValidationRule[]) {
    this.rules = rules;
  }

  registerValidator(name: string, validator: Function) {
    this.customValidators[name] = validator;
  }

  async validateField(
    fieldName: string,
    value: any,
    formData: Record<string, any>
  ): Promise<string[]> {
    const fieldRules = this.rules.filter((rule) => rule.field === fieldName);
    const errors: string[] = [];

    for (const rule of fieldRules) {
      const isValid = await this.evaluateRule(rule, value, formData);
      if (!isValid) {
        errors.push(rule.message);
      }
    }

    return errors;
  }

  private async evaluateRule(
    rule: ValidationRule,
    value: any,
    formData: Record<string, any>
  ): Promise<boolean> {
    switch (rule.type) {
      case "required":
        return value !== null && value !== undefined && value !== "";

      case "pattern":
        if (!rule.value) return true;
        return new RegExp(rule.value).test(String(value));

      case "length":
        if (!rule.value) return true;
        if (typeof rule.value === "number") {
          return String(value).length === rule.value;
        } else if (typeof rule.value === "object") {
          const { min, max } = rule.value;
          const length = String(value).length;
          if (min !== undefined && length < min) return false;
          if (max !== undefined && length > max) return false;
          return true;
        }
        return true;

      case "range":
        if (!rule.value || typeof value !== "number") return true;
        if (typeof rule.value === "object") {
          const { min, max } = rule.value;
          if (min !== undefined && value < min) return false;
          if (max !== undefined && value > max) return false;
          return true;
        }
        return true;

      case "custom":
        if (rule.validator) {
          return rule.validator(value, formData);
        }
        if (
          typeof rule.value === "string" &&
          this.customValidators[rule.value]
        ) {
          return this.customValidators[rule.value](value, formData);
        }
        return true;

      case "async":
        if (rule.validator) {
          return await rule.validator(value, formData);
        }
        return true;

      default:
        return true;
    }
  }
}
