import type {
  SmartField,
  SmartFormSchema,
  OptimizationSuggestion,
  FormAnalytics,
} from "../types";

export class AIEngine {
  private apiKey: string = "";
  private cache: Map<string, any> = new Map();
  private learningData: Map<string, any[]> = new Map();
  private userBehaviorData: Array<{
    fieldId: string;
    action: string;
    value: any;
    timestamp: number;
    context: Record<string, any>;
  }> = [];

  constructor() {
    this.initializeLearningData();
  }

  private initializeLearningData() {
    // 初始化学习数据
    this.learningData.set("email_patterns", [
      { pattern: "@gmail.com", frequency: 45 },
      { pattern: "@qq.com", frequency: 30 },
      { pattern: "@163.com", frequency: 15 },
      { pattern: "@outlook.com", frequency: 10 },
    ]);

    this.learningData.set("company_names", [
      { name: "阿里巴巴", category: "tech", employees: 100000 },
      { name: "腾讯", category: "tech", employees: 80000 },
      { name: "百度", category: "tech", employees: 50000 },
      { name: "字节跳动", category: "tech", employees: 60000 },
      { name: "美团", category: "service", employees: 40000 },
    ]);

    this.learningData.set("address_patterns", [
      { province: "北京", cities: ["朝阳区", "海淀区", "西城区", "东城区"] },
      { province: "上海", cities: ["浦东新区", "黄浦区", "静安区", "徐汇区"] },
      { province: "广东", cities: ["深圳市", "广州市", "珠海市", "东莞市"] },
    ]);
  }

  // 增强的AI字段建议
  async suggestFieldValue(
    field: SmartField,
    context: Record<string, any>
  ): Promise<{
    suggestions: string[];
    confidence: number;
    reasoning: string;
  }> {
    const cacheKey = `suggest_${field.id}_${JSON.stringify(context)}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 生成智能建议
    const result = await this.generateIntelligentSuggestions(field, context);
    this.cache.set(cacheKey, result);

    // 记录用户行为用于学习
    this.recordUserBehavior(field.id, "suggestion_requested", null, context);

    return result;
  }

  // 智能验证
  async validateField(
    field: SmartField,
    value: any,
    context: Record<string, any>
  ): Promise<{
    valid: boolean;
    message?: string;
    suggestions?: string[];
  }> {
    // 基于AI的智能验证
    const validation = await this.performAIValidation(field, value, context);
    return validation;
  }

  // 表单优化建议
  async optimizeForm(
    schema: SmartFormSchema,
    userData: any[]
  ): Promise<{
    suggestions: OptimizationSuggestion[];
    analytics: FormAnalytics;
  }> {
    const analytics = this.analyzeFormUsage(userData);
    const suggestions = this.generateOptimizationSuggestions(schema, analytics);

    return { suggestions, analytics };
  }

  // 记录用户行为
  private recordUserBehavior(
    fieldId: string,
    action: string,
    value: any,
    context: Record<string, any>
  ): void {
    this.userBehaviorData.push({
      fieldId,
      action,
      value,
      timestamp: Date.now(),
      context,
    });

    // 保持最近1000条记录
    if (this.userBehaviorData.length > 1000) {
      this.userBehaviorData = this.userBehaviorData.slice(-1000);
    }
  }

  // 生成智能建议
  private async generateIntelligentSuggestions(
    field: SmartField,
    context: Record<string, any>
  ): Promise<{
    suggestions: string[];
    confidence: number;
    reasoning: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200)); // 模拟AI处理时间

    switch (field.type) {
      case "email":
        return this.generateEmailSuggestions(field, context);
      case "text":
        if (field.name?.toLowerCase().includes("company")) {
          return this.generateCompanySuggestions(field, context);
        }
        if (field.name?.toLowerCase().includes("address")) {
          return this.generateAddressSuggestions(field, context);
        }
        return this.generateTextSuggestions(field, context);
      case "tel":
        return this.generatePhoneSuggestions(field, context);
      default:
        return {
          suggestions: [],
          confidence: 0,
          reasoning: "暂不支持此字段类型的智能建议",
        };
    }
  }

  // 生成邮箱建议
  private generateEmailSuggestions(
    field: SmartField,
    context: Record<string, any>
  ): {
    suggestions: string[];
    confidence: number;
    reasoning: string;
  } {
    const name = context.username || context.name || context.firstName;
    const company = context.company;
    const suggestions: string[] = [];
    let confidence = 0.7;
    let reasoning = "基于用户输入的姓名";

    if (name) {
      const emailPatterns = this.learningData.get("email_patterns") || [];
      emailPatterns.forEach((pattern: any) => {
        suggestions.push(`${name.toLowerCase()}${pattern.pattern}`);
      });
      confidence = 0.85;
      reasoning = "基于姓名和常用邮箱域名模式";
    }

    if (company) {
      const domain = company.toLowerCase().replace(/\s+/g, "");
      suggestions.unshift(`${name?.toLowerCase() || "user"}@${domain}.com`);
      confidence = 0.9;
      reasoning = "基于公司名称生成企业邮箱";
    }

    return {
      suggestions: suggestions.slice(0, 5),
      confidence,
      reasoning,
    };
  }

  // 生成公司建议
  private generateCompanySuggestions(
    field: SmartField,
    context: Record<string, any>
  ): {
    suggestions: string[];
    confidence: number;
    reasoning: string;
  } {
    const companies = this.learningData.get("company_names") || [];
    const email = context.email;
    let filteredCompanies = companies;
    let confidence = 0.6;
    let reasoning = "基于常见公司名称";

    // 如果有邮箱信息，尝试匹配公司域名
    if (email && email.includes("@")) {
      const domain = email.split("@")[1];
      const domainCompanyMap: Record<string, string> = {
        "alibaba.com": "阿里巴巴",
        "tencent.com": "腾讯",
        "baidu.com": "百度",
        "bytedance.com": "字节跳动",
      };

      if (domainCompanyMap[domain]) {
        return {
          suggestions: [domainCompanyMap[domain]],
          confidence: 0.95,
          reasoning: "基于邮箱域名匹配",
        };
      }
    }

    return {
      suggestions: filteredCompanies.map((c: any) => c.name).slice(0, 5),
      confidence,
      reasoning,
    };
  }

  // 生成地址建议
  private generateAddressSuggestions(
    field: SmartField,
    context: Record<string, any>
  ): {
    suggestions: string[];
    confidence: number;
    reasoning: string;
  } {
    const addressPatterns = this.learningData.get("address_patterns") || [];
    const suggestions: string[] = [];

    addressPatterns.forEach((pattern: any) => {
      pattern.cities.forEach((city: string) => {
        suggestions.push(`${pattern.province}省${city}`);
      });
    });

    return {
      suggestions: suggestions.slice(0, 6),
      confidence: 0.7,
      reasoning: "基于常见地址模式",
    };
  }

  // 生成文本建议
  private generateTextSuggestions(
    field: SmartField,
    context: Record<string, any>
  ): {
    suggestions: string[];
    confidence: number;
    reasoning: string;
  } {
    // 基于字段名称和上下文生成建议
    const fieldName = field.name?.toLowerCase() || "";

    if (fieldName.includes("name")) {
      return {
        suggestions: ["张三", "李四", "王五", "赵六"],
        confidence: 0.5,
        reasoning: "常见姓名建议",
      };
    }

    return {
      suggestions: [],
      confidence: 0,
      reasoning: "无法为此字段生成建议",
    };
  }

  // 生成手机号建议
  private generatePhoneSuggestions(
    field: SmartField,
    context: Record<string, any>
  ): {
    suggestions: string[];
    confidence: number;
    reasoning: string;
  } {
    const prefixes = ["138", "139", "150", "151", "188", "189"];
    const suggestions = prefixes.map(
      (prefix) =>
        `${prefix}****${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`
    );

    return {
      suggestions,
      confidence: 0.3,
      reasoning: "手机号格式示例",
    };
  }

  // 分析字段变化
  analyzeFieldChange(field: string, value: any, schema: SmartFormSchema): void {
    this.recordUserBehavior(field, "field_changed", value, {
      schema: schema.id,
    });

    // 实时学习用户输入模式
    this.updateLearningData(field, value);
  }

  // 更新学习数据
  private updateLearningData(field: string, value: any): void {
    if (!value || typeof value !== "string") return;

    // 学习邮箱模式
    if (field.includes("email") && value.includes("@")) {
      const domain = "@" + value.split("@")[1];
      const emailPatterns = this.learningData.get("email_patterns") || [];
      const existing = emailPatterns.find((p: any) => p.pattern === domain);

      if (existing) {
        existing.frequency += 1;
      } else {
        emailPatterns.push({ pattern: domain, frequency: 1 });
      }

      this.learningData.set("email_patterns", emailPatterns);
    }

    // 学习公司名称
    if (field.includes("company") && value.length > 2) {
      const companies = this.learningData.get("company_names") || [];
      const existing = companies.find((c: any) => c.name === value);

      if (!existing) {
        companies.push({ name: value, category: "unknown", employees: 0 });
        this.learningData.set("company_names", companies);
      }
    }
  }

  private async performAIValidation(
    field: SmartField,
    value: any,
    context: Record<string, any>
  ): Promise<{
    valid: boolean;
    message?: string;
    suggestions?: string[];
  }> {
    // 模拟AI验证逻辑
    await new Promise((resolve) => setTimeout(resolve, 100));

    switch (field.type) {
      case "email":
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        return {
          valid: emailValid,
          message: emailValid ? undefined : "邮箱格式不正确",
          suggestions: emailValid ? undefined : this.suggestEmails(context),
        };
      case "tel":
        const phoneValid = /^1[3-9]\d{9}$/.test(value);
        return {
          valid: phoneValid,
          message: phoneValid ? undefined : "手机号格式不正确",
        };
      default:
        return { valid: true };
    }
  }

  private analyzeFormUsage(userData: any[]): FormAnalytics {
    // 模拟表单使用分析
    return {
      completionRate: 78,
      averageTime: 120,
      fieldDifficulty: [
        { name: "email", label: "邮箱", difficulty: 25, abandonRate: 5 },
        { name: "phone", label: "电话", difficulty: 45, abandonRate: 12 },
        { name: "address", label: "地址", difficulty: 80, abandonRate: 35 },
      ],
      suggestions: [],
      userBehavior: {
        mostSkipped: ["address", "phone"],
        mostCorrected: ["email", "phone"],
        timeSpent: {
          email: 15,
          phone: 25,
          address: 60,
        },
      },
    };
  }

  private generateOptimizationSuggestions(
    schema: SmartFormSchema,
    analytics: FormAnalytics
  ): OptimizationSuggestion[] {
    // 模拟优化建议生成
    return [
      {
        id: "1",
        type: "field",
        priority: "high",
        description: "地址字段可以拆分为省市区三个字段，提高填写成功率",
        impact: "预计提升完成率15%",
        implementation: {
          action: "splitField",
          target: "address",
          value: ["province", "city", "district"],
        },
      },
    ];
  }

  private suggestEmails(context: Record<string, any>): string[] {
    const name = context.name || context.firstName;
    const company = context.company;

    if (!name) return [];

    const suggestions = [
      `${name.toLowerCase()}@gmail.com`,
      `${name.toLowerCase()}@outlook.com`,
    ];

    if (company) {
      const domain = company.toLowerCase().replace(/\s+/g, "");
      suggestions.unshift(`${name.toLowerCase()}@${domain}.com`);
    }

    return suggestions;
  }

  private suggestAddresses(context: Record<string, any>): string[] {
    // 模拟地址建议
    const city = context.city || "北京";
    return [`${city}市朝阳区`, `${city}市海淀区`, `${city}市西城区`];
  }

  private suggestCompanies(context: Record<string, any>): string[] {
    // 模拟公司建议
    return ["阿里巴巴集团", "腾讯科技", "百度公司", "字节跳动"];
  }
}
