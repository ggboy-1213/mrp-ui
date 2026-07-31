import type { Tone } from '@/lib/tone'

export type DiffType = '新增' | '删除' | '数量变更' | '无变化'

export interface VersionDiff {
  id: string
  sku: string
  country: string
  platform: string
  warehouse: string
  planWeek: string
  qtyA: number
  qtyB: number
  diff: number
  diffRate: number
  diffType: DiffType
  reason: string
}

export const diffTypeTone: Record<DiffType, Tone> = {
  新增: 'success',
  删除: 'danger',
  数量变更: 'warning',
  无变化: 'muted',
}

const countries = ['美国', '德国', '英国', '日本']
const platforms = ['Amazon', 'Temu', 'TikTok']
const warehouses = ['US-East-01', 'DE-FRA-01', 'UK-LON-01', 'JP-TYO-01']
const reasons = ['预测上调', '安全库存参数调整', '新增在途未及时扣减', '人工调整', 'Lead Time 变化', '新品上架']

function pick<T>(a: T[], i: number): T {
  return a[i % a.length]
}

export const versionDiffs: VersionDiff[] = Array.from({ length: 28 }).map((_, i) => {
  const type: DiffType = i % 7 === 0 ? '新增' : i % 9 === 0 ? '删除' : i % 3 === 0 ? '无变化' : '数量变更'
  const qtyA = type === '新增' ? 0 : 200 + ((i * 53) % 900)
  const qtyB = type === '删除' ? 0 : type === '无变化' ? qtyA : qtyA + ((i % 2 === 0 ? 1 : -1) * ((i * 37) % 400))
  const diff = qtyB - qtyA
  return {
    id: `DF-${String(i + 1).padStart(4, '0')}`,
    sku: `SKU${100000 + i}`,
    country: pick(countries, i),
    platform: pick(platforms, i + 1),
    warehouse: pick(warehouses, i),
    planWeek: `2026-W${24 + (i % 6)}`,
    qtyA,
    qtyB,
    diff,
    diffRate: qtyA === 0 ? 100 : Math.round((diff / qtyA) * 100),
    diffType: type,
    reason: type === '无变化' ? '-' : pick(reasons, i),
  }
})

export const diffSummary = {
  replenishDelta: versionDiffs.reduce((s, d) => s + d.diff, 0),
  shortageDelta: -5,
  overstockDelta: 2,
  added: versionDiffs.filter((d) => d.diffType === '新增').length,
  removed: versionDiffs.filter((d) => d.diffType === '删除').length,
  changed: versionDiffs.filter((d) => d.diffType === '数量变更').length,
}

export const versionOptions = [
  'MRP-2026W30-v1',
  'MRP-2026W29-v2',
  'MRP-2026W28-v1',
  'MRP-2026W27-v3',
  'MRP-2026W26-v1',
]
