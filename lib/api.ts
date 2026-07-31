// 数据访问层抽象
// -------------------------------------------------------------------
// 目前返回本地模拟数据。后续接入 FastAPI 时，只需将各函数内部替换为
// 对 `${API_BASE}/...` 的 fetch 调用即可，页面与组件无需改动。
//
// 示例：
//   const res = await fetch(`${API_BASE}/dashboard`, { cache: 'no-store' })
//   return res.json() as Promise<DashboardData>
// -------------------------------------------------------------------

import { dashboardData } from './mock-data'
import type { DashboardData } from './types'

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api'

// 模拟网络延迟，便于后续替换为真实请求
async function delay<T>(data: T, ms = 0): Promise<T> {
  if (ms > 0) await new Promise((r) => setTimeout(r, ms))
  return data
}

export async function getDashboard(): Promise<DashboardData> {
  // TODO(FastAPI): return fetch(`${API_BASE}/dashboard`).then(r => r.json())
  return delay(dashboardData)
}
