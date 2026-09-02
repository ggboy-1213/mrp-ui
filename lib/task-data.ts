import type {
  PlanTask,
  TaskStage,
  TaskStatus,
  CheckStatus,
  ScmDataCheck,
  PlanningScope,
  PlanParamSet,
  ExternalParam,
  TaskException,
  TaskLog,
  TaskFlowStep,
  ValidationSummary,
  TaskScope,
} from './task-types'
import { stageOrder } from './task-types'

// ---------------------------------------------------------------------------
// 计划任务模拟数据。数据均来自 SCM 实时对接，后续接入 FastAPI 时用 `${API_BASE}/tasks` 替换。
// ---------------------------------------------------------------------------

// SCM 实时数据源（不再有人工导入 / 数据版本）
const SCM_SOURCES = [
  'Forecast',
  '国内库存',
  '海外库存',
  '采购在途',
  '物流在途',
  '商品主数据',
  '供应商数据',
] as const

function buildScmChecks(seed: number, allValid: boolean, hasFail: boolean): ScmDataCheck[] {
  return SCM_SOURCES.map((source, i) => {
    let status: CheckStatus = '检查通过'
    let issues = 0
    if (!allValid) {
      if (hasFail && i === 5) {
        status = '检查失败'
        issues = 3
      } else if (i === 3) {
        status = '检查警告'
        issues = 2
      } else if (i === 6) {
        status = '检查警告'
        issues = 1
      }
    }
    return {
      source,
      status,
      rows: 1800 + i * 213 + seed * 31,
      updatedAt: `2026-07-31 0${6 + (i % 3)}:${(10 + i * 7) % 60 < 10 ? '0' : ''}${(10 + i * 7) % 60}`,
      issues,
    }
  })
}

function buildPlanningScopes(countries: string[], skuCount: number, stage: TaskStage): PlanningScope[] {
  const per = Math.max(1, Math.round(skuCount / Math.max(1, countries.length)))
  const engineStatus: PlanningScope['status'] =
    stage === '已发布' || stage === '待确认' || stage === '人工调整' || stage === '结果分析'
      ? '计算完成'
      : stage === 'MRP计算'
      ? '计算中'
      : stage === '计算快照'
      ? '待计算'
      : '就绪'
  return countries.map((country, i) => ({
    country,
    skuCount: i === countries.length - 1 ? skuCount - per * (countries.length - 1) : per,
    status: engineStatus,
  }))
}

function buildPlanParams(seed: number): PlanParamSet {
  return {
    safetyStockDays: 14 + (seed % 3) * 2,
    qcDays: 2 + (seed % 2),
    intlLeadTime: 22 + (seed % 4) * 3,
    cartonMultiple: [24, 48, 60][seed % 3],
  }
}

function buildExternalParams(seed: number): ExternalParam[] {
  const fallbackMoq = seed % 3 === 0
  const fallbackLt = seed % 4 === 0
  return [
    {
      key: 'MOQ',
      label: '最小起订量',
      value: `${[100, 200, 300][seed % 3]} 件`,
      source: fallbackMoq ? 'MRP Supplier Config' : 'SCM',
      fallback: fallbackMoq,
    },
    {
      key: 'Production Lead Time',
      label: '生产提前期',
      value: `${18 + (seed % 5) * 2} 天`,
      source: fallbackLt ? 'MRP Supplier Config' : 'SCM',
      fallback: fallbackLt,
    },
  ]
}

function buildExceptions(stage: TaskStage, count: number): TaskException[] {
  const templates: Omit<TaskException, 'id' | 'occurredAt'>[] = [
    { stage: '数据检查', severity: 'critical', category: '主数据缺失', message: 'SKU 缺少箱规主数据，无法执行取整', target: 'SK-104205 等 3 个 SKU', handleStatus: '待处理', handler: '孙倩' },
    { stage: '数据检查', severity: 'critical', category: '供应商参数缺失', message: '供应商数据未同步 MOQ 与生产提前期', target: 'SP-4521 / 深圳智造', handleStatus: '处理中', handler: '赵磊' },
    { stage: '数据检查', severity: 'warning', category: '数据延迟', message: '海外库存快照较 SCM 主库延迟 3 小时', target: 'US-West 全仓', handleStatus: '待处理', handler: '赵磊' },
    { stage: '数据检查', severity: 'warning', category: 'Forecast 缺口', message: '18 个 SKU 缺少本周预测数据', target: '预测 W31', handleStatus: '已忽略', handler: '孙倩' },
    { stage: 'MRP计算', severity: 'warning', category: 'LT 异常', message: '采购 LT 由 25 天跳变至 46 天', target: 'SP-4521', handleStatus: '待处理', handler: '陈曦' },
    { stage: '结果分析', severity: 'info', category: '参数默认', message: '18 个 SKU 使用默认安全库存天数', target: '欧洲区 SKU', handleStatus: '已解决', handler: '李航' },
  ]
  return Array.from({ length: count }).map((_, i) => {
    const t = templates[i % templates.length]
    return {
      ...t,
      id: `EX-${stage}-${1000 + i}`,
      occurredAt: `2026-07-31 1${i % 6}:${10 + i * 3}`,
    }
  })
}

function buildLogs(stage: TaskStage, status: TaskStatus): TaskLog[] {
  const base: Omit<TaskLog, 'id'>[] = [
    { time: '2026-07-31 08:20:11', operator: '李航', action: '创建计划任务', result: '成功', duration: '0.4s' },
    { time: '2026-07-31 08:21:03', operator: '系统', action: '拉取 SCM 实时数据（7 类）', result: '成功', duration: '2.6s' },
    { time: '2026-07-31 08:22:40', operator: '系统', action: 'SCM 数据检查开始', result: '进行中', duration: '-' },
    { time: '2026-07-31 08:24:10', operator: '系统', action: 'SCM 数据检查完成', result: status === '检查失败' ? '失败' : '警告', duration: '1m30s' },
  ]
  const extra: Omit<TaskLog, 'id'>[] = [
    { time: '2026-07-31 08:25:02', operator: '系统', action: '固化计算快照 SNP-20260731', result: '成功', duration: '4.1s' },
    { time: '2026-07-31 08:26:00', operator: '系统', action: '解析计划范围为 Country+SKU 引擎单元', result: '成功', duration: '0.8s' },
    { time: '2026-07-31 08:26:40', operator: '系统', action: '批量 MRP 计算开始', result: '进行中', duration: '-' },
    { time: '2026-07-31 08:34:22', operator: '系统', action: '批量 MRP 计算完成', result: status === '计算失败' ? '失败' : '成功', duration: '8m22s' },
    { time: '2026-07-31 09:10:15', operator: '张伟', action: '人工调整补货建议 24 项', result: '成功', duration: '-' },
    { time: '2026-07-31 09:40:08', operator: '李航', action: '提交确认', result: '成功', duration: '0.6s' },
    { time: '2026-07-31 09:41:00', operator: '李航', action: '发布计划版本 V-2026W31', result: '成功', duration: '2.3s' },
  ]
  const stageIdx = stageOrder.indexOf(stage)
  const count = Math.min(base.length + Math.max(0, stageIdx - 1), base.length + extra.length)
  const all = [...base, ...extra].slice(0, count)
  return all.map((l, i) => ({ ...l, id: `LOG-${1000 + i}` }))
}

function buildFlow(stage: TaskStage, exceptionCount: number, failed: boolean): TaskFlowStep[] {
  const labels: { key: string; label: string }[] = [
    { key: 'check', label: 'SCM 数据检查' },
    { key: 'snapshot', label: '计算快照' },
    { key: 'calculate', label: '批量 MRP 计算' },
    { key: 'analyze', label: '结果分析' },
    { key: 'adjust', label: '人工调整' },
    { key: 'confirm', label: '确认发布' },
  ]
  const stageToFlow: Record<TaskStage, number> = {
    草稿: 0,
    数据检查: 0,
    计算快照: 1,
    MRP计算: 2,
    结果分析: 3,
    人工调整: 4,
    待确认: 5,
    已发布: 6,
  }
  const activeIdx = stageToFlow[stage]
  return labels.map((l, i) => {
    let status: TaskFlowStep['status'] = 'pending'
    if (i < activeIdx) status = 'done'
    else if (i === activeIdx) status = failed ? 'failed' : 'active'
    return {
      ...l,
      status,
      startedAt: i <= activeIdx ? `07-31 08:${20 + i * 2}` : undefined,
      finishedAt: i < activeIdx ? `07-31 08:${21 + i * 2}` : undefined,
      duration: i < activeIdx ? `${1 + i}m${10 + i}s` : undefined,
      operator: i <= activeIdx ? ['李航', '系统', '系统', '系统', '张伟', '李航'][i] : undefined,
      exceptions: i === 0 ? exceptionCount : 0,
    }
  })
}

// 精简的 seed scope（仅保留业务字段），最终 normalize 为完整 TaskScope
interface SeedScope {
  countries: string[]
  productMode: TaskScope['productMode']
  productLines: string[]
  suppliers?: string[]
  purchaseOwners?: string[]
}

function normalizeScope(s: SeedScope): TaskScope {
  const productScope =
    s.productMode === '全部' ? '全部 SKU' : s.productMode === '指定SKU' ? '指定 SKU' : '条件筛选 SKU'
  return {
    countries: s.countries,
    productMode: s.productMode,
    productLines: s.productLines,
    suppliers: s.suppliers ?? [],
    purchaseOwners: s.purchaseOwners ?? [],
    skuList: [],
    platforms: [],
    warehouses: [],
    productScope,
  }
}

interface TaskSeed {
  id: string
  name: string
  startWeek: string
  weeks: number
  scope: SeedScope
  stage: TaskStage
  status: TaskStatus
  validation: CheckStatus
  validationSummary: ValidationSummary
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
}

const seeds: TaskSeed[] = [
  {
    id: 'TSK-20260731-01', name: '2026 W31 美国区周度库存计划', startWeek: '2026 W31', weeks: 21,
    scope: { countries: ['美国'], productMode: '全部', productLines: ['3C 数码', '家居生活'] },
    stage: 'MRP计算', status: '计算中', validation: '检查通过', validationSummary: { passed: 6, blocking: 0, warnings: 1 },
    progress: 68, exceptionCount: 3, skuCount: 642, suggestionQty: 186300, shortageSku: 28, overstockSku: 15,
    owner: '李航', collaborators: ['张伟', '陈曦'], createdBy: '李航', createdAt: '2026-07-31 08:20', updatedAt: '2026-07-31 08:34', mine: true,
  },
  {
    id: 'TSK-20260731-02', name: '2026 W31 欧洲多国补货计划', startWeek: '2026 W31', weeks: 21,
    scope: { countries: ['德国', '英国', '法国'], productMode: '条件筛选', productLines: ['3C 数码'], suppliers: ['深圳智造'] },
    stage: '数据检查', status: '检查失败', validation: '检查失败', validationSummary: { passed: 4, blocking: 3, warnings: 2 },
    progress: 100, progressLabel: '检查失败', exceptionCount: 5, skuCount: 528, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '张伟', collaborators: ['孙倩'], createdBy: '张伟', createdAt: '2026-07-31 07:50', updatedAt: '2026-07-31 08:12', mine: false,
  },
  {
    id: 'TSK-20260731-03', name: '2026 W32 加拿大区滚动计划', startWeek: '2026 W32', weeks: 21,
    scope: { countries: ['加拿大'], productMode: '全部', productLines: ['户外运动'] },
    stage: '草稿', status: '草稿', validation: '未检查', validationSummary: { passed: 0, blocking: 0, warnings: 0 },
    progress: 0, exceptionCount: 0, skuCount: 214, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '李航', collaborators: [], createdBy: '李航', createdAt: '2026-07-31 09:05', updatedAt: '2026-07-31 09:05', mine: true,
  },
  {
    id: 'TSK-20260730-04', name: 'Prime Day 活动备货专项计划', startWeek: '2026 W28', weeks: 12,
    scope: { countries: ['美国', '英国', '德国'], productMode: '指定SKU', productLines: ['3C 数码', '家居生活'] },
    stage: '人工调整', status: '计算完成', validation: '检查警告', validationSummary: { passed: 5, blocking: 0, warnings: 2 },
    progress: 0, progressLabel: '人工调整 24/37', exceptionCount: 2, skuCount: 372, suggestionQty: 98600, shortageSku: 19, overstockSku: 8,
    owner: '陈曦', collaborators: ['李航', '王敏'], createdBy: '陈曦', createdAt: '2026-07-30 14:20', updatedAt: '2026-07-31 09:10', mine: true,
  },
  {
    id: 'TSK-20260730-05', name: '美国区新品补货计划', startWeek: '2026 W31', weeks: 16,
    scope: { countries: ['美国'], productMode: '条件筛选', productLines: ['3C 数码'], purchaseOwners: ['海外采购组'] },
    stage: 'MRP计算', status: '计算失败', validation: '检查通过', validationSummary: { passed: 7, blocking: 0, warnings: 0 },
    progress: 42, progressLabel: '计算失败', exceptionCount: 1, skuCount: 156, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '王敏', collaborators: ['李航'], createdBy: '王敏', createdAt: '2026-07-30 16:40', updatedAt: '2026-07-30 17:02', mine: false,
  },
  {
    id: 'TSK-20260730-06', name: '2026 W30 全球多国周度计划', startWeek: '2026 W30', weeks: 21,
    scope: { countries: ['美国', '德国', '英国', '法国', '日本'], productMode: '全部', productLines: ['3C 数码', '家居生活', '户外运动', '美妆个护'] },
    stage: '已发布', status: '已发布', validation: '检查通过', validationSummary: { passed: 7, blocking: 0, warnings: 0 },
    progress: 100, progressLabel: '已发布', exceptionCount: 0, skuCount: 1284, suggestionQty: 486300, shortageSku: 63, overstockSku: 41,
    owner: '李航', collaborators: ['张伟', '陈曦', '王敏'], createdBy: '李航', createdAt: '2026-07-24 09:05', updatedAt: '2026-07-24 16:40', mine: true,
  },
  {
    id: 'TSK-20260729-07', name: '2026 W31 日本区滚动补货计划', startWeek: '2026 W31', weeks: 21,
    scope: { countries: ['日本'], productMode: '全部', productLines: ['美妆个护', '家居生活'] },
    stage: '待确认', status: '待确认', validation: '检查通过', validationSummary: { passed: 6, blocking: 0, warnings: 1 },
    progress: 100, progressLabel: '等待确认', exceptionCount: 1, skuCount: 288, suggestionQty: 72400, shortageSku: 11, overstockSku: 6,
    owner: '陈曦', collaborators: ['李航'], createdBy: '陈曦', createdAt: '2026-07-29 10:20', updatedAt: '2026-07-31 08:50', mine: true,
  },
  {
    id: 'TSK-20260729-08', name: '2026 W31 清仓专项计划', startWeek: '2026 W31', weeks: 8,
    scope: { countries: ['美国', '德国'], productMode: '指定SKU', productLines: ['家居生活'] },
    stage: '数据检查', status: '待检查', validation: '未检查', validationSummary: { passed: 0, blocking: 0, warnings: 0 },
    progress: 0, progressLabel: '待检查', exceptionCount: 0, skuCount: 132, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '张伟', collaborators: [], createdBy: '张伟', createdAt: '2026-07-29 15:30', updatedAt: '2026-07-29 15:30', mine: false,
  },
  {
    id: 'TSK-20260728-09', name: '2026 W30 欧洲区补货计划', startWeek: '2026 W30', weeks: 21,
    scope: { countries: ['德国', '英国', '法国'], productMode: '全部', productLines: ['3C 数码', '户外运动'] },
    stage: '计算快照', status: '待计算', validation: '检查通过', validationSummary: { passed: 6, blocking: 0, warnings: 1 },
    progress: 0, progressLabel: '待计算', exceptionCount: 1, skuCount: 496, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '李航', collaborators: ['王敏'], createdBy: '李航', createdAt: '2026-07-28 09:15', updatedAt: '2026-07-31 07:40', mine: true,
  },
  {
    id: 'TSK-20260728-10', name: '2026 W29 美西区专项计划', startWeek: '2026 W29', weeks: 10,
    scope: { countries: ['美国'], productMode: '条件筛选', productLines: ['宠物用品'], suppliers: ['东莞精密'] },
    stage: '人工调整', status: '调整中', validation: '检查警告', validationSummary: { passed: 5, blocking: 0, warnings: 2 },
    progress: 0, progressLabel: '人工调整 12/28', exceptionCount: 2, skuCount: 208, suggestionQty: 44200, shortageSku: 14, overstockSku: 5,
    owner: '王敏', collaborators: ['陈曦'], createdBy: '王敏', createdAt: '2026-07-28 11:00', updatedAt: '2026-07-31 09:20', mine: false,
  },
  {
    id: 'TSK-20260724-11', name: '2026 W29 全球多国周度计划', startWeek: '2026 W29', weeks: 21,
    scope: { countries: ['美国', '德国', '英国', '法国', '日本'], productMode: '全部', productLines: ['3C 数码', '家居生活', '户外运动'] },
    stage: '待确认', status: '已确认', validation: '检查通过', validationSummary: { passed: 7, blocking: 0, warnings: 0 },
    progress: 100, progressLabel: '已确认', exceptionCount: 0, skuCount: 1263, suggestionQty: 471200, shortageSku: 58, overstockSku: 39,
    owner: '张伟', collaborators: ['李航', '陈曦'], createdBy: '张伟', createdAt: '2026-07-17 08:50', updatedAt: '2026-07-17 15:20', mine: false,
  },
  {
    id: 'TSK-20260717-12', name: '2026 W28 美国区周度计划', startWeek: '2026 W28', weeks: 21,
    scope: { countries: ['美国'], productMode: '全部', productLines: ['3C 数码', '家居生活'] },
    stage: '已发布', status: '已取消', validation: '检查通过', validationSummary: { passed: 6, blocking: 0, warnings: 1 },
    progress: 100, progressLabel: '已取消', exceptionCount: 0, skuCount: 642, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '陈曦', collaborators: [], createdBy: '陈曦', createdAt: '2026-07-10 10:10', updatedAt: '2026-07-11 09:30', mine: false,
  },
]

export const taskList: PlanTask[] = seeds.map((s, idx) => {
  const failed = s.status === '检查失败' || s.status === '计算失败'
  const allValid = s.validation === '检查通过'
  const startNum = parseInt(s.startWeek.split('W')[1])
  const endNum = startNum + s.weeks - 1 > 52 ? startNum + s.weeks - 1 - 52 : startNum + s.weeks - 1
  const scope = normalizeScope(s.scope)
  return {
    ...s,
    scope,
    cycle: `${s.startWeek} - W${endNum}`,
    planningScopes: buildPlanningScopes(s.scope.countries, s.skuCount, s.stage),
    snapshotTag: allValid && s.stage !== '草稿' && s.stage !== '数据检查' ? `SNP-${s.startWeek.replace(/\s/g, '')}` : '—',
    paramVersionTag: `PM-${2026}.${8 + (idx % 3)}`,
    paramCoverage: idx === 3 ? 92.4 : idx === 1 ? 95.1 : 98.6,
    planParams: buildPlanParams(idx),
    externalParams: buildExternalParams(idx),
    scmChecks: buildScmChecks(idx, allValid, s.status === '检查失败'),
    exceptions: buildExceptions(s.stage, s.exceptionCount),
    logs: buildLogs(s.stage, s.status),
    flow: buildFlow(s.stage, s.exceptionCount, failed),
  }
})

export function getTaskById(id: string): PlanTask | undefined {
  return taskList.find((t) => t.id === id)
}

// 新建向导参考数据
export const wizardReference = {
  countries: ['美国', '加拿大', '德国', '英国', '法国', '日本', '澳大利亚'],
  productLines: ['3C 数码', '家居生活', '户外运动', '美妆个护', '宠物用品'],
  suppliers: ['深圳智造', '东莞精密', '宁波五金', '苏州电子'],
  purchaseOwners: ['采购一组', '采购二组', '海外采购组'],
  owners: ['李航', '张伟', '陈曦', '王敏'],
  scmSources: SCM_SOURCES.map((source, i) => ({
    source,
    status: (i === 5 ? '检查警告' : '检查通过') as CheckStatus,
    rows: 1800 + i * 213,
    updatedAt: `2026-07-31 0${6 + (i % 3)}:${(10 + i * 7) % 60 < 10 ? '0' : ''}${(10 + i * 7) % 60}`,
    issues: i === 5 ? 1 : 0,
  })),
  planParams: {
    safetyStockDays: 14,
    qcDays: 2,
    intlLeadTime: 25,
    cartonMultiple: 48,
  } as PlanParamSet,
  externalParams: [
    { key: 'MOQ', label: '最小起订量', value: '200 件', source: 'SCM', fallback: false },
    { key: 'Production Lead Time', label: '生产提前期', value: '20 天', source: 'MRP Supplier Config', fallback: true },
  ] as ExternalParam[],
}

// 数据检查步骤（用于进度弹窗）
export const validationSteps = [
  '拉取 SCM 实时数据',
  '检查 Forecast 完整性',
  '检查国内 / 海外库存',
  '检查采购与物流在途',
  '检查商品主数据',
  '检查供应商参数',
  '生成数据检查结果',
]

export const calculationSteps = [
  '固化计算快照',
  '解析计划范围为 Country+SKU',
  '加载需求数据',
  '加载库存与供应数据',
  '计算供需平衡',
  '计算库存缺口',
  '生成补货需求',
  '执行 MOQ 和箱规取整',
  '反推采购和物流时间',
  '保存计算结果',
]
