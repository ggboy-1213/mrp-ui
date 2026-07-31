import type { Tone } from '@/lib/tone'

export type RecalcStatus = '待复算' | '已复算' | '无需复算'

export interface Adjustment {
  id: string
  sku: string
  spu: string
  country: string
  platform: string
  targetWarehouse: string
  planWeek: string
  systemQty: number
  adjustedQty: number
  reason: string
  operator: string
  adjustTime: string
  recalcStatus: RecalcStatus
}

export const recalcTone: Record<RecalcStatus, Tone> = {
  待复算: 'warning',
  已复算: 'success',
  无需复算: 'muted',
}

const countries = ['美国', '德国', '英国', '日本']
const platforms = ['Amazon', 'Temu', 'TikTok', 'eBay']
const warehouses = ['US-East-01', 'US-West-02', 'DE-FRA-01', 'UK-LON-01']
const operators = ['王磊', '李静', '陈晓', '赵敏']
const reasons = ['供应商产能受限', '结合促销预测上调', '清库存下调', '新品试销保守', '', '海运延误提前备货']

function pick<T>(a: T[], i: number): T {
  return a[i % a.length]
}

export const adjustments: Adjustment[] = Array.from({ length: 24 }).map((_, i) => {
  const system = 200 + ((i * 73) % 1200)
  const adjusted = i % 3 === 0 ? system : system + ((i % 2 === 0 ? 1 : -1) * ((i * 40) % 300))
  const changed = adjusted !== system
  return {
    id: `ADJ-${String(i + 1).padStart(4, '0')}`,
    sku: `SKU${100000 + i}`,
    spu: `SPU${9000 + (i % 12)}`,
    country: pick(countries, i),
    platform: pick(platforms, i + 1),
    targetWarehouse: pick(warehouses, i),
    planWeek: `2026-W${24 + (i % 6)}`,
    systemQty: system,
    adjustedQty: adjusted,
    reason: changed ? pick(reasons.filter(Boolean), i) : '',
    operator: changed ? pick(operators, i) : '-',
    adjustTime: changed ? `2026-06-2${i % 9} 1${i % 5}:${String((i * 7) % 60).padStart(2, '0')}` : '-',
    recalcStatus: !changed ? '无需复算' : i % 2 === 0 ? '待复算' : '已复算',
  }
})

export const adjustSummary = {
  pending: adjustments.filter((a) => a.recalcStatus === '待复算').length,
  adjusted: adjustments.filter((a) => a.adjustedQty !== a.systemQty).length,
  affectedSku: new Set(adjustments.filter((a) => a.adjustedQty !== a.systemQty).map((a) => a.sku)).size,
  beforeTotal: adjustments.reduce((s, a) => s + a.systemQty, 0),
  afterTotal: adjustments.reduce((s, a) => s + a.adjustedQty, 0),
}

export const impactAnalysis = {
  shortageBefore: 14,
  shortageAfter: 9,
  overstockBefore: 6,
  overstockAfter: 8,
  amountBefore: 1284000,
  amountAfter: 1352000,
  futureWeeks: [
    { week: '2026-W25', effect: '缺货风险下降', tone: 'success' as Tone },
    { week: '2026-W26', effect: '到货压力上升', tone: 'warning' as Tone },
    { week: '2026-W27', effect: '库存趋于平衡', tone: 'primary' as Tone },
    { week: '2026-W28', effect: '高库存风险轻微上升', tone: 'warning' as Tone },
  ],
}
