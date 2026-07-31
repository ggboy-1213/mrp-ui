import type { Tone } from '@/lib/tone'

export type VersionStatus = '草稿' | '计算完成' | '待确认' | '已发布' | '已归档'

export interface PlanVersion {
  id: string
  code: string
  task: string
  cycle: string
  dataSnapshot: string
  paramVersion: string
  skuCount: number
  replenishTotal: number
  shortageSku: number
  overstockSku: number
  adjustCount: number
  status: VersionStatus
  createdBy: string
  confirmedBy: string
  createdAt: string
  confirmedAt: string
}

export const versionStatusTone: Record<VersionStatus, Tone> = {
  草稿: 'muted',
  计算完成: 'primary',
  待确认: 'warning',
  已发布: 'success',
  已归档: 'muted',
}

const tasks = ['美国 Amazon 周度库存计划', '欧洲多平台补货计划', '日本市场滚动计划', '全球 3C 产品线计划']
const users = ['王磊', '李静', '陈晓', '赵敏']
const statuses: VersionStatus[] = ['已发布', '待确认', '计算完成', '草稿', '已归档']

function pick<T>(a: T[], i: number): T {
  return a[i % a.length]
}

export const planVersions: PlanVersion[] = Array.from({ length: 16 }).map((_, i) => {
  const week = 30 - i
  const status = pick(statuses, i)
  const confirmed = status === '已发布' || status === '已归档'
  return {
    id: `V-${String(i + 1).padStart(3, '0')}`,
    code: `MRP-2026W${week}-v${(i % 3) + 1}`,
    task: pick(tasks, i),
    cycle: `2026-W${week} ~ W${week + 20}`,
    dataSnapshot: `SNP-2026W${week}`,
    paramVersion: `PARAM-v${12 - (i % 5)}`,
    skuCount: 800 + ((i * 137) % 900),
    replenishTotal: 40000 + ((i * 3300) % 60000),
    shortageSku: (i * 7) % 40,
    overstockSku: (i * 5) % 25,
    adjustCount: (i * 11) % 60,
    status,
    createdBy: pick(users, i),
    confirmedBy: confirmed ? pick(users, i + 1) : '-',
    createdAt: `2026-06-${String(20 - (i % 18)).padStart(2, '0')} 09:${String((i * 7) % 60).padStart(2, '0')}`,
    confirmedAt: confirmed ? `2026-06-${String(21 - (i % 18)).padStart(2, '0')} 15:${String((i * 5) % 60).padStart(2, '0')}` : '-',
  }
})
