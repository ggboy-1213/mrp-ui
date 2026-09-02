import type { Tone } from '@/lib/tone'

export type SupplierRating = 'A' | 'B' | 'C'

export const RATING_TONE: Record<SupplierRating, Tone> = {
  A: 'success',
  B: 'info',
  C: 'warning',
}

export interface SupplierParam {
  id: string
  supplier: string
  category: string
  rating: SupplierRating
  moq: number
  cartonMultiple: number
  prodLeadTime: number
  qcDays: number
  intlLeadTime: number
  onTimeRate: number
  activeSku: number
  source: 'SCM' | 'MRP 配置'
  updatedAt: string
}

// 供应商级 MRP 参数：SCM 优先，缺失时回退到本页维护的 MRP Supplier Config
export const SUPPLIER_PARAMS: SupplierParam[] = [
  { id: 'SUP-01', supplier: '深圳声学科技', category: '音频', rating: 'A', moq: 1000, cartonMultiple: 40, prodLeadTime: 22, qcDays: 3, intlLeadTime: 12, onTimeRate: 94, activeSku: 18, source: 'SCM', updatedAt: '2026-07-30 18:20' },
  { id: 'SUP-02', supplier: '东莞智声', category: '音频', rating: 'B', moq: 1500, cartonMultiple: 50, prodLeadTime: 25, qcDays: 4, intlLeadTime: 14, onTimeRate: 88, activeSku: 24, source: 'SCM', updatedAt: '2026-07-30 18:20' },
  { id: 'SUP-03', supplier: '苏州键值', category: '外设', rating: 'A', moq: 800, cartonMultiple: 30, prodLeadTime: 20, qcDays: 3, intlLeadTime: 15, onTimeRate: 91, activeSku: 12, source: 'MRP 配置', updatedAt: '2026-07-28 09:41' },
  { id: 'SUP-04', supplier: '深圳快充', category: '配件', rating: 'C', moq: 2000, cartonMultiple: 100, prodLeadTime: 28, qcDays: 5, intlLeadTime: 16, onTimeRate: 79, activeSku: 31, source: 'MRP 配置', updatedAt: '2026-07-25 14:03' },
  { id: 'SUP-05', supplier: '杭州智联', category: '穿戴', rating: 'B', moq: 500, cartonMultiple: 20, prodLeadTime: 30, qcDays: 6, intlLeadTime: 18, onTimeRate: 83, activeSku: 9, source: 'SCM', updatedAt: '2026-07-30 18:20' },
  { id: 'SUP-06', supplier: '宁波光影', category: '影像', rating: 'B', moq: 600, cartonMultiple: 24, prodLeadTime: 26, qcDays: 4, intlLeadTime: 13, onTimeRate: 86, activeSku: 7, source: 'MRP 配置', updatedAt: '2026-07-22 11:15' },
]
