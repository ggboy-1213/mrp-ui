'use client'

import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { TaskStatusBadge, ValidationBadge, StageBadge } from './task-badges'
import { ScopeTags } from './scope-tags'
import { TaskActions } from './task-actions'
import type { PlanTask, TaskFlowStep, TaskException } from '@/lib/task-types'
import { Check, Loader2, Circle, XCircle, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onAction,
}: {
  task: PlanTask | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onAction: (key: string, task: PlanTask) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-2xl md:max-w-3xl">
        {task && (
          <>
            <SheetHeader className="border-b p-4 pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle>{task.name}</SheetTitle>
                <TaskStatusBadge status={task.status} />
                <StageBadge stage={task.stage} />
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="font-mono">{task.id}</span>
                <span>创建人：{task.createdBy}</span>
                <span>创建时间：{task.createdAt}</span>
                <span>最近更新：{task.updatedAt}</span>
              </div>
              <div className="mt-2">
                <TaskActions task={task} onAction={onAction} />
              </div>
            </SheetHeader>

            <Tabs defaultValue="overview" className="min-h-0 flex-1 gap-0">
              <div className="border-b px-4 py-2">
                <TabsList variant="line" className="h-auto">
                  <TabsTrigger value="overview">任务概览</TabsTrigger>
                  <TabsTrigger value="data">SCM 数据检查</TabsTrigger>
                  <TabsTrigger value="param">计划参数</TabsTrigger>
                  <TabsTrigger value="exception">异常记录</TabsTrigger>
                  <TabsTrigger value="log">执行日志</TabsTrigger>
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <TabsContent value="overview"><OverviewTab task={task} /></TabsContent>
                <TabsContent value="data"><DataCheckTab task={task} /></TabsContent>
                <TabsContent value="param"><ParamTab task={task} /></TabsContent>
                <TabsContent value="exception"><ExceptionTab task={task} /></TabsContent>
                <TabsContent value="log"><LogTab task={task} /></TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-lg font-semibold tabular-nums', tone ?? 'text-foreground')}>{value}</p>
    </div>
  )
}

function OverviewTab({ task }: { task: PlanTask }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="计划周期" value={task.cycle} />
        <Metric label="计划周数" value={`${task.weeks} 周`} />
        <Metric label="参与 SKU" value={task.skuCount.toLocaleString('zh-CN')} />
        <Metric label="建议补货数量" value={task.suggestionQty.toLocaleString('zh-CN')} tone="text-mrp" />
        <Metric label="缺货 SKU" value={task.shortageSku} tone="text-destructive" />
        <Metric label="高库存 SKU" value={task.overstockSku} tone="text-[oklch(0.5_0.13_60)]" />
        <Metric label="异常数量" value={task.exceptionCount} tone={task.exceptionCount > 0 ? 'text-destructive' : 'text-foreground'} />
        <Metric label="协作人员" value={task.collaborators.length ? task.collaborators.join('、') : '—'} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">计划范围（Task Scope）</p>
        <ScopeTags scope={task.scope} />
        <p className="mt-1.5 text-xs text-muted-foreground">
          平台 / 仓库维度仅用于业务归类，不参与 MRP 引擎计算；引擎按 Country + SKU 组合执行。
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">引擎计算单元（Country + SKU）</p>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>国家</TableHead>
                <TableHead className="text-right">SKU 数量</TableHead>
                <TableHead>计算状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {task.planningScopes.map((s) => (
                <TableRow key={s.country}>
                  <TableCell className="font-medium text-foreground">{s.country}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.skuCount.toLocaleString('zh-CN')}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">执行流程</p>
        <FlowSteps steps={task.flow} />
      </div>
    </div>
  )
}

function FlowSteps({ steps }: { steps: TaskFlowStep[] }) {
  return (
    <ol className="flex flex-col gap-0">
      {steps.map((s, i) => {
        const Icon =
          s.status === 'done' ? Check : s.status === 'active' ? Loader2 : s.status === 'failed' ? XCircle : Circle
        const color =
          s.status === 'done'
            ? 'bg-success/12 text-success'
            : s.status === 'active'
            ? 'bg-primary/10 text-primary'
            : s.status === 'failed'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted text-muted-foreground'
        return (
          <li key={s.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', color)}>
                <Icon className={cn('size-4', s.status === 'active' && 'animate-spin')} />
              </span>
              {i < steps.length - 1 && <span className={cn('w-px flex-1', s.status === 'done' ? 'bg-success/40' : 'bg-border')} />}
            </div>
            <div className={cn('flex-1 pb-4', i === steps.length - 1 && 'pb-0')}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                {s.exceptions > 0 && <span className="text-xs text-destructive">{s.exceptions} 条异常</span>}
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                {s.operator && <span>操作人：{s.operator}</span>}
                {s.startedAt && <span>开始：{s.startedAt}</span>}
                {s.finishedAt && <span>完成：{s.finishedAt}</span>}
                {s.duration && <span>耗时：{s.duration}</span>}
                {!s.startedAt && <span className="text-muted-foreground/60">未开始</span>}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function DataCheckTab({ task }: { task: PlanTask }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-muted/40 p-3 text-xs">
        <span className="font-medium text-foreground">数据来源：SCM 实时对接</span>
        <span className="text-success">通过 {task.validationSummary.passed}</span>
        <span className="text-destructive">阻断 {task.validationSummary.blocking}</span>
        <span className="text-[oklch(0.5_0.13_60)]">警告 {task.validationSummary.warnings}</span>
        <span className="text-muted-foreground">计算快照：{task.snapshotTag}</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>数据源</TableHead>
              <TableHead className="text-right">数据量</TableHead>
              <TableHead>最近同步</TableHead>
              <TableHead className="text-right">问题数</TableHead>
              <TableHead>检查状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {task.scmChecks.map((d) => (
              <TableRow key={d.source}>
                <TableCell className="font-medium text-foreground">{d.source}</TableCell>
                <TableCell className="text-right tabular-nums">{d.rows.toLocaleString('zh-CN')}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{d.updatedAt}</TableCell>
                <TableCell className={cn('text-right tabular-nums', d.issues > 0 ? 'text-destructive' : 'text-muted-foreground')}>
                  {d.issues}
                </TableCell>
                <TableCell><ValidationBadge status={d.status} /></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">查看</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ParamTab({ task }: { task: PlanTask }) {
  const planRows = [
    { label: '安全库存天数', value: `${task.planParams.safetyStockDays} 天` },
    { label: 'QC 周期', value: `${task.planParams.qcDays} 天` },
    { label: '国际物流时效', value: `${task.planParams.intlLeadTime} 天` },
    { label: '发运箱规倍数', value: `${task.planParams.cartonMultiple} 件 / 箱` },
  ]
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">计划参数</p>
          <span className="font-mono text-xs text-muted-foreground">
            {task.paramVersionTag}· 覆盖率 {task.paramCoverage}%
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>参数项</TableHead>
                <TableHead className="text-right">取值</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planRows.map((r) => (
                <TableRow key={r.label}>
                  <TableCell className="font-medium text-foreground">{r.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">外部参数（独立展示）</p>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>参数项</TableHead>
                <TableHead className="text-right">取值</TableHead>
                <TableHead>来源</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {task.externalParams.map((p) => (
                <TableRow key={p.key}>
                  <TableCell className="font-medium text-foreground">
                    {p.label}
                    <span className="ml-1 font-mono text-[11px] text-muted-foreground">{p.key}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.value}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center rounded border px-1.5 py-0.5 text-[11px]',
                        p.fallback
                          ? 'border-warning/40 bg-warning/15 text-[oklch(0.5_0.13_60)]'
                          : 'border-success/30 bg-success/12 text-success',
                      )}
                    >
                      {p.source}
                      {p.fallback && ' · 兜底'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          MOQ 与生产提前期优先取 SCM 供应商数据，缺失时回落至 MRP Supplier Config 默认配置。
        </p>
      </div>
    </div>
  )
}

const severityMeta: Record<TaskException['severity'], { label: string; cls: string }> = {
  critical: { label: '阻断', cls: 'bg-destructive/10 text-destructive border-destructive/30' },
  warning: { label: '警告', cls: 'bg-warning/15 text-[oklch(0.5_0.13_60)] border-warning/40' },
  info: { label: '提示', cls: 'bg-muted text-muted-foreground border-transparent' },
}

function ExceptionTab({ task }: { task: PlanTask }) {
  if (task.exceptions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
        <CheckCircle2 className="size-8 text-success" />
        当前任务没有异常记录
      </div>
    )
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>阶段</TableHead>
            <TableHead>严重程度</TableHead>
            <TableHead>异常类型</TableHead>
            <TableHead className="min-w-[220px]">异常说明</TableHead>
            <TableHead>影响对象</TableHead>
            <TableHead>发生时间</TableHead>
            <TableHead>处理状态</TableHead>
            <TableHead>处理人</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {task.exceptions.map((ex) => (
            <TableRow key={ex.id}>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{ex.stage}</TableCell>
              <TableCell>
                <span className={cn('inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium', severityMeta[ex.severity].cls)}>
                  {severityMeta[ex.severity].label}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-foreground">{ex.category}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{ex.message}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{ex.target}</TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">{ex.occurredAt}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{ex.handleStatus}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{ex.handler}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">处理</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function LogTab({ task }: { task: PlanTask }) {
  const resultCls: Record<string, string> = {
    成功: 'text-success',
    失败: 'text-destructive',
    警告: 'text-[oklch(0.5_0.13_60)]',
    进行中: 'text-primary',
  }
  const ResultIcon: Record<string, typeof CheckCircle2> = {
    成功: CheckCircle2,
    失败: XCircle,
    警告: AlertCircle,
    进行中: Clock,
  }
  return (
    <ol className="flex flex-col gap-0">
      {task.logs.map((log, i) => {
        const Icon = ResultIcon[log.result] ?? Clock
        return (
          <li key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full bg-card ring-1 ring-border', resultCls[log.result])}>
                <Icon className="size-3.5" />
              </span>
              {i < task.logs.length - 1 && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className={cn('flex-1 pb-4', i === task.logs.length - 1 && 'pb-0')}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{log.action}</p>
                <span className={cn('text-xs font-medium', resultCls[log.result])}>{log.result}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                <span className="font-mono">{log.time}</span>
                <span>操作人：{log.operator}</span>
                <span>耗时：{log.duration}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
