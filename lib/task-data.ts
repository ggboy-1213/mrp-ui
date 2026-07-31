import type {
  PlanTask,
  TaskStage,
  TaskStatus,
  ValidationStatus,
  DataVersion,
  ParamVersion,
  TaskException,
  TaskLog,
  TaskFlowStep,
  ValidationSummary,
} from './task-types'
import { stageOrder } from './task-types'

// ---------------------------------------------------------------------------
// 计划任务模拟数据。后续接入 FastAPI 时，用 `${API_BASE}/tasks` 的返回替换即可。
// ---------------------------------------------------------------------------

const DATA_TYPES = [
  '需求预测',
  '库存快照',
  '订单占用',
  '可用退货',
  '采购未交',
  '物流在途',
  '预计上架',
  '主数据',
] as const

const PARAM_TYPES = [
  '库存策略',
  'MOQ',
  '箱规',
  '采购 Lead Time',
  '物流 Lead Time',
  '仓库映射',
  '计划日历',
] as const

function buildDataVersions(seed: number, allValid: boolean, hasFail: boolean): DataVersion[] {
  return DATA_TYPES.map((type, i) => {
    let validation: ValidationStatus = '校验通过'
    let expired = false
    if (!allValid) {
      if (hasFail && i === 1) validation = '校验失败'
      else if (i === 4) validation = '校验警告'
      else if (i === 7) {
        validation = '未校验'
        expired = true
      }
    }
    return {
      type,
      version: `v${2026}.${30 + (seed % 4)}.${i + 1}`,
      dataDate: `2026-07-${20 + (i % 8)}`,
      rows: 1200 + i * 137 + seed * 11,
      importedBy: ['孙倩', '赵磊', '王敏', '陈曦'][i % 4],
      importedAt: `2026-07-${25 + (i % 4)} 0${8 + (i % 2)}:${10 + i}`,
      validation,
      expired,
    }
  })
}

function buildParamVersions(seed: number): ParamVersion[] {
  return PARAM_TYPES.map((type, i) => ({
    type,
    version: `P${2026}.${8 + (seed % 3)}.${i + 1}`,
    coverage: i === 3 ? 92.4 : i === 5 ? 96.1 : 98.6 + (i % 2 ? 0.8 : 0),
    effectiveAt: `2026-07-${10 + i}`,
    status: i === 6 ? '待生效' : '生效中',
  }))
}

function buildExceptions(stage: TaskStage, count: number): TaskException[] {
  const templates: Omit<TaskException, 'id' | 'occurredAt'>[] = [
    { stage: '数据校验', severity: 'critical', category: '主数据缺失', message: 'SKU 缺少箱规主数据，无法执行取整', target: 'SK-104205 等 3 个 SKU', handleStatus: '待处理', handler: '孙倩' },
    { stage: '数据校验', severity: 'critical', category: '映射缺失', message: '平台仓与物理仓映射未配置', target: 'DE-FRA / TikTok', handleStatus: '处理中', handler: '赵磊' },
    { stage: '数据校验', severity: 'warning', category: '数据过期', message: '库存快照已过期 3 天', target: 'US-West 全仓', handleStatus: '待处理', handler: '赵磊' },
    { stage: '数据校验', severity: 'warning', category: '重复数据', message: '需求预测存在 18 条重复行', target: '预测文件 W31', handleStatus: '已忽略', handler: '孙倩' },
    { stage: 'MRP计算', severity: 'warning', category: 'LT 异常', message: '采购 LT 由 25 天跳变至 46 天', target: 'SP-4521', handleStatus: '待处理', handler: '陈曦' },
    { stage: 'MRP计算', severity: 'info', category: '参数默认', message: '18 个 SKU 使用默认库存策略参数', target: '欧洲区 SKU', handleStatus: '已解决', handler: '李航' },
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
    { time: '2026-07-31 08:21:03', operator: '李航', action: '绑定输入数据版本（8 类）', result: '成功', duration: '1.2s' },
    { time: '2026-07-31 08:22:40', operator: '系统', action: '数据校验开始', result: '进行中', duration: '-' },
    { time: '2026-07-31 08:24:10', operator: '系统', action: '数据校验完成', result: status === '校验失败' ? '失败' : '警告', duration: '1m30s' },
  ]
  const extra: Omit<TaskLog, 'id'>[] = [
    { time: '2026-07-31 08:25:02', operator: '李航', action: '生成数据快照 SNP-20260731', result: '成功', duration: '4.1s' },
    { time: '2026-07-31 08:26:00', operator: '系统', action: 'MRP 计算开始', result: '进行中', duration: '-' },
    { time: '2026-07-31 08:34:22', operator: '系统', action: 'MRP 计算完成', result: status === '计算失败' ? '失败' : '成功', duration: '8m22s' },
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
    { key: 'prepare', label: '数据准备' },
    { key: 'validate', label: '数据校验' },
    { key: 'snapshot', label: '数据快照' },
    { key: 'calculate', label: 'MRP 计算' },
    { key: 'adjust', label: '人工调整' },
    { key: 'confirm', label: '确认发布' },
  ]
  // 阶段映射到流程索引
  const stageToFlow: Record<TaskStage, number> = {
    草稿: 0,
    数据准备: 0,
    数据校验: 1,
    数据快照: 2,
    MRP计算: 3,
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
      exceptions: i === 1 ? exceptionCount : 0,
    }
  })
}

interface TaskSeed {
  id: string
  name: string
  startWeek: string
  weeks: number
  scope: PlanTask['scope']
  stage: TaskStage
  status: TaskStatus
  validation: ValidationStatus
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
    id: 'TSK-20260731-01', name: '2026 W31 美国 Amazon 周度库存计划', startWeek: '2026 W31', weeks: 21,
    scope: { countries: ['美国'], platforms: ['Amazon'], warehouses: ['US-East', 'US-West'], productScope: '全部 SKU' },
    stage: 'MRP计算', status: '计算中', validation: '校验通过', validationSummary: { passed: 42, blocking: 0, warnings: 6 },
    progress: 68, exceptionCount: 6, skuCount: 642, suggestionQty: 186300, shortageSku: 28, overstockSku: 15,
    owner: '李航', collaborators: ['张伟', '陈曦'], createdBy: '李航', createdAt: '2026-07-31 08:20', updatedAt: '2026-07-31 08:34', mine: true,
  },
  {
    id: 'TSK-20260731-02', name: '2026 W31 欧洲多平台补货计划', startWeek: '2026 W31', weeks: 21,
    scope: { countries: ['德国', '英国', '法国'], platforms: ['Amazon', 'TikTok', 'Temu'], warehouses: ['DE-FRA', 'UK-LON'], productScope: '全部 SKU' },
    stage: '数据校验', status: '校验失败', validation: '校验失败', validationSummary: { passed: 31, blocking: 3, warnings: 18 },
    progress: 100, progressLabel: '校验失败', exceptionCount: 21, skuCount: 528, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '张伟', collaborators: ['孙倩'], createdBy: '张伟', createdAt: '2026-07-31 07:50', updatedAt: '2026-07-31 08:12', mine: false,
  },
  {
    id: 'TSK-20260731-03', name: '2026 W32 加拿大仓滚动计划', startWeek: '2026 W32', weeks: 21,
    scope: { countries: ['加拿大'], platforms: ['Amazon'], warehouses: ['CA-YYZ'], productScope: '全部 SKU' },
    stage: '数据准备', status: '草稿', validation: '未校验', validationSummary: { passed: 0, blocking: 0, warnings: 0 },
    progress: 0, exceptionCount: 0, skuCount: 214, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '李航', collaborators: [], createdBy: '李航', createdAt: '2026-07-31 09:05', updatedAt: '2026-07-31 09:05', mine: true,
  },
  {
    id: 'TSK-20260730-04', name: 'Prime Day 活动备货专项计划', startWeek: '2026 W28', weeks: 12,
    scope: { countries: ['美国', '英国', '德国'], platforms: ['Amazon'], warehouses: ['US-East', 'US-West', 'UK-LON', 'DE-FRA'], productScope: '活动 SKU' },
    stage: '人工调整', status: '待调整', validation: '校验警告', validationSummary: { passed: 40, blocking: 0, warnings: 12 },
    progress: 0, progressLabel: '人工调整 24/37', exceptionCount: 12, skuCount: 372, suggestionQty: 98600, shortageSku: 19, overstockSku: 8,
    owner: '陈曦', collaborators: ['李航', '王敏'], createdBy: '陈曦', createdAt: '2026-07-30 14:20', updatedAt: '2026-07-31 09:10', mine: true,
  },
  {
    id: 'TSK-20260730-05', name: 'TikTok 美国站新品补货计划', startWeek: '2026 W31', weeks: 16,
    scope: { countries: ['美国'], platforms: ['TikTok'], warehouses: ['US-West'], productScope: '新品 SKU' },
    stage: 'MRP计算', status: '计算失败', validation: '校验通过', validationSummary: { passed: 44, blocking: 0, warnings: 2 },
    progress: 42, progressLabel: '计算失败', exceptionCount: 2, skuCount: 156, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '王敏', collaborators: ['李航'], createdBy: '王敏', createdAt: '2026-07-30 16:40', updatedAt: '2026-07-30 17:02', mine: false,
  },
  {
    id: 'TSK-20260730-06', name: '2026 W30 全球全平台周度计划', startWeek: '2026 W30', weeks: 21,
    scope: { countries: ['美国', '德国', '英国', '法国', '日本'], platforms: ['Amazon', 'TikTok', 'Temu', '独立站'], warehouses: ['US-East', 'US-West', 'DE-FRA', 'UK-LON', 'JP-TYO'], productScope: '全部 SKU' },
    stage: '已发布', status: '已发布', validation: '校验通过', validationSummary: { passed: 48, blocking: 0, warnings: 0 },
    progress: 100, progressLabel: '已发布', exceptionCount: 0, skuCount: 1284, suggestionQty: 486300, shortageSku: 63, overstockSku: 41,
    owner: '李航', collaborators: ['张伟', '陈曦', '王敏'], createdBy: '李航', createdAt: '2026-07-24 09:05', updatedAt: '2026-07-24 16:40', mine: true,
  },
  {
    id: 'TSK-20260729-07', name: '2026 W31 日本站滚动补货计划', startWeek: '2026 W31', weeks: 21,
    scope: { countries: ['日本'], platforms: ['Amazon', '独立站'], warehouses: ['JP-TYO'], productScope: '全部 SKU' },
    stage: '待确认', status: '待确认', validation: '校验通过', validationSummary: { passed: 46, blocking: 0, warnings: 4 },
    progress: 100, progressLabel: '等待确认', exceptionCount: 4, skuCount: 288, suggestionQty: 72400, shortageSku: 11, overstockSku: 6,
    owner: '陈曦', collaborators: ['李航'], createdBy: '陈曦', createdAt: '2026-07-29 10:20', updatedAt: '2026-07-31 08:50', mine: true,
  },
  {
    id: 'TSK-20260729-08', name: '2026 W31 独立站清仓专项计划', startWeek: '2026 W31', weeks: 8,
    scope: { countries: ['美国', '德国'], platforms: ['独立站'], warehouses: ['US-East', 'DE-FRA'], productScope: '清仓 SKU' },
    stage: '数据校验', status: '待校验', validation: '未校验', validationSummary: { passed: 0, blocking: 0, warnings: 0 },
    progress: 0, progressLabel: '待校验', exceptionCount: 0, skuCount: 132, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '张伟', collaborators: [], createdBy: '张伟', createdAt: '2026-07-29 15:30', updatedAt: '2026-07-29 15:30', mine: false,
  },
  {
    id: 'TSK-20260728-09', name: '2026 W30 欧洲 Amazon 补货计划', startWeek: '2026 W30', weeks: 21,
    scope: { countries: ['德国', '英国', '法国'], platforms: ['Amazon'], warehouses: ['DE-FRA', 'UK-LON'], productScope: '全部 SKU' },
    stage: '数据快照', status: '待计算', validation: '校验通过', validationSummary: { passed: 45, blocking: 0, warnings: 3 },
    progress: 0, progressLabel: '待计算', exceptionCount: 3, skuCount: 496, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '李航', collaborators: ['王敏'], createdBy: '李航', createdAt: '2026-07-28 09:15', updatedAt: '2026-07-31 07:40', mine: true,
  },
  {
    id: 'TSK-20260728-10', name: '2026 W29 美西仓专项调拨计划', startWeek: '2026 W29', weeks: 10,
    scope: { countries: ['美国'], platforms: ['Amazon', 'TikTok'], warehouses: ['US-West'], productScope: '调拨 SKU' },
    stage: '人工调整', status: '调整中', validation: '校验警告', validationSummary: { passed: 41, blocking: 0, warnings: 9 },
    progress: 0, progressLabel: '人工调整 12/28', exceptionCount: 9, skuCount: 208, suggestionQty: 44200, shortageSku: 14, overstockSku: 5,
    owner: '王敏', collaborators: ['陈曦'], createdBy: '王敏', createdAt: '2026-07-28 11:00', updatedAt: '2026-07-31 09:20', mine: false,
  },
  {
    id: 'TSK-20260724-11', name: '2026 W29 全球全平台周度计划', startWeek: '2026 W29', weeks: 21,
    scope: { countries: ['美国', '德国', '英国', '法国', '日本'], platforms: ['Amazon', 'TikTok', 'Temu', '独立站'], warehouses: ['US-East', 'US-West', 'DE-FRA', 'UK-LON', 'JP-TYO'], productScope: '全部 SKU' },
    stage: '待确认', status: '已确认', validation: '校验通过', validationSummary: { passed: 47, blocking: 0, warnings: 1 },
    progress: 100, progressLabel: '已确认', exceptionCount: 1, skuCount: 1263, suggestionQty: 471200, shortageSku: 58, overstockSku: 39,
    owner: '张伟', collaborators: ['李航', '陈曦'], createdBy: '张伟', createdAt: '2026-07-17 08:50', updatedAt: '2026-07-17 15:20', mine: false,
  },
  {
    id: 'TSK-20260717-12', name: '2026 W28 美国 Amazon 周度计划', startWeek: '2026 W28', weeks: 21,
    scope: { countries: ['美国'], platforms: ['Amazon'], warehouses: ['US-East', 'US-West'], productScope: '全部 SKU' },
    stage: '已发布', status: '已取消', validation: '校验通过', validationSummary: { passed: 46, blocking: 0, warnings: 2 },
    progress: 100, progressLabel: '已取消', exceptionCount: 0, skuCount: 642, suggestionQty: 0, shortageSku: 0, overstockSku: 0,
    owner: '陈曦', collaborators: [], createdBy: '陈曦', createdAt: '2026-07-10 10:10', updatedAt: '2026-07-11 09:30', mine: false,
  },
]

export const taskList: PlanTask[] = seeds.map((s, idx) => {
  const failed = s.status === '校验失败' || s.status === '计算失败'
  const allValid = s.validation === '校验通过'
  return {
    ...s,
    cycle: `${s.startWeek} - W${(parseInt(s.startWeek.split('W')[1]) + s.weeks - 1) > 52 ? parseInt(s.startWeek.split('W')[1]) + s.weeks - 1 - 52 : parseInt(s.startWeek.split('W')[1]) + s.weeks - 1}`,
    dataVersionTag: `DS-${s.startWeek.replace(/\s/g, '')}`,
    paramVersionTag: `PM-${2026}.${8 + (idx % 3)}`,
    dataVersions: buildDataVersions(idx, allValid, s.status === '校验失败'),
    paramVersions: buildParamVersions(idx),
    exceptions: buildExceptions(s.stage, s.exceptionCount),
    logs: buildLogs(s.stage, s.status),
    flow: buildFlow(s.stage, s.exceptionCount, failed),
  }
})

// 新建向导参考数据
export const wizardReference = {
  countries: ['美国', '加拿大', '德国', '英国', '法国', '日本', '澳大利亚'],
  platforms: ['Amazon', 'TikTok', 'Temu', 'eBay', '独立站'],
  warehouses: ['US-East', 'US-West', 'CA-YYZ', 'DE-FRA', 'UK-LON', 'JP-TYO'],
  productLines: ['3C 数码', '家居生活', '户外运动', '美妆个护', '宠物用品'],
  suppliers: ['深圳智造', '东莞精密', '宁波五金', '苏州电子'],
  purchaseOwners: ['采购一组', '采购二组', '海外采购组'],
  owners: ['李航', '张伟', '陈曦', '王敏'],
  dataInputs: DATA_TYPES.map((type, i) => ({
    type,
    version: `v2026.31.${i + 1}`,
    dataDate: `2026-07-${24 + (i % 5)}`,
    rows: 1200 + i * 137,
    validation: (i === 7 ? '校验警告' : '校验通过') as ValidationStatus,
    expired: i === 7,
  })),
  params: PARAM_TYPES.map((type, i) => ({
    type,
    version: `P2026.8.${i + 1}`,
    coverage: i === 3 ? 92.4 : 98.6,
  })),
}

// 校验步骤 / 计算步骤定义（用于进度弹窗）
export const validationSteps = [
  '校验数据版本',
  '校验必填字段',
  '校验 SKU 主数据',
  '校验仓库和平台映射',
  '校验重复数据',
  '校验参数覆盖率',
  '生成校验结果',
]

export const calculationSteps = [
  '创建数据快照',
  '加载需求数据',
  '加载库存与供应数据',
  '计算供需平衡',
  '计算库存缺口',
  '生成补货需求',
  '执行 MOQ 和箱规取整',
  '反推采购和物流时间',
  '生成库存预警',
  '保存计算结果',
]
