// 计划任务领域模型 —— 后续接入 FastAPI 时，接口返回结构应与这些类型保持一致。

export type TaskStatus =
  | '草稿'
  | '待校验'
  | '校验失败'
  | '待计算'
  | '计算中'
  | '计算失败'
  | '待调整'
  | '调整中'
  | '待确认'
  | '已确认'
  | '已发布'
  | '已取消'

export type TaskStage =
  | '草稿'
  | '数据准备'
  | '数据校验'
  | '数据快照'
  | 'MRP计算'
  | '人工调整'
  | '待确认'
  | '已发布'

export type ValidationStatus = '未校验' | '校验中' | '校验通过' | '校验警告' | '校验失败'

export type Tone = 'muted' | 'primary' | 'mrp' | 'warning' | 'danger' | 'success'

// 计划范围
export interface TaskScope {
  countries: string[]
  platforms: string[]
  warehouses: string[]
  productScope: string // 例如 全部 SKU / 活动 SKU
}

// 输入数据版本
export interface DataVersion {
  type: string // 数据类型
  version: string
  dataDate: string
  rows: number
  importedBy: string
  importedAt: string
  validation: ValidationStatus
  expired: boolean
}

// 参数版本
export interface ParamVersion {
  type: string
  version: string
  coverage: number // 覆盖率百分比
  effectiveAt: string
  status: '生效中' | '待生效' | '已停用'
}

// 异常记录
export interface TaskException {
  id: string
  stage: TaskStage
  severity: 'critical' | 'warning' | 'info'
  category: string
  message: string
  target: string // 影响对象
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
  duration: string // 耗时
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

// 校验结果摘要
export interface ValidationSummary {
  passed: number
  blocking: number
  warnings: number
}

// 计划任务
export interface PlanTask {
  id: string // 任务编号
  name: string // 计划名称
  cycle: string // 计划周期，例如 2026 W31 - W51
  startWeek: string
  weeks: number
  scope: TaskScope
  dataVersionTag: string // 数据版本汇总标识
  paramVersionTag: string // 参数版本汇总标识
  validation: ValidationStatus
  validationSummary: ValidationSummary
  stage: TaskStage
  status: TaskStatus
  progress: number // 0-100，用于计算中/校验中
  progressLabel?: string // 例如 人工调整 24/37
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
  mine: boolean // 是否为“我的任务”
  dataVersions: DataVersion[]
  paramVersions: ParamVersion[]
  exceptions: TaskException[]
  logs: TaskLog[]
  flow: TaskFlowStep[]
}

// 状态 -> 展示元数据
export const taskStatusMeta: Record<TaskStatus, { tone: Tone }> = {
  草稿: { tone: 'muted' },
  待校验: { tone: 'warning' },
  校验失败: { tone: 'danger' },
  待计算: { tone: 'warning' },
  计算中: { tone: 'mrp' },
  计算失败: { tone: 'danger' },
  待调整: { tone: 'warning' },
  调整中: { tone: 'primary' },
  待确认: { tone: 'warning' },
  已确认: { tone: 'success' },
  已发布: { tone: 'success' },
  已取消: { tone: 'muted' },
}

export const validationMeta: Record<ValidationStatus, { tone: Tone }> = {
  未校验: { tone: 'muted' },
  校验中: { tone: 'primary' },
  校验通过: { tone: 'success' },
  校验警告: { tone: 'warning' },
  校验失败: { tone: 'danger' },
}

export const stageOrder: TaskStage[] = [
  '草稿',
  '数据准备',
  '数据校验',
  '数据快照',
  'MRP计算',
  '人工调整',
  '待确认',
  '已发布',
]
