'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  PageHeader,
  SectionCard,
  ToneBadge,
} from '@/components/shared/page-kit'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarClock, Layers, Plug, Database, Save } from 'lucide-react'

const sections = [
  { key: 'calendar', label: '计划日历', icon: CalendarClock },
  { key: 'scope', label: '计算范围', icon: Layers },
  { key: 'integration', label: '数据源对接', icon: Plug },
  { key: 'retention', label: '数据留存', icon: Database },
]

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[220px_1fr] sm:items-center sm:gap-4">
      <div>
        <Label className="text-sm">{label}</Label>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="max-w-md">{children}</div>
    </div>
  )
}

const integrations = [
  { name: '预测系统 (Forecast API)', status: '已连接', tone: 'success' as const },
  { name: 'ERP (库存 / 采购)', status: '已连接', tone: 'success' as const },
  { name: 'WMS (仓储)', status: '已连接', tone: 'success' as const },
  { name: 'SCM 回写接口', status: '待配置', tone: 'warning' as const },
  { name: '执行系统回写', status: '一期预留', tone: 'neutral' as const },
]

export default function SettingsPage() {
  const [active, setActive] = useState('calendar')

  return (
    <div className="space-y-4">
      <PageHeader
        title="系统配置"
        subtitle="配置计划日历、计算范围、数据源对接与数据留存等系统级参数。回写接口为后续阶段预留。"
        actions={<Button size="sm" className="gap-1.5"><Save className="size-4" />保存配置</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <SectionCard bodyClassName="p-0">
          <nav className="flex flex-col p-2">
            {sections.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(s.key)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    active === s.key ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {s.label}
                </button>
              )
            })}
          </nav>
        </SectionCard>

        <div className="space-y-4">
          {active === 'calendar' && (
            <SectionCard title="计划日历与周度口径" description="定义周度滚动计划的起始日与计算频率。">
              <div className="space-y-4 p-1">
                <Field label="周起始日">
                  <Select defaultValue="mon">
                    <SelectTrigger className="h-9"><SelectValue>{(v: string) => ({ mon: '周一', sun: '周日' }[v] ?? v)}</SelectValue></SelectTrigger>
                    <SelectContent><SelectItem value="mon">周一</SelectItem><SelectItem value="sun">周日</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="计算频率" hint="固化快照并触发 MRP 计算的调度频率">
                  <Select defaultValue="weekly">
                    <SelectTrigger className="h-9"><SelectValue>{(v: string) => ({ weekly: '每周一次', daily: '每日一次' }[v] ?? v)}</SelectValue></SelectTrigger>
                    <SelectContent><SelectItem value="weekly">每周一次</SelectItem><SelectItem value="daily">每日一次</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="自动固化时间" hint="到点自动生成计算快照">
                  <Input className="h-9" defaultValue="每周一 02:00" />
                </Field>
              </div>
            </SectionCard>
          )}

          {active === 'scope' && (
            <SectionCard title="默认计算范围" description="设置滚动周数与默认参与计算的维度。">
              <div className="space-y-4 p-1">
                <Field label="滚动周数" hint="计划展望期，建议 21 周">
                  <Input className="h-9" type="number" defaultValue={21} />
                </Field>
                <Field label="默认国家">
                  <Input className="h-9" defaultValue="美国, 德国, 英国, 日本" />
                </Field>
                <Field label="默认平台">
                  <Input className="h-9" defaultValue="Amazon, Temu, TikTok, eBay" />
                </Field>
                <Field label="最小起订量校验" hint="计算时强制应用 MOQ 与取整规则">
                  <Select defaultValue="on">
                    <SelectTrigger className="h-9"><SelectValue>{(v: string) => ({ on: '开启', off: '关闭' }[v] ?? v)}</SelectValue></SelectTrigger>
                    <SelectContent><SelectItem value="on">开启</SelectItem><SelectItem value="off">关闭</SelectItem></SelectContent>
                  </Select>
                </Field>
              </div>
            </SectionCard>
          )}

          {active === 'integration' && (
            <SectionCard title="数据源与接口配置" description="管理外部系统对接状态，回写接口为后续阶段预留。">
              <div className="flex flex-col divide-y divide-border">
                {integrations.map((it) => (
                  <div key={it.name} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                        <Plug className="size-4" aria-hidden />
                      </span>
                      <span className="text-sm font-medium text-foreground">{it.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ToneBadge tone={it.tone}>{it.status}</ToneBadge>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">配置</Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {active === 'retention' && (
            <SectionCard title="数据留存策略" description="设置版本与快照的保留周期，满足可追溯要求。">
              <div className="space-y-4 p-1">
                <Field label="计划版本留存" hint="满足追溯要求，建议 ≥ 48 周">
                  <Input className="h-9" defaultValue="48 周" />
                </Field>
                <Field label="计算快照留存">
                  <Input className="h-9" defaultValue="48 周" />
                </Field>
                <Field label="操作日志留存">
                  <Input className="h-9" defaultValue="24 个月" />
                </Field>
                <Field label="导入原始文件留存">
                  <Input className="h-9" defaultValue="12 周" />
                </Field>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
