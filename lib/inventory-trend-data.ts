import type { Tone } from '@/lib/tone'

export type TrendAlert = '正常' | '缺货' | '高库存'

export interface WeeklyTrendPoint {
  week: string
  startDate: string
  beginInventory: number
  forecast: number
  arrival: number
  endInventory: number
  targetInventory: number
  safetyInventory: number
  gap: number
  suggestQty: number
  alert: TrendAlert
}

export const trendAlertTone: Record<TrendAlert, Tone> = {
  正常: 'success',
  缺货: 'danger',
  高库存: 'warning',
}

const TARGET = 6000
const SAFETY = 3200

export const trendPoints: WeeklyTrendPoint[] = Array.from({ length: 21 }).map((_, i) => {
  const week = 24 + i
  const forecast = 3200 + Math.round(900 * Math.sin(i / 2.2)) + (i % 4) * 180
  const arrival = i % 3 === 0 ? 4200 + (i % 5) * 260 : 1800 + (i % 6) * 140
  const begin = i === 0 ? 5400 : 0 // recomputed below
  return {
    week: `W${week}`,
    startDate: `2026-06-${String(8 + i * 7 <= 30 ? 8 + i * 7 : ((8 + i * 7) % 30) + 1).padStart(2, '0')}`,
    beginInventory: begin,
    forecast,
    arrival,
    endInventory: 0,
    targetInventory: TARGET,
    safetyInventory: SAFETY,
    gap: 0,
    suggestQty: 0,
    alert: '正常',
  }
})

// chain begin/end inventory
let running = 5400
for (const p of trendPoints) {
  p.beginInventory = running
  p.endInventory = Math.max(0, p.beginInventory + p.arrival - p.forecast)
  p.gap = Math.max(0, p.safetyInventory - p.endInventory)
  p.suggestQty = p.endInventory < p.targetInventory ? Math.round((p.targetInventory - p.endInventory) / 100) * 100 : 0
  p.alert = p.endInventory < p.safetyInventory ? '缺货' : p.endInventory > p.targetInventory * 1.5 ? '高库存' : '正常'
  running = p.endInventory
}

export const trendSummary = {
  minWeek: trendPoints.reduce((m, p) => (p.endInventory < m.endInventory ? p : m), trendPoints[0]),
  shortageWeeks: trendPoints.filter((p) => p.alert === '缺货').length,
  overstockWeeks: trendPoints.filter((p) => p.alert === '高库存').length,
  totalSuggest: trendPoints.reduce((s, p) => s + p.suggestQty, 0),
}
