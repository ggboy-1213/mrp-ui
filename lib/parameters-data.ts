import type { Tone } from "@/lib/tone"

export interface ParamVersion {
  id: string
  version: string
  name: string
  scope: string
  status: "生效中" | "草稿" | "已归档"
  coverage: number
  createdBy: string
  createdAt: string
}

export interface ParamRule {
  id: string
  group: string
  scope: string
  key: string
  label: string
  value: string
  unit: string
  source: "全局默认" | "维度覆盖" | "SKU 覆盖"
}

export const PARAM_STATUS_TONE: Record<ParamVersion["status"], Tone> = {
  生效中: "success",
  草稿: "warning",
  已归档: "neutral",
}

export const PARAM_VERSIONS: ParamVersion[] = [
  { id: "PV-2026-07", version: "PARAM-2026W24-v3", name: "夏季旺季参数", scope: "全平台 / 全仓", status: "生效中", coverage: 98, createdBy: "李航", createdAt: "2026-07-18 10:22" },
  { id: "PV-2026-06", version: "PARAM-2026W20-v2", name: "常规参数", scope: "全平台 / 全仓", status: "已归档", coverage: 96, createdBy: "王敏", createdAt: "2026-06-12 09:40" },
  { id: "PV-2026-08", version: "PARAM-2026W28-v1", name: "促销备货参数(草稿)", scope: "US / Amazon", status: "草稿", coverage: 62, createdBy: "陈婷", createdAt: "2026-07-22 16:05" },
]

export const PARAM_RULES: ParamRule[] = [
  { id: "PR-01", group: "安全库存策略", scope: "全局默认", key: "safety_stock_days", label: "安全库存天数", value: "14", unit: "天", source: "全局默认" },
  { id: "PR-02", group: "安全库存策略", scope: "US / Amazon", key: "safety_stock_days", label: "安全库存天数", value: "21", unit: "天", source: "维度覆盖" },
  { id: "PR-03", group: "安全库存策略", scope: "SKU-100231", key: "safety_stock_days", label: "安全库存天数", value: "28", unit: "天", source: "SKU 覆盖" },
  { id: "PR-04", group: "服务水平", scope: "全局默认", key: "service_level", label: "目标服务水平", value: "95", unit: "%", source: "全局默认" },
  { id: "PR-05", group: "服务水平", scope: "DE / 全平台", key: "service_level", label: "目标服务水平", value: "92", unit: "%", source: "维度覆盖" },
  { id: "PR-06", group: "补货约束", scope: "全局默认", key: "moq", label: "最小起订量 (MOQ)", value: "500", unit: "个", source: "全局默认" },
  { id: "PR-07", group: "补货约束", scope: "全局默认", key: "round_to", label: "补货取整", value: "100", unit: "个/箱", source: "全局默认" },
  { id: "PR-08", group: "提前期", scope: "全局默认", key: "lead_time_buffer", label: "提前期缓冲", value: "5", unit: "天", source: "全局默认" },
  { id: "PR-09", group: "提前期", scope: "海运", key: "lead_time_buffer", label: "提前期缓冲", value: "10", unit: "天", source: "维度覆盖" },
  { id: "PR-10", group: "计算范围", scope: "全局默认", key: "horizon_weeks", label: "计划周期", value: "21", unit: "周", source: "全局默认" },
]

export const PARAM_GROUPS = ["安全库存策略", "服务水平", "补货约束", "提前期", "计算范围"]
