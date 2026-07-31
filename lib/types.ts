// 领域模型类型定义 —— 后续接入 FastAPI 时，接口返回结构应与这些类型保持一致。

export type PlanStatus = 'draft' | 'calculating' | 'review' | 'confirmed' | 'archived'

export type AlertLevel = 'critical' | 'warning' | 'info'

export type AlertType = '缺货' | '高库存' | '到货延迟' | 'LT异常' | '数据缺失' | '数据过期' | '数据冲突'

export interface KpiMetric {
  key: string
  label: string
  value: number
  unit?: string
  delta?: number // 环比变化百分比
  tone: 'default' | 'mrp' | 'success' | 'warning' | 'danger'
  hint?: string
}

export interface PlanStep {
  key: string
  label: string
  status: 'done' | 'active' | 'pending'
  description: string
}

export interface WeeklyInventoryPoint {
  week: string // 例如 W32
  demand: number // 预测需求
  arrival: number // 预计到货
  endingStock: number // 预计期末库存
  safetyStock: number // 安全库存参考线
}

export interface AlertItem {
  id: string
  level: AlertLevel
  type: AlertType
  sku: string
  spu: string
  country: string
  platform: string
  warehouse: string
  message: string
  week: string
  owner: string
  createdAt: string
}

export interface PlanVersion {
  id: string
  name: string
  batch: string
  scope: string
  status: PlanStatus
  skuCount: number
  suggestionCount: number
  createdBy: string
  createdAt: string
  confirmedAt?: string
}

export interface PlanSuggestion {
  id: string
  sku: string
  spu: string
  country: string
  platform: string
  warehouse: string
  supplier: string
  planType: '采购计划' | '集货计划' | '发运计划' | '到货计划' | '调拨计划'
  quantity: number
  planWeek: string
  arrivalWeek: string
  targetStockDays: number
  status: '待确认' | '已调整' | '已确认'
}

export interface DashboardData {
  currentVersion: PlanVersion
  kpis: KpiMetric[]
  steps: PlanStep[]
  weekly: WeeklyInventoryPoint[]
  alerts: AlertItem[]
  recentVersions: PlanVersion[]
}

export const planStatusMeta: Record<PlanStatus, { label: string; tone: string }> = {
  draft: { label: '草稿', tone: 'muted' },
  calculating: { label: '计算中', tone: 'mrp' },
  review: { label: '待评审', tone: 'warning' },
  confirmed: { label: '已确认', tone: 'success' },
  archived: { label: '已归档', tone: 'muted' },
}
