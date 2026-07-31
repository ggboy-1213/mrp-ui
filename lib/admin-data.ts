import type { Tone } from "@/lib/tone"

export interface UserRow {
  id: string
  name: string
  account: string
  role: string
  dept: string
  scope: string
  status: "启用" | "停用" | "待激活"
  lastLogin: string
}

export interface RoleRow {
  id: string
  name: string
  desc: string
  users: number
  permissions: number
  builtin: boolean
}

export interface LogRow {
  id: string
  time: string
  operator: string
  module: string
  action: string
  target: string
  result: "成功" | "失败"
  ip: string
}

export const USER_STATUS_TONE: Record<UserRow["status"], Tone> = {
  启用: "success",
  停用: "neutral",
  待激活: "warning",
}

export const USERS: UserRow[] = [
  { id: "U-01", name: "李航", account: "lihang", role: "计划主管", dept: "供应链计划部", scope: "全部", status: "启用", lastLogin: "2026-07-31 08:42" },
  { id: "U-02", name: "王敏", account: "wangmin", role: "采购计划员", dept: "供应链计划部", scope: "US / 音频", status: "启用", lastLogin: "2026-07-31 09:10" },
  { id: "U-03", name: "陈婷", account: "chenting", role: "库存计划员", dept: "供应链计划部", scope: "EU", status: "启用", lastLogin: "2026-07-30 17:55" },
  { id: "U-04", name: "赵磊", account: "zhaolei", role: "数据管理员", dept: "数据中台", scope: "全部", status: "启用", lastLogin: "2026-07-31 07:20" },
  { id: "U-05", name: "孙悦", account: "sunyue", role: "只读分析", dept: "经营分析部", scope: "全部", status: "启用", lastLogin: "2026-07-29 14:02" },
  { id: "U-06", name: "周杰", account: "zhoujie", role: "采购计划员", dept: "供应链计划部", scope: "JP", status: "待激活", lastLogin: "—" },
  { id: "U-07", name: "吴芳", account: "wufang", role: "库存计划员", dept: "供应链计划部", scope: "UK", status: "停用", lastLogin: "2026-06-18 11:30" },
]

export const ROLES: RoleRow[] = [
  { id: "R-01", name: "系统管理员", desc: "系统配置、用户与权限管理", users: 2, permissions: 48, builtin: true },
  { id: "R-02", name: "计划主管", desc: "全流程操作与审批确认", users: 3, permissions: 36, builtin: true },
  { id: "R-03", name: "采购计划员", desc: "计划创建、调整与建议查看", users: 8, permissions: 22, builtin: false },
  { id: "R-04", name: "库存计划员", desc: "库存与需求数据维护", users: 6, permissions: 20, builtin: false },
  { id: "R-05", name: "数据管理员", desc: "数据导入、校验与主数据维护", users: 2, permissions: 26, builtin: false },
  { id: "R-06", name: "只读分析", desc: "仅查看报表与趋势", users: 12, permissions: 8, builtin: true },
]

const modules = ["计划任务", "人工调整", "计划参数", "数据导入", "主数据", "用户与权限", "系统配置"]
const actions = ["创建", "编辑", "删除", "发布", "校验", "导出", "登录", "调整参数"]
export const LOGS: LogRow[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `LOG-${(90211 + i).toString()}`,
  time: `2026-07-31 ${(9 - (i % 9)).toString().padStart(2, "0")}:${(59 - i).toString().padStart(2, "0")}`,
  operator: ["李航", "王敏", "陈婷", "赵磊", "孙悦"][i % 5],
  module: modules[i % modules.length],
  action: actions[i % actions.length],
  target: i % 3 === 0 ? `TASK-2026073${i % 2}-00${i % 9}` : `SKU-1002${(31 + (i % 12)).toString()}`,
  result: i % 8 === 0 ? "失败" : "成功",
  ip: `10.20.${i % 6}.${100 + i}`,
}))
