# 首页入口配置系统

## 概述

本系统提供了一个配置化的首页入口管理方案，只需要在配置文件中添加新的入口配置，即可在首页自动展示新的功能模块。

## 配置文件位置

```
src/config/homeEntries.ts
```

## 如何添加新的页面入口

### 1. 在配置文件中添加新入口

编辑 `src/config/homeEntries.ts` 文件，在 `homeEntries` 数组中添加新的配置项：

```typescript
{
  id: 'your-new-feature',                    // 唯一标识符
  title: '您的新功能',                        // 显示标题
  description: '功能描述，支持详细说明',        // 功能描述
  path: '/your-new-feature',                 // 路由路径
  icon: '🎯',                               // 显示图标（emoji）
  category: 'tool',                         // 分类
  tags: ['标签1', '标签2', '标签3'],          // 功能标签
  status: 'new',                           // 状态标识（可选）
  difficulty: 'beginner',                  // 难度等级（可选）
  featured: false                          // 是否为特色功能（可选）
}
```

### 2. 配置项详细说明

#### 必填字段

- **id**: `string` - 唯一标识符，用于区分不同的功能模块
- **title**: `string` - 功能标题，显示在卡片上
- **description**: `string` - 功能描述，详细说明功能特点
- **path**: `string` - 路由路径，点击卡片时跳转的地址
- **icon**: `string` - 功能图标，建议使用 emoji
- **category**: `'featured' | 'tool' | 'demo' | 'visualization' | 'game' | 'form'` - 功能分类
- **tags**: `string[]` - 功能标签数组，用于搜索和展示

#### 可选字段

- **status**: `'new' | 'hot' | 'beta' | 'stable'` - 功能状态标识
  - `new`: 新功能（红色标签）
  - `hot`: 热门功能（橙色标签）
  - `beta`: 测试版（蓝色标签）
  - `stable`: 稳定版（绿色标签）

- **difficulty**: `'beginner' | 'intermediate' | 'advanced'` - 难度等级
  - `beginner`: 入门级（绿色圆点）
  - `intermediate`: 中级（黄色圆点）
  - `advanced`: 高级（红色圆点）

- **featured**: `boolean` - 是否为特色功能，特色功能会在首页顶部单独展示

### 3. 分类说明

- **featured**: 特色功能 - 重点推荐的功能
- **tool**: 实用工具 - 各种实用的工具类功能
- **visualization**: 可视化 - 数据可视化相关功能
- **form**: 表单组件 - 表单相关的功能
- **demo**: 组件演示 - 各种组件的演示页面
- **game**: 小游戏 - 娱乐性质的小游戏

### 4. 完整示例

```typescript
{
  id: 'markdown-editor',
  title: 'Markdown 编辑器',
  description: '功能强大的在线 Markdown 编辑器，支持实时预览、语法高亮、导出等功能',
  path: '/markdown-editor',
  icon: '📝',
  category: 'tool',
  tags: ['Markdown', '编辑器', '实时预览', '语法高亮'],
  status: 'new',
  difficulty: 'intermediate',
  featured: true
}
```

## 自动化功能

### 搜索功能
系统会自动根据以下内容进行搜索：
- 功能标题
- 功能描述
- 功能标签

### 筛选功能
系统提供以下筛选选项：
- 全部功能
- 特色功能
- 最新功能
- 热门功能
- 按分类筛选

### 统计功能
首页底部会自动显示功能模块总数等统计信息。

## 样式自定义

如需自定义分类或状态的颜色，可以修改配置文件中的：

```typescript
// 分类配置
export const categoryConfig = {
  tool: { name: '实用工具', icon: '🛠️', color: '#4ecdc4' },
  // ... 其他分类
}

// 状态配置
export const statusConfig = {
  new: { name: '新功能', color: '#ff6b6b', bgColor: 'rgba(255, 107, 107, 0.1)' },
  // ... 其他状态
}
```

## 注意事项

1. **路由配置**: 添加新入口后，需要确保对应的路由已在 `src/router/index.ts` 中配置
2. **图标选择**: 建议使用 emoji 作为图标，保持视觉一致性
3. **描述长度**: 建议描述控制在 50-100 字符，过长会影响显示效果
4. **标签数量**: 建议每个功能配置 2-4 个标签，过多会影响显示
5. **ID 唯一性**: 确保每个功能的 ID 都是唯一的，避免冲突

## 维护建议

- 定期检查和更新功能状态
- 及时移除已废弃的功能入口
- 保持分类的合理性和一致性
- 根据用户反馈调整功能的展示优先级
