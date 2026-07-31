import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  ListTodo,
  Lightbulb,
  TrendingUp,
  SlidersHorizontal,
  History,
  GitCompare,
  PackageSearch,
  Truck,
  Database,
  Settings2,
  Upload,
  ShieldCheck,
  BellRing,
  Users,
  ScrollText,
  Cog,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  accent?: 'default' | 'mrp'
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: '计划与执行',
    items: [
      { title: 'MRP 工作台', href: '/', icon: LayoutDashboard },
      { title: '计划任务', href: '/tasks', icon: ListTodo },
      { title: '计划建议', href: '/suggestions', icon: Lightbulb, accent: 'mrp' },
      { title: '库存趋势', href: '/inventory-trend', icon: TrendingUp },
      { title: '人工调整', href: '/adjustments', icon: SlidersHorizontal },
      { title: '计划版本', href: '/versions', icon: History },
      { title: '版本对比', href: '/versions/compare', icon: GitCompare },
    ],
  },
  {
    label: '数据与主数据',
    items: [
      { title: '需求与库存', href: '/demand-inventory', icon: PackageSearch },
      { title: '供应与物流', href: '/supply-logistics', icon: Truck },
      { title: '主数据', href: '/master-data', icon: Database },
      { title: '计划参数', href: '/parameters', icon: Settings2 },
      { title: '数据导入', href: '/data-import', icon: Upload },
      { title: '数据校验', href: '/data-validation', icon: ShieldCheck },
    ],
  },
  {
    label: '监控与系统',
    items: [
      { title: '预警中心', href: '/alerts', icon: BellRing },
      { title: '用户与权限', href: '/users', icon: Users },
      { title: '操作日志', href: '/logs', icon: ScrollText },
      { title: '系统配置', href: '/settings', icon: Cog },
    ],
  },
]

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items)

export function findNavItem(pathname: string): NavItem | undefined {
  return allNavItems.find((item) => item.href === pathname)
}
