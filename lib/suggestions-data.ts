import type { Tone } from '@/lib/tone'

export type SuggestionType = '采购' | '集货' | '发运' | '到货' | '调拨'
export type AlertLevel = '正常' | '缺货' | '高库存' | '延迟'
export type AdjustStatus = '未调整' | '已调整' | '待复算'

export interface Suggestion {
  id: string
  spu: string
  sku: string
  productName: string
  country: string
  platform: string
  targetWarehouse: string
  planWeek: string
  beginInventory: number
  weekForecast: number
  weekArrival: number
  endInventory: number
  targetInventory: number
  rawDemand: number
  moq: number
  caseSize: number
  suggestQty: number
  orderWeek: string
  shipWeek: string
  onShelfWeek: string
  type: SuggestionType
  alert: AlertLevel
  adjustStatus: AdjustStatus
  supplier: string
  productLine: string
  purchaseOwner: string
}

export const suggestionTypeTone: Record<SuggestionType, Tone> = {
  采购: 'primary',
  集货: 'info',
  发运: 'mrp',
  到货: 'success',
  调拨: 'warning',
}

export const alertTone: Record<AlertLevel, Tone> = {
  正常: 'success',
  缺货: 'danger',
  高库存: 'warning',
  延迟: 'mrp',
}

export const adjustTone: Record<AdjustStatus, Tone> = {
  未调整: 'muted',
  已调整: 'primary',
  待复算: 'warning',
}

const countries = ['美国', '德国', '英国', '日本', '法国']
const platforms = ['Amazon', 'Temu', 'TikTok', 'eBay', '独立站']
const warehouses = ['US-East-01', 'US-West-02', 'DE-FRA-01', 'UK-LON-01', 'JP-TYO-01']
const suppliers = ['深圳智造', '宁波海通', '东莞精工', '苏州联创', '广州鑫源']
const lines = ['3C配件', '家居', '户外', '美妆个护', '宠物用品']
const owners = ['王磊', '李静', '陈晓', '赵敏']
const names = ['无线蓝牙耳机', '便携充电宝', '智能手表', '折叠收纳箱', 'LED 台灯', '瑜伽垫', '宠物饮水机', '车载支架']
const types: SuggestionType[] = ['采购', '集货', '发运', '到货', '调拨']

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

export const suggestions: Suggestion[] = Array.from({ length: 48 }).map((_, i) => {
  const begin = 200 + ((i * 37) % 900)
  const forecast = 120 + ((i * 53) % 600)
  const arrival = (i * 29) % 400
  const end = Math.max(0, begin + arrival - forecast)
  const target = 500 + ((i * 41) % 700)
  const raw = Math.max(0, target - end)
  const moq = pick([100, 200, 300, 500], i)
  const caseSize = pick([24, 48, 60, 100], i)
  const suggest = raw > 0 ? Math.ceil(raw / caseSize) * caseSize : 0
  const alert: AlertLevel = end < target * 0.3 ? '缺货' : end > target * 1.4 ? '高库存' : i % 9 === 0 ? '延迟' : '正常'
  const week = 24 + (i % 8)
  return {
    id: `SG-${String(i + 1).padStart(4, '0')}`,
    spu: `SPU${9000 + (i % 20)}`,
    sku: `SKU${100000 + i}`,
    productName: pick(names, i),
    country: pick(countries, i),
    platform: pick(platforms, i + 1),
    targetWarehouse: pick(warehouses, i),
    planWeek: `2026-W${week}`,
    beginInventory: begin,
    weekForecast: forecast,
    weekArrival: arrival,
    endInventory: end,
    targetInventory: target,
    rawDemand: raw,
    moq,
    caseSize,
    suggestQty: suggest,
    orderWeek: `2026-W${week - 6}`,
    shipWeek: `2026-W${week - 3}`,
    onShelfWeek: `2026-W${week}`,
    type: pick(types, i),
    alert,
    adjustStatus: pick<AdjustStatus>(['未调整', '未调整', '已调整', '待复算'], i),
    supplier: pick(suppliers, i),
    productLine: pick(lines, i),
    purchaseOwner: pick(owners, i),
  }
})

export const suggestionCalcTrace = [
  { step: '读取期初库存', value: '取快照 SNP-2026W24', note: '数据版本 v3 · 平台可用库存合并' },
  { step: '叠加在途到货', value: '+ 采购未交 / 物流在途', note: '按预计上架周分摊至周次' },
  { step: '扣减周度预测', value: '- 需求预测 FC-2026W24', note: '预测版本 v2 · 含促销加权' },
  { step: '计算目标库存', value: '目标库存天数 × 日均需求', note: '安全库存天数 14 天' },
  { step: '生成原始需求', value: '目标库存 - 预计期末库存', note: '负值截断为 0' },
  { step: 'MOQ / 箱规取整', value: '向上取整至箱规倍数', note: '并满足最小起订量' },
  { step: 'Lead Time 反推', value: '按总 LT 反推下单 / 发运周', note: '采购 LT + 头程 LT + 上架 LT' },
]
