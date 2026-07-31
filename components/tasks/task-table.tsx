'use client'

import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { TaskStatusBadge, ValidationBadge, StageBadge } from './task-badges'
import { ScopeTags } from './scope-tags'
import { TaskActions } from './task-actions'
import type { PlanTask } from '@/lib/task-types'

function ProgressCell({ task }: { task: PlanTask }) {
  if (task.status === '计算中') {
    return (
      <div className="w-32">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-mrp">MRP 计算</span>
          <span className="tabular-nums text-muted-foreground">{task.progress}%</span>
        </div>
        <Progress value={task.progress} className="h-1.5" />
      </div>
    )
  }
  if (task.validation === '校验中') {
    return (
      <div className="w-32">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-primary">数据校验</span>
          <span className="tabular-nums text-muted-foreground">{task.progress}%</span>
        </div>
        <Progress value={task.progress} className="h-1.5" />
      </div>
    )
  }
  const failed = task.status === '校验失败' || task.status === '计算失败'
  return (
    <span
      className={cn(
        'text-xs',
        failed ? 'text-destructive' : task.status === '已发布' || task.status === '已确认' ? 'text-success' : 'text-muted-foreground',
      )}
    >
      {task.progressLabel ?? '—'}
    </span>
  )
}

export function TaskTable({
  tasks,
  onOpenDetail,
  onAction,
}: {
  tasks: PlanTask[]
  onOpenDetail: (task: PlanTask) => void
  onAction: (key: string, task: PlanTask) => void
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table className="min-w-[1600px] text-sm">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="sticky left-0 z-20 bg-card">任务编号 / 名称</TableHead>
            <TableHead>计划周期</TableHead>
            <TableHead className="min-w-[240px]">计划范围</TableHead>
            <TableHead>数据版本</TableHead>
            <TableHead>参数版本</TableHead>
            <TableHead className="min-w-[160px]">数据校验</TableHead>
            <TableHead>当前阶段</TableHead>
            <TableHead className="min-w-[140px]">执行进度</TableHead>
            <TableHead>任务状态</TableHead>
            <TableHead className="text-right">异常</TableHead>
            <TableHead>创建人</TableHead>
            <TableHead className="text-right">创建时间</TableHead>
            <TableHead className="text-right">最近更新</TableHead>
            <TableHead className="sticky right-0 z-20 bg-card text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={14} className="h-32 text-center text-sm text-muted-foreground">
                没有符合条件的计划任务
              </TableCell>
            </TableRow>
          )}
          {tasks.map((t) => (
            <TableRow key={t.id} className="group cursor-pointer" onClick={() => onOpenDetail(t)}>
              <TableCell className="sticky left-0 z-10 bg-card group-hover:bg-muted/50">
                <button
                  className="text-left"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenDetail(t)
                  }}
                >
                  <p className="font-medium text-foreground hover:text-primary">{t.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{t.id}</p>
                </button>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                <p className="text-foreground">{t.cycle}</p>
                <p>{t.weeks} 周</p>
              </TableCell>
              <TableCell>
                <ScopeTags scope={t.scope} />
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{t.dataVersionTag}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{t.paramVersionTag}</TableCell>
              <TableCell>
                <ValidationBadge status={t.validation} />
                {(t.validationSummary.blocking > 0 || t.validationSummary.warnings > 0) && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {t.validationSummary.blocking > 0 && (
                      <span className="text-destructive">{t.validationSummary.blocking} 个阻断错误</span>
                    )}
                    {t.validationSummary.blocking > 0 && t.validationSummary.warnings > 0 && '，'}
                    {t.validationSummary.warnings > 0 && `${t.validationSummary.warnings} 个警告`}
                  </p>
                )}
              </TableCell>
              <TableCell><StageBadge stage={t.stage} /></TableCell>
              <TableCell><ProgressCell task={t} /></TableCell>
              <TableCell><TaskStatusBadge status={t.status} /></TableCell>
              <TableCell className="text-right tabular-nums">
                {t.exceptionCount > 0 ? (
                  <span className="font-medium text-destructive">{t.exceptionCount}</span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{t.createdBy}</TableCell>
              <TableCell className="whitespace-nowrap text-right font-mono text-xs text-muted-foreground">{t.createdAt}</TableCell>
              <TableCell className="whitespace-nowrap text-right font-mono text-xs text-muted-foreground">{t.updatedAt}</TableCell>
              <TableCell className="sticky right-0 z-10 bg-card group-hover:bg-muted/50" onClick={(e) => e.stopPropagation()}>
                <TaskActions task={t} onAction={onAction} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
