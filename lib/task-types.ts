// 计划任务领域模型 —— 数据全部来自 SCM 实时对接，不再有人工导入 / 数据版本选择。
// 后续接入 FastAPI 时，接口返回结构应与这些类型保持一致。

export type TaskStatus =
  | '草稿'
  | '待检查'
  | '检查失败'
  | '待计算'
  | '计算中'
  | '计算失败'
  | '计算完成'
  | '调整中'
  | '待确认'
  | '已确认'
  | '已发布'
  | '已取消'

// 计划任务流程阶段（与 MRP 正式流程一致）
export type TaskStage =
  | '草稿'
  | '数据检查'
  | '计算快照'
  | 'MRP计算'
  | '结果分析'
  | '人工调整'
  | '待确认'
  | '已发布'

// SCM 数据检查状态
export type CheckStatus = '未检查' | '检查中' | '检查通过' | '检查警告' | '检查失败'
// 兼容旧命名
export type ValidationStatus = CheckStatus

export type Tone = 'muted' | 'primary' | 'mrp' | 'warning' | 'danger' | 'success'

// SKU 选择方式
export type ProductMode = '全部' | '指定SKU' | '条件筛选'

// 计划范围（Task Scope）—— 平台 / 仓库不参与真实 MRP 引擎计算
export interface TaskScope {
  countries: string[]
  productMode: ProductMode
  productLines: string[]
  suppliers: string[]
  purchaseOwners: string[]
  skuList: string[] // 指定 SKU 时使用
  // 兼容旧组件（ScopeTags）——展示用，不进入引擎
  platforms: string[]
  warehouses: string[]
  productScope: string
}

// 引擎计算单元：Country + SKU。Task Scope 需先解析为 PlanningScope[]
export interface PlanningScope {
  country: string
  skuCount: number
  status: '就绪' | '待计算' | '计算中' | '计算完成' | '计算失败'
}

// SCM 实时数据检查项
export interface ScmDataCheck {
  source: string // Forecast / 国内库存 / 海外库存 / 采购在途 / 物流在途 / 商品主数据 / 供应商数据
  status: CheckStatus
  rows: number
  updatedAt: string
  issues: number
}

// 计划参数（真实 MRP 参数）
export interface PlanParamSet {
  safetyStockDays: number // 安全库存天数
  qcDays: number // QC 周期
  intlLeadTime: number // 国际物流时效
  cartonMultiple: number // 发运箱规倍数
}

// 独立展示的外部参数（来自 SCM 优先，MRP Supplier Config 兜底）
export interface ExternalParam {
  key: 'MOQ' | 'Production Lead Time'
  label: string
  value: string
  source: 'SCM' | 'MRP Supplier Config'
  fallback: boolean
}

// 异常记录
export interface TaskException {
  id: string
  stage: TaskStage
  severity: 'critical' | 'warning' | 'info'
  category: string
  message: string
  target: string
  occurredAt: string
  handleStatus: '待处理' | '处理中' | '已忽略' | '已解决'
  handler: string
}

// 执行日志
export interface TaskLog {
  id: string
  time: string
  operator: string
  action: string
  result: '成功' | '失败' | '警告' | '进行中'
  duration: string
}

// 流程步骤（任务详情概览）
export interface TaskFlowStep {
  key: string
  label: string
  status: 'done' | 'active' | 'pending' | 'failed'
  startedAt?: string
  finishedAt?: string
  duration?: string
  operator?: string
  exceptions: number
}

// 数据检查结果摘要
export interface ValidationSummary {
  passed: number
  blocking: number
  warnings: number
}

// 计划任务
export interface PlanTask {
  id: string
  name: string
  cycle: string
  startWeek: string
  weeks: number
  scope: TaskScope
  planningScopes: PlanningScope[] // Task Scope 解析出的引擎单元（Country+SKU）
  snapshotTag: string // 计算快照标识（来自 SCM 固化）
  paramVersionTag: string
  paramCoverage: number
  planParams: PlanParamSet
  externalParams: ExternalParam[]
  validation: CheckStatus
  validationSummary: ValidationSummary
  scmChecks: ScmDataCheck[]
  stage: TaskStage
  status: TaskStatus
  progress: number
  progressLabel?: string
  exceptionCount: number
  skuCount: number
  suggestionQty: number
  shortageSku: number
  overstockSku: number
  owner: string
  collaborators: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  mine: boolean
  exceptions: TaskException[]
  logs: TaskLog[]
  flow: TaskFlowStep[]
}

// 状态 -> 展示元数据
export const taskStatusMeta: Record<TaskStatus, { tone: Tone }> = {
  草稿: { tone: 'muted' },
  待检查: { tone: 'warning' },
  检查失败: { tone: 'danger' },
  待计算: { tone: 'warning' },
  计算中: { tone: 'mrp' },
  计算失败: { tone: 'danger' },
  计算完成: { tone: 'primary' },
  调整中: { tone: 'primary' },
  待确认: { tone: 'warning' },
  已确认: { tone: 'success' },
  已发布: { tone: 'success' },
  已取消: { tone: 'muted' },
}

export const validationMeta: Record<CheckStatus, { tone: Tone }> = {
  未检查: { tone: 'muted' },
  检查中: { tone: 'primary' },
  检查通过: { tone: 'success' },
  检查警告: { tone: 'warning' },
  检查失败: { tone: 'danger' },
}

export const stageOrder: TaskStage[] = [
  '草稿',
  '数据检查',
  '计算快照',
  'MRP计算',
  '结果分析',
  '人工调整',
  '待确认',
  '已发布',
]
