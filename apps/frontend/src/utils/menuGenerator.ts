// 从路由配置生成菜单的工具函数
import type { RouteRecordNormalized } from 'vue-router'
import router from '@/router'

// 菜单项接口
export interface MenuItem {
  id: string
  name: string
  path?: string
  icon?: string
  children?: MenuItem[]
  meta?: {
    title?: string
    description?: string
    badge?: string
    hidden?: boolean
    disabled?: boolean
    order?: number
  }
}

// 分类配置
export const categoryConfig = {
  advanced: {
    name: '高级工具',
    icon: 'Tools',
    order: 1,
    description: '高级技术功能'
  },
  data: {
    name: '数据处理',
    icon: 'DataAnalysis',
    order: 2,
    description: '数据相关工具'
  },
  media: {
    name: '媒体工具',
    icon: 'Picture',
    order: 3,
    description: '媒体处理功能'
  },
  dev: {
    name: '开发工具',
    icon: 'Setting',
    order: 4,
    description: '开发辅助工具'
  },
  utils: {
    name: '实用工具',
    icon: 'Operation',
    order: 5,
    description: '日常实用功能'
  },
  games: {
    name: '游戏娱乐',
    icon: 'Trophy',
    order: 6,
    description: '休闲娱乐功能'
  }
}

// 从路由生成菜单
export function generateMenuFromRoutes(): MenuItem[] {
  const routes = router.getRoutes()
  const menuItems: MenuItem[] = []
  const categoryMap = new Map<string, MenuItem[]>()

  // 处理路由
  routes.forEach(route => {
    const meta = route.meta
    
    // 跳过隐藏的路由
    if (meta?.hidden) return
    
    // 创建菜单项
    const menuItem: MenuItem = {
      id: route.name as string || route.path,
      name: meta?.title || route.name as string,
      path: route.path,
      icon: meta?.icon,
      meta: {
        title: meta?.title,
        description: meta?.description,
        badge: meta?.badge,
        hidden: meta?.hidden,
        disabled: meta?.disabled,
        order: meta?.order
      }
    }

    // 如果有分类，按分类分组
    if (meta?.category) {
      if (!categoryMap.has(meta.category)) {
        categoryMap.set(meta.category, [])
      }
      categoryMap.get(meta.category)!.push(menuItem)
    } else {
      // 没有分类的直接添加到根级
      menuItems.push(menuItem)
    }
  })

  // 处理分类菜单
  Array.from(categoryMap.entries())
    .sort(([a], [b]) => {
      const orderA = categoryConfig[a as keyof typeof categoryConfig]?.order || 999
      const orderB = categoryConfig[b as keyof typeof categoryConfig]?.order || 999
      return orderA - orderB
    })
    .forEach(([category, items]) => {
      const config = categoryConfig[category as keyof typeof categoryConfig]
      if (config) {
        // 对分类内的项目排序
        items.sort((a, b) => (a.meta?.order || 999) - (b.meta?.order || 999))
        
        menuItems.push({
          id: category,
          name: config.name,
          icon: config.icon,
          children: items,
          meta: {
            title: config.name,
            description: config.description,
            order: config.order
          }
        })
      }
    })

  // 对根级菜单排序
  menuItems.sort((a, b) => (a.meta?.order || 999) - (b.meta?.order || 999))

  return menuItems
}

// 扁平化菜单项（用于搜索等功能）
export function flattenMenuItems(items: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = []
  
  function traverse(items: MenuItem[]) {
    for (const item of items) {
      if (item.path) {
        result.push(item)
      }
      if (item.children) {
        traverse(item.children)
      }
    }
  }
  
  traverse(items)
  return result
}

// 根据路径查找菜单项
export function findMenuItemByPath(path: string, items: MenuItem[]): MenuItem | null {
  for (const item of items) {
    if (item.path === path) {
      return item
    }
    if (item.children) {
      const found = findMenuItemByPath(path, item.children)
      if (found) return found
    }
  }
  return null
}

// 获取菜单项的面包屑路径
export function getMenuBreadcrumb(path: string, items: MenuItem[]): MenuItem[] {
  function findPath(items: MenuItem[], targetPath: string, currentPath: MenuItem[] = []): MenuItem[] | null {
    for (const item of items) {
      const newPath = [...currentPath, item]
      
      if (item.path === targetPath) {
        return newPath
      }
      
      if (item.children) {
        const result = findPath(item.children, targetPath, newPath)
        if (result) return result
      }
    }
    return null
  }
  
  return findPath(items, path) || []
}

// 搜索菜单项
export function searchMenuItems(query: string, items: MenuItem[]): MenuItem[] {
  const flatItems = flattenMenuItems(items)
  const lowerQuery = query.toLowerCase()
  
  return flatItems.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.meta?.title?.toLowerCase().includes(lowerQuery) ||
    item.meta?.description?.toLowerCase().includes(lowerQuery)
  )
}

// 获取当前激活的菜单项
export function getActiveMenuItem(currentPath: string, items: MenuItem[]): MenuItem | null {
  return findMenuItemByPath(currentPath, items)
}

// 检查菜单项是否可访问
export function isMenuItemAccessible(item: MenuItem): boolean {
  return !item.meta?.disabled && !item.meta?.hidden
}

// 过滤可访问的菜单项
export function filterAccessibleMenuItems(items: MenuItem[]): MenuItem[] {
  return items
    .filter(isMenuItemAccessible)
    .map(item => ({
      ...item,
      children: item.children ? filterAccessibleMenuItems(item.children) : undefined
    }))
    .filter(item => !item.children || item.children.length > 0)
}
