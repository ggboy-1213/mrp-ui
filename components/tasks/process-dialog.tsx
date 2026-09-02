'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Check, Loader2, Circle, CircleCheckBig, XCircle, AlertTriangle } from 'lucide-react'
import type { PlanTask } from '@/lib/task-types'

export type ProcessKind = 'validate' | 'calculate'

export function ProcessDialog({
  open,
  onOpenChange,
  kind,
  steps,
  task,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  kind: ProcessKind
  steps: string[]
  task: PlanTask | null
  onDone: (kind: ProcessKind, task: PlanTask | null) => void
}) {
  const [current, setCurrent] = useState(0)
  const [finished, setFinished] = useState(false)

  // 有阻断错误时（仅校验）：模拟发现阻断错误
  const hasBlocking = kind === 'validate' && (task?.validationSummary.blocking ?? 0) > 0

  useEffect(() => {
    if (!open) {
      setCurrent(0)
      setFinished(false)
      return
    }
    if (current >= steps.length) {
      setFinished(true)
      return
    }
    const timer = setTimeout(() => setCurrent((c) => c + 1), 650)
    return () => clearTimeout(timer)
  }, [open, current, steps.length])

  const progress = Math.round((Math.min(current, steps.length) / steps.length) * 100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={finished}>
        <DialogHeader>
          <DialogTitle>{kind === 'validate' ? 'SCM 数据检查' : 'MRP 计算'}进行中</DialogTitle>
          <DialogDescription>{task?.name}</DialogDescription>
        </DialogHeader>

        {!finished ? (
          <div className="flex flex-col gap-3">
            <Progress value={progress} className="h-2" />
            <ul className="flex flex-col gap-2">
              {steps.map((s, i) => {
                const done = i < current
                const active = i === current
                return (
                  <li key={s} className="flex items-center gap-2 text-sm">
                    {done ? (
                      <Check className="size-4 text-success" />
                    ) : active ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground/40" />
                    )}
                    <span className={cn(done ? 'text-muted-foreground' : active ? 'font-medium text-foreground' : 'text-muted-foreground/60')}>
                      {s}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <ResultView kind={kind} hasBlocking={hasBlocking} task={task} />
        )}

        {finished && (
          <div className="-mx-4 -mb-4 flex justify-end gap-2 rounded-b-xl border-t bg-muted/50 p-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
            {kind === 'validate' ? (
              <Button disabled={hasBlocking} onClick={() => { onDone(kind, task); onOpenChange(false) }}>
                {hasBlocking ? '存在阻断错误' : '发起计算'}
              </Button>
            ) : (
              <Button onClick={() => { onDone(kind, task); onOpenChange(false) }}>查看结果</Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ResultView({ kind, hasBlocking, task }: { kind: ProcessKind; hasBlocking: boolean; task: PlanTask | null }) {
  if (kind === 'calculate') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/12 text-success">
          <CircleCheckBig className="size-6" />
        </span>
        <div>
          <p className="font-medium text-foreground">MRP 计算完成</p>
          <p className="text-sm text-muted-foreground">已生成 {task?.suggestionQty ? task.suggestionQty.toLocaleString('zh-CN') : '512'} 件补货建议，识别缺货 SKU {task?.shortageSku ?? 28} 个</p>
        </div>
      </div>
    )
  }
  const s = task?.validationSummary ?? { passed: 46, blocking: 0, warnings: 4 }
  return (
    <div className="flex flex-col gap-3 py-1">
      <div className="flex items-center gap-2">
        {hasBlocking ? (
          <XCircle className="size-6 text-destructive" />
        ) : (
          <CircleCheckBig className="size-6 text-success" />
        )}
        <p className="font-medium text-foreground">{hasBlocking ? '检查未通过' : '检查完成'}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <ResultStat label="通过项" value={s.passed} tone="text-success" />
        <ResultStat label="阻断错误" value={s.blocking} tone="text-destructive" />
        <ResultStat label="警告数量" value={s.warnings} tone="text-[oklch(0.5_0.13_60)]" />
      </div>
      <div
        className={cn(
          'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
          hasBlocking ? 'border border-destructive/30 bg-destructive/10 text-destructive' : 'border border-success/30 bg-success/10 text-success',
        )}
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>{hasBlocking ? '存在阻断错误，需修复后才能发起 MRP 计算。' : '未发现阻断错误，可继续发起 MRP 计算。'}</span>
      </div>
    </div>
  )
}

function ResultStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className={cn('text-2xl font-semibold tabular-nums', tone)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
