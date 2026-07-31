import type { Tone } from "@/lib/tone"

/* ---------------- Data import ---------------- */
export interface DataSource {
  id: string
  name: string
  type: "ERP" | "接口" | "表格" | "SCM"
  cadence: string
  lastSync: string
  status: "正常" | "延迟" | "失败"
  rows: number
}

export interface ImportBatch {
  id: string
  source: string
  fileType: "接口" | "Excel" | "CSV"
  rows: number
  success: number
  failed: number
  status: "已完成" | "进行中" | "部分失败" | "失败"
  operator: string
  startedAt: string
  duration: string
}

export const SOURCE_STATUS_TONE: Record<DataSource["status"], Tone> = {
  正常: "success",
  延迟: "warning",
  失败: "danger",
}

export const IMPORT_STATUS_TONE: Record<ImportBatch["status"], Tone> = {
  已完成: "success",
  进行中: "info",
  部分失败: "warning",
  失败: "danger",
}

export const DATA_SOURCES: DataSource[] = [
  { id: "DS-01", name: "销售预测 (运营)", type: "接口", cadence: "每日 02:00", lastSync: "2026-07-31 02:04", status: "正常", rows: 12840 },
  { id: "DS-02", name: "期初库存 (ERP)", type: "ERP", cadence: "每日 01:30", lastSync: "2026-07-31 01:36", status: "正常", rows: 9620 },
  { id: "DS-03", name: "平台库存 (Amazon)", type: "接口", cadence: "每 4 小时", lastSync: "2026-07-31 00:12", status: "延迟", rows: 7410 },
  { id: "DS-04", name: "采购在途 (SCM)", type: "SCM", cadence: "每日 03:00", lastSync: "2026-07-31 03:08", status: "正常", rows: 1280 },
  { id: "DS-05", name: "物流时效 (物流商)", type: "表格", cadence: "手动上传", lastSync: "2026-07-30 18:22", status: "正常", rows: 640 },
  { id: "DS-06", name: "退货数据 (仓库)", type: "接口", cadence: "每日 04:00", lastSync: "2026-07-31 04:15", status: "失败", rows: 0 },
]

export const IMPORT_BATCHES: ImportBatch[] = Array.from({ length: 12 }).map((_, i) => {
  const rows = 1200 + i * 340
  const failed = i % 4 === 0 ? Math.round(rows * 0.03) : i % 7 === 0 ? Math.round(rows * 0.12) : 0
  const status: ImportBatch["status"] = i === 1 ? "进行中" : failed === 0 ? "已完成" : failed > rows * 0.1 ? "失败" : "部分失败"
  return {
    id: `IMP-2026073${i % 2}-${(120 + i).toString()}`,
    source: DATA_SOURCES[i % DATA_SOURCES.length].name,
    fileType: (["接口", "Excel", "CSV"] as const)[i % 3],
    rows,
    success: rows - failed,
    failed,
    status,
    operator: ["系统调度", "李航", "王敏", "陈婷"][i % 4],
    startedAt: `2026-07-3${i % 2} ${(8 + (i % 12)).toString().padStart(2, "0")}:${(10 + i).toString().padStart(2, "0")}`,
    duration: `${(1 + (i % 5))}m ${(10 + i * 3) % 60}s`,
  }
})

/* ---------------- Data validation ---------------- */
export interface ValidationRule {
  id: string
  name: string
  category: "完整性" | "一致性" | "合理性" | "唯一性"
  target: string
  severity: "阻断" | "警告" | "提示"
  passed: number
  failed: number
  status: "通过" | "警告" | "失败"
}

export interface ValidationIssue {
  id: string
  rule: string
  sku: string
  scope: string
  detail: string
  severity: "阻断" | "警告" | "提示"
  suggestion: string
}

export const VALIDATION_SEVERITY_TONE: Record<ValidationRule["severity"], Tone> = {
  阻断: "danger",
  警告: "warning",
  提示: "info",
}

export const VALIDATION_RULES: ValidationRule[] = [
  { id: "VR-01", name: "预测数量非空", category: "完整性", target: "需求预测", severity: "阻断", passed: 12780, failed: 60, status: "失败" },
  { id: "VR-02", name: "SKU 主数据存在", category: "一致性", target: "全部输入", severity: "阻断", passed: 12812, failed: 28, status: "失败" },
  { id: "VR-03", name: "库存数量 ≥ 0", category: "合理性", target: "期初库存", severity: "警告", passed: 9615, failed: 5, status: "警告" },
  { id: "VR-04", name: "映射关系唯一", category: "唯一性", target: "映射关系", severity: "警告", passed: 1394, failed: 6, status: "警告" },
  { id: "VR-05", name: "提前期在合理区间", category: "合理性", target: "供应物流", severity: "提示", passed: 1276, failed: 4, status: "警告" },
  { id: "VR-06", name: "参数覆盖完整", category: "完整性", target: "计划参数", severity: "提示", passed: 1284, failed: 0, status: "通过" },
]

export const VALIDATION_ISSUES: ValidationIssue[] = [
  { id: "VI-01", rule: "预测数量非空", sku: "SKU-100231", scope: "US / Amazon", detail: "W28 预测数量缺失", severity: "阻断", suggestion: "回退至上一预测版本或人工补录" },
  { id: "VI-02", rule: "SKU 主数据存在", sku: "SKU-999812", scope: "DE / Temu", detail: "渠道 SKU 无内部映射", severity: "阻断", suggestion: "在映射关系中补充映射" },
  { id: "VI-03", rule: "库存数量 ≥ 0", sku: "SKU-100455", scope: "US-西部仓", detail: "库存为 -12", severity: "警告", suggestion: "核对仓库快照时间" },
  { id: "VI-04", rule: "映射关系唯一", sku: "SKU-100892", scope: "UK / eBay", detail: "存在 2 条冲突映射", severity: "警告", suggestion: "保留最新映射并停用旧记录" },
  { id: "VI-05", rule: "提前期在合理区间", sku: "SKU-101340", scope: "空运", detail: "提前期 2 天低于下限", severity: "提示", suggestion: "确认物流商时效数据" },
]

/* ---------------- Alerts ---------------- */
export interface AlertRow {
  id: string
  type: "缺货风险" | "高库存" | "到货延迟" | "数据异常" | "参数缺失"
  sku: string
  scope: string
  level: "高" | "中" | "低"
  metric: string
  status: "待处理" | "处理中" | "已忽略" | "已解决"
  owner: string
  createdAt: string
}

export const ALERT_LEVEL_TONE: Record<AlertRow["level"], Tone> = {
  高: "danger",
  中: "warning",
  低: "info",
}

export const ALERT_STATUS_TONE: Record<AlertRow["status"], Tone> = {
  待处理: "danger",
  处理中: "warning",
  已忽略: "neutral",
  已解决: "success",
}

const types = ["缺货风险", "高库存", "到货延迟", "数据异常", "参数缺失"] as const
export const ALERT_ROWS: AlertRow[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `ALT-${(2201 + i).toString()}`,
  type: types[i % types.length],
  sku: `SKU-1002${(31 + (i % 12)).toString().padStart(2, "0")}`,
  scope: ["US / Amazon", "DE / Temu", "UK / eBay", "JP / Amazon"][i % 4],
  level: (["高", "中", "低"] as const)[i % 3],
  metric: ["预计缺货 3 周", "库存 DOS 96 天", "延误 5 天", "预测缺失", "MOQ 未配置"][i % 5],
  status: (["待处理", "处理中", "已忽略", "已解决"] as const)[i % 4],
  owner: ["李航", "王敏", "陈婷", "赵磊"][i % 4],
  createdAt: `2026-07-3${i % 2} ${(8 + (i % 12)).toString().padStart(2, "0")}:${(10 + i).toString().padStart(2, "0")}`,
}))

export const ALERT_STATS: StatTileSeed[] = [
  { key: "shortage", label: "缺货风险", value: 8, tone: "danger" },
  { key: "overstock", label: "高库存", value: 5, tone: "warning" },
  { key: "delay", label: "到货延迟", value: 3, tone: "warning" },
  { key: "pending", label: "待处理", value: 11, tone: "primary" },
]

interface StatTileSeed {
  key: string
  label: string
  value: number
  tone: Tone
}
