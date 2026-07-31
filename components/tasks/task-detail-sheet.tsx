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
                  <TabsTrigger value="data">数据版本</TabsTrigger>
                  <TabsTrigger value="param">参数版本</TabsTrigger>
                  <TabsTrigger value="exception">异常记录</TabsTrigger>
                  <TabsTrigger value="log">执行日志</TabsTrigger>
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <TabsContent value="overview"><OverviewTab task={task} /></TabsContent>
                <TabsContent value="data"><DataTab task={task} /></TabsContent>
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
        <p className="mb-2 text-sm font-medium text-foreground">计划范围</p>
        <ScopeTags scope={task.scope} />
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

function DataTab({ task }: { task: PlanTask }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>数据类型</TableHead>
            <TableHead>版本号</TableHead>
            <TableHead>数据日期</TableHead>
            <TableHead className="text-right">数据量</TableHead>
            <TableHead>导入人</TableHead>
            <TableHead>导入时间</TableHead>
            <TableHead>校验状态</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {task.dataVersions.map((d) => (
            <TableRow key={d.type}>
              <TableCell className="font-medium text-foreground">
                {d.type}
                {d.expired && <span className="ml-1 text-xs text-[oklch(0.5_0.13_60)]">已过期</span>}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{d.version}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{d.dataDate}</TableCell>
              <TableCell className="text-right tabular-nums">{d.rows.toLocaleString('zh-CN')}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{d.importedBy}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{d.importedAt}</TableCell>
              <TableCell><ValidationBadge status={d.validation} /></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">查看</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ParamTab({ task }: { task: PlanTask }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>参数类型</TableHead>
            <TableHead>版本号</TableHead>
            <TableHead className="text-right">覆盖率</TableHead>
            <TableHead>生效时间</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {task.paramVersions.map((p) => (
            <TableRow key={p.type}>
              <TableCell className="font-medium text-foreground">{p.type}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{p.version}</TableCell>
              <TableCell className={cn('text-right tabular-nums', p.coverage < 95 ? 'text-[oklch(0.5_0.13_60)]' : 'text-success')}>
                {p.coverage}%
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{p.effectiveAt}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{p.status}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">查看</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
