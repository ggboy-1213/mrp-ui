import type {
  DashboardData,
  WeeklyInventoryPoint,
  AlertItem,
  PlanVersion,
  KpiMetric,
  PlanStep,
} from './types'

const countries = ['美国', '德国', '英国', '法国', '日本']
const platforms = ['Amazon', 'TikTok', 'Temu', '独立站']
const warehouses = ['US-East', 'US-West', 'DE-FRA', 'UK-LON', 'JP-TYO']
const suppliers = ['深圳智造', '东莞精密', '宁波五金', '苏州电子']
const spus = ['SP-1042', 'SP-2087', 'SP-3310', 'SP-4521', 'SP-5093', 'SP-6178']

// 未来 21 周库存走势
function buildWeekly(): WeeklyInventoryPoint[] {
  const points: WeeklyInventoryPoint[] = []
  let ending = 18600
  for (let i = 0; i < 21; i++) {
    const week = `W${32 + i > 52 ? 32 + i - 52 : 32 + i}`
    const demand = Math.round(2400 + Math.sin(i / 2) * 600 + (i > 10 ? 500 : 0) + Math.random() * 300)
    const arrival = i % 3 === 0 ? Math.round(3200 + Math.random() * 1800) : Math.round(Math.random() * 900)
    ending = Math.max(0, ending + arrival - demand)
    points.push({
      week,
      demand,
      arrival,
      endingStock: ending,
      safetyStock: 6000,
    })
  }
  return points
}

const kpis: KpiMetric[] = [
  { key: 'sku', label: '参与计算 SKU', value: 1284, unit: '个', delta: 3.2, tone: 'default', hint: '本批次纳入计算的有效 SKU' },
  { key: 'replenish', label: '建议补货数量', value: 486300, unit: '件', delta: 8.6, tone: 'mrp', hint: '全部计划建议汇总补货件数' },
  { key: 'shortage', label: '未来缺货 SKU', value: 63, unit: '个', delta: -12.4, tone: 'danger', hint: '未来 21 周内出现缺口的 SKU' },
  { key: 'overstock', label: '高库存 SKU', value: 41, unit: '个', delta: 5.1, tone: 'warning', hint: '库存天数超过阈值的 SKU' },
  { key: 'coverage', label: '平均库存天数', value: 47, unit: '天', delta: -2.3, tone: 'success', hint: '加权平均可售天数' },
  { key: 'anomaly', label: '数据异常数量', value: 18, unit: '条', delta: -30.0, tone: 'danger', hint: '校验发现的关键+非关键异常' },
]

const steps: PlanStep[] = [
  { key: 'input', label: '数据接入', status: 'done', description: '预测 / 库存 / 在途 / 参数已同步' },
  { key: 'validate', label: '数据校验', status: 'done', description: '18 条异常，0 条关键阻断' },
  { key: 'snapshot', label: '固化快照', status: 'done', description: '锁定输入与参数版本' },
  { key: 'calculate', label: 'MRP 计算', status: 'active', description: '周度供需平衡计算中 68%' },
  { key: 'review', label: '人工调整', status: 'pending', description: '待计划员评审与复算' },
  { key: 'confirm', label: '确认锁定', status: 'pending', description: '生成正式计划版本' },
]

function buildAlerts(): AlertItem[] {
  const raw: Omit<AlertItem, 'id' | 'createdAt'>[] = [
    { level: 'critical', type: '缺货', sku: 'SK-104201', spu: 'SP-1042', country: '美国', platform: 'Amazon', warehouse: 'US-East', message: 'W37 预计期末库存 -820 件，早于补货到货周', week: 'W37', owner: '计划-李航' },
    { level: 'critical', type: '到货延迟', sku: 'SK-208702', spu: 'SP-2087', country: '德国', platform: 'TikTok', warehouse: 'DE-FRA', message: '头程在途延迟 9 天，影响 W35 上架', week: 'W35', owner: '物流-王敏' },
    { level: 'warning', type: '高库存', sku: 'SK-331005', spu: 'SP-3310', country: '英国', platform: 'Amazon', warehouse: 'UK-LON', message: '库存天数 118 天，超阈值 60 天', week: 'W33', owner: '计划-张伟' },
    { level: 'warning', type: 'LT异常', sku: 'SK-452103', spu: 'SP-4521', country: '日本', platform: '独立站', warehouse: 'JP-TYO', message: '采购 LT 由 25 天跳变至 46 天', week: 'W34', owner: '采购-陈曦' },
    { level: 'warning', type: '缺货', sku: 'SK-509301', spu: 'SP-5093', country: '法国', platform: 'Temu', warehouse: 'DE-FRA', message: 'W41 预计缺口 1,240 件', week: 'W41', owner: '计划-李航' },
    { level: 'info', type: '数据过期', sku: 'SK-617801', spu: 'SP-6178', country: '美国', platform: 'TikTok', warehouse: 'US-West', message: '平台仓库存快照已过期 3 天', week: 'W32', owner: '仓储-赵磊' },
    { level: 'info', type: '数据缺失', sku: 'SK-104205', spu: 'SP-1042', country: '德国', platform: 'Amazon', warehouse: 'DE-FRA', message: '缺少箱规主数据，按默认值计算', week: 'W32', owner: '主数据-孙倩' },
  ]
  return raw.map((r, i) => ({
    ...r,
    id: `AL-${1000 + i}`,
    createdAt: `2026-07-${28 + (i % 3)} 09:${10 + i}`,
  }))
}

const recentVersions: PlanVersion[] = [
  { id: 'V-2026W31', name: '2026 W31 周度计划', batch: 'BATCH-20260731-01', scope: '全球 · 全平台', status: 'calculating', skuCount: 1284, suggestionCount: 512, createdBy: '李航', createdAt: '2026-07-31 08:20' },
  { id: 'V-2026W30', name: '2026 W30 周度计划', batch: 'BATCH-20260724-02', scope: '全球 · 全平台', status: 'confirmed', skuCount: 1276, suggestionCount: 498, createdBy: '张伟', createdAt: '2026-07-24 09:05', confirmedAt: '2026-07-24 16:40' },
  { id: 'V-2026W29', name: '2026 W29 周度计划', batch: 'BATCH-20260717-01', scope: '全球 · 全平台', status: 'confirmed', skuCount: 1263, suggestionCount: 471, createdBy: '李航', createdAt: '2026-07-17 08:50', confirmedAt: '2026-07-17 15:20' },
  { id: 'V-2026W28', name: '2026 W28 周度计划', batch: 'BATCH-20260710-03', scope: '美国 · Amazon', status: 'archived', skuCount: 642, suggestionCount: 233, createdBy: '陈曦', createdAt: '2026-07-10 10:10', confirmedAt: '2026-07-10 17:00' },
  { id: 'V-2026W27', name: '2026 W27 周度计划', batch: 'BATCH-20260703-01', scope: '全球 · 全平台', status: 'archived', skuCount: 1251, suggestionCount: 460, createdBy: '张伟', createdAt: '2026-07-03 09:00', confirmedAt: '2026-07-03 16:15' },
]

export const dashboardData: DashboardData = {
  currentVersion: recentVersions[0],
  kpis,
  steps,
  weekly: buildWeekly(),
  alerts: buildAlerts(),
  recentVersions,
}

export const referenceData = { countries, platforms, warehouses, suppliers, spus }
