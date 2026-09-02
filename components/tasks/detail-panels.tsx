'use client'

import type { PlanTask, TaskException, TaskLog } from '@/lib/task-types'
import { validationMeta } from '@/lib/task-types'
import { Card } from '@/components/ui/card'
import { SectionCard, ToneBadge, StatTiles, type StatTile } from '@/components/shared/page-kit'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ScopeTags } from '@/components/tasks/scope-tags'
import { cn } from '@/lib/utils'
import { toneText, toneSoftBg } from '@/lib/tone'
import {
  Boxes,
  ShoppingCart,
  PackageX,
  PackagePlus,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Database,
  ArrowRight,
} from 'lucide-react'

// -------------------------------------------------------------------------
// 概览 Tab
// -------------------------------------------------------------------------
export function OverviewPanel({ task }: { task: PlanTask }) {
  const stats: StatTile[] = [
    { key: 'sku', label: '参与计算 SKU', value: task.skuCount.toLocaleString(), tone: 'mrp', icon: Boxes },
    { key: 'suggest', label: '建议补货量', value: task.suggestionQty.toLocaleString(), tone: 'primary', icon: ShoppingCart },
    { key: 'shortage', label: '缺货 SKU', value: task.shortageSku, unit: '个', tone: 'danger', icon: PackageX },
    { key: 'over', label: '高库存 SKU', value: task.overstockSku, unit: '个', tone: 'warning', icon: PackagePlus },
    { key: 'exc', label: '异常数量', value: task.exceptionCount, unit: '条', tone: task.exceptionCount > 0 ? 'danger' : 'success', icon: AlertTriangle },
    { key: 'collab', label: '协作人员', value: task.collaborators.length + 1, unit: '人', tone: 'muted', icon: Users },
  ]

  return (
    <div className="space-y-4">
      <StatTiles items={stats} columns={6} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="计划范围 (Task Scope)"
          description="任务级选择范围，最终解析为 Country + SKU 引擎单元后批量计算"
          className="xl:col-span-1"
          bodyClassName="p-4 space-y-4"
        >
          <div className="space-y-3 text-sm">
            <ScopeRow label="计划周期" value={task.cycle} />
            <ScopeRow label="计划周数" value={`${task.weeks} 周`} />
            <ScopeRow label="计算快照" value={task.snapshotTag} mono />
            <ScopeRow label="参数版本" value={task.paramVersionTag} mono />
          </div>
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs text-muted-foreground">范围维度</p>
            <ScopeTags scope={task.scope} />
          </div>
        </SectionCard>

        <SectionCard
          title="引擎单元解析 (Planning Scope)"
          description="Task Scope ≠ Engine Scope：平台 / 仓库维度暂不参与真实 MRP 计算"
          className="xl:col-span-2"
          bodyClassName="p-0"
        >
          <PlanningScopeTable task={task} />
        </SectionCard>
      </div>

      <SectionCard title="执行流程" bodyClassName="p-4">
        <FlowTimeline task={task} />
      </SectionCard>
    </div>
  )
}

function ScopeRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium text-foreground', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}

function PlanningScopeTable({ task }: { task: PlanTask }) {
  const rows = task.planningScopes.map((p, i) => ({ ...p, id: `${p.country}-${i}` }))
  const statusTone: Record<string, StatTile['tone']> = {
    就绪: 'muted',
    待计算: 'warning',
    计算中: 'mrp',
    计算完成: 'success',
    计算失败: 'danger',
  }
  const columns: Column<(typeof rows)[number]>[] = [
    { key: 'country', header: '国家', sticky: 'left', width: '120px', render: (r) => <span className="font-medium">{r.country}</span> },
    { key: 'skuCount', header: '解析 SKU 数', align: 'right', sortable: true, sortValue: (r) => r.skuCount, render: (r) => r.skuCount.toLocaleString() },
    { key: 'unit', header: '引擎单元', render: () => <ToneBadge tone="neutral">Country + SKU</ToneBadge> },
    { key: 'status', header: '计算状态', render: (r) => <ToneBadge tone={statusTone[r.status] ?? 'muted'} dot>{r.status}</ToneBadge> },
  ]
  return <DataTable columns={columns} rows={rows} density="comfortable" maxHeight="16rem" />
}

const flowIcon = {
  done: CheckCircle2,
  active: Loader2,
  pending: Clock,
  failed: XCircle,
}
const flowTone: Record<string, string> = {
  done: 'text-success',
  active: 'text-primary',
  pending: 'text-muted-foreground',
  failed: 'text-destructive',
}

function FlowTimeline({ task }: { task: PlanTask }) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {task.flow.map((step) => {
        const Icon = flowIcon[step.status]
        return (
          <li key={step.key} className="relative">
            <span
              className={cn(
                'absolute -left-[31px] flex size-6 items-center justify-center rounded-full border-2 border-background bg-card',
                flowTone[step.status],
              )}
            >
              <Icon className={cn('size-4', step.status === 'active' && 'animate-spin')} />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{step.label}</span>
              {step.operator && <span className="text-xs text-muted-foreground">· {step.operator}</span>}
              {step.exceptions > 0 && <ToneBadge tone="danger">{step.exceptions} 条异常</ToneBadge>}
            </div>
            {(step.startedAt || step.duration) && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {step.startedAt && <span>开始 {step.startedAt}</span>}
                {step.finishedAt && <span> · 完成 {step.finishedAt}</span>}
                {step.duration && <span> · 耗时 {step.duration}</span>}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

// -------------------------------------------------------------------------
// SCM 数据检查 Tab
// -------------------------------------------------------------------------
export function ScmCheckPanel({ task }: { task: PlanTask }) {
  const s = task.validationSummary
  const rows = task.scmChecks.map((c, i) => ({ ...c, id: `${c.source}-${i}` }))
  const columns: Column<(typeof rows)[number]>[] = [
    { key: 'source', header: '数据源', sticky: 'left', width: '140px', render: (r) => (
      <span className="flex items-center gap-2 font-medium"><Database className="size-3.5 text-muted-foreground" />{r.source}</span>
    ) },
    { key: 'rows', header: '数据量', align: 'right', sortable: true, sortValue: (r) => r.rows, render: (r) => r.rows.toLocaleString() },
    { key: 'updatedAt', header: '更新时间', render: (r) => <span className="text-xs text-muted-foreground">{r.updatedAt}</span> },
    { key: 'issues', header: '问题数', align: 'right', render: (r) => (
      <span className={r.issues > 0 ? 'font-medium text-destructive' : 'text-muted-foreground'}>{r.issues}</span>
    ) },
    { key: 'status', header: '检查状态', render: (r) => <ToneBadge tone={validationMeta[r.status].tone} dot>{r.status}</ToneBadge> },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile label="检查通过" value={s.passed} tone="success" icon={CheckCircle2} />
        <SummaryTile label="警告" value={s.warnings} tone="warning" icon={AlertTriangle} />
        <SummaryTile label="阻断错误" value={s.blocking} tone="danger" icon={XCircle} />
      </div>
      {s.blocking > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <XCircle className="mt-0.5 size-4 shrink-0" />
          <span>存在 {s.blocking} 项阻断错误，需处理后才能固化快照并进入 MRP 计算。</span>
        </div>
      )}
      <SectionCard title="SCM 实时数据检查明细" description={`绑定计算快照 ${task.snapshotTag}`} bodyClassName="p-0">
        <DataTable columns={columns} rows={rows} density="comfortable" maxHeight="28rem" />
      </SectionCard>
    </div>
  )
}

function SummaryTile({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string
  value: number
  tone: StatTile['tone']
  icon: typeof CheckCircle2
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={cn('flex size-9 items-center justify-center rounded-md', toneSoftBg[tone])}>
        <Icon className={cn('size-5', toneText[tone])} />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
      </div>
    </Card>
  )
}

// -------------------------------------------------------------------------
// 计划参数 Tab
// -------------------------------------------------------------------------
export function ParamPanel({ task }: { task: PlanTask }) {
  const p = task.planParams
  const params = [
    { label: '安全库存天数', value: `${p.safetyStockDays} 天` },
    { label: 'QC 周期', value: `${p.qcDays} 天` },
    { label: '国际物流时效', value: `${p.intlLeadTime} 天` },
    { label: '发运箱规倍数', value: `${p.cartonMultiple} 件/箱` },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SectionCard title="计划参数版本" description={`${task.paramVersionTag} · 覆盖率 ${task.paramCoverage}%`} bodyClassName="p-4">
        <div className="grid grid-cols-2 gap-3">
          {params.map((x) => (
            <div key={x.label} className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">{x.label}</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{x.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="外部参数" description="来自 SCM 优先，缺失时回退 MRP Supplier Config" bodyClassName="p-4">
        <div className="space-y-3">
          {task.externalParams.map((e) => (
            <div key={e.key} className="flex items-center justify-between gap-2 rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{e.label}</p>
                <p className="text-xs text-muted-foreground">{e.key}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-foreground">{e.value}</p>
                <ToneBadge tone={e.fallback ? 'warning' : 'success'}>{e.source}</ToneBadge>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// -------------------------------------------------------------------------
// 风险异常 Tab
// -------------------------------------------------------------------------
const sevTone: Record<TaskException['severity'], StatTile['tone']> = {
  critical: 'danger',
  warning: 'warning',
  info: 'muted',
}
const sevLabel: Record<TaskException['severity'], string> = {
  critical: '严重',
  warning: '警告',
  info: '提示',
}
const handleTone: Record<TaskException['handleStatus'], StatTile['tone']> = {
  待处理: 'danger',
  处理中: 'warning',
  已忽略: 'muted',
  已解决: 'success',
}

export function ExceptionPanel({ task }: { task: PlanTask }) {
  if (task.exceptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
        <CheckCircle2 className="size-8 text-success" />
        <p className="text-sm font-medium text-foreground">未发现风险异常</p>
        <p className="text-xs text-muted-foreground">该计划任务当前所有阶段均无异常记录</p>
      </div>
    )
  }
  const columns: Column<TaskException>[] = [
    { key: 'severity', header: '级别', sticky: 'left', width: '80px', render: (r) => <ToneBadge tone={sevTone[r.severity]} dot>{sevLabel[r.severity]}</ToneBadge> },
    { key: 'stage', header: '阶段', render: (r) => <ToneBadge tone="neutral">{r.stage}</ToneBadge> },
    { key: 'category', header: '异常类别', render: (r) => <span className="font-medium">{r.category}</span> },
    { key: 'message', header: '描述', width: '280px', render: (r) => <span className="text-muted-foreground">{r.message}</span> },
    { key: 'target', header: '影响对象', render: (r) => r.target },
    { key: 'occurredAt', header: '发生时间', render: (r) => <span className="text-xs text-muted-foreground">{r.occurredAt}</span> },
    { key: 'handler', header: '处理人', render: (r) => r.handler },
    { key: 'handleStatus', header: '处理状态', sticky: 'right', width: '100px', render: (r) => <ToneBadge tone={handleTone[r.handleStatus]}>{r.handleStatus}</ToneBadge> },
  ]
  return (
    <SectionCard title="风险异常记录" description="覆盖数据检查、MRP 计算与结果分析各阶段" bodyClassName="p-0">
      <DataTable columns={columns} rows={task.exceptions} density="comfortable" maxHeight="32rem" />
    </SectionCard>
  )
}

// -------------------------------------------------------------------------
// 运行日志 Tab
// -------------------------------------------------------------------------
const logResultTone: Record<TaskLog['result'], StatTile['tone']> = {
  成功: 'success',
  失败: 'danger',
  警告: 'warning',
  进行中: 'primary',
}

export function RunLogPanel({ task }: { task: PlanTask }) {
  return (
    <SectionCard title="运行日志" description="任务全生命周期的系统与人工操作记录" bodyClassName="p-4">
      <ol className="relative space-y-4 border-l border-border pl-6">
        {task.logs.map((log) => (
          <li key={log.id} className="relative">
            <span
              className={cn(
                'absolute -left-[31px] flex size-6 items-center justify-center rounded-full border-2 border-background bg-card',
                toneText[logResultTone[log.result]],
              )}
            >
              <span className={cn('size-2 rounded-full', toneSoftBg[logResultTone[log.result]])} />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{log.action}</span>
              <ToneBadge tone={logResultTone[log.result]}>{log.result}</ToneBadge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {log.time} · {log.operator} · 耗时 {log.duration}
            </p>
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}
