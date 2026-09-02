'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, RotateCcw, ChevronDown, SlidersHorizontal } from 'lucide-react'
import type { TaskStatus, TaskStage, ValidationStatus } from '@/lib/task-types'

export interface TaskFilters {
  id: string
  name: string
  cycle: string
  status: string
  stage: string
  validation: string
  createdBy: string
  date: string
}

export const emptyFilters: TaskFilters = {
  id: '',
  name: '',
  cycle: '',
  status: 'all',
  stage: 'all',
  validation: 'all',
  createdBy: 'all',
  date: '',
}

const QUICK_FILTERS = ['全部任务', '我的任务', '进行中', '有异常', '待我处理', '今日创建', '已完成']

const STATUS_OPTIONS: TaskStatus[] = ['草稿', '待检查', '检查失败', '待计算', '计算中', '计算失败', '计算完成', '调整中', '待确认', '已确认', '已发布', '已取消']
const STAGE_OPTIONS: TaskStage[] = ['草稿', '数据检查', '计算快照', 'MRP计算', '结果分析', '人工调整', '待确认', '已发布']
const VALIDATION_OPTIONS: ValidationStatus[] = ['未检查', '检查中', '检查通过', '检查警告', '检查失败']
const CREATOR_OPTIONS = ['李航', '张伟', '陈曦', '王敏']

export function TaskToolbar({
  quick,
  onQuickChange,
  filters,
  onApply,
  onReset,
}: {
  quick: string
  onQuickChange: (q: string) => void
  filters: TaskFilters
  onApply: (f: TaskFilters) => void
  onReset: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState<TaskFilters>(filters)

  const update = (patch: Partial<TaskFilters>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div className="flex flex-col gap-3">
      {/* 快捷筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        {QUICK_FILTERS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onQuickChange(q)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              quick === q
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {q}
          </button>
        ))}
      </div>

      {/* 筛选表单 */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="任务编号">
            <Input value={draft.id} onChange={(e) => update({ id: e.target.value })} placeholder="TSK-..." className="h-9" />
          </Field>
          <Field label="计划名称">
            <Input value={draft.name} onChange={(e) => update({ name: e.target.value })} placeholder="搜索计划名称" className="h-9" />
          </Field>
          <Field label="任务状态">
            <Select value={draft.status} onValueChange={(v) => update({ status: (v as string) ?? 'all' })}>
              <SelectTrigger className="h-9 w-full"><SelectValue>{(v: string) => (v === 'all' ? '全部状态' : v)}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="当前阶段">
            <Select value={draft.stage} onValueChange={(v) => update({ stage: (v as string) ?? 'all' })}>
              <SelectTrigger className="h-9 w-full"><SelectValue>{(v: string) => (v === 'all' ? '全部阶段' : v)}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部阶段</SelectItem>
                {STAGE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          {expanded && (
            <>
              <Field label="计划周期">
                <Input value={draft.cycle} onChange={(e) => update({ cycle: e.target.value })} placeholder="例如 2026 W31" className="h-9" />
              </Field>
              <Field label="数据检查状态">
                <Select value={draft.validation} onValueChange={(v) => update({ validation: (v as string) ?? 'all' })}>
                  <SelectTrigger className="h-9 w-full"><SelectValue>{(v: string) => (v === 'all' ? '全部' : v)}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {VALIDATION_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="创建人">
                <Select value={draft.createdBy} onValueChange={(v) => update({ createdBy: (v as string) ?? 'all' })}>
                  <SelectTrigger className="h-9 w-full"><SelectValue>{(v: string) => (v === 'all' ? '全部创建人' : v)}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部创建人</SelectItem>
                    {CREATOR_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="创建日期">
                <Input type="date" value={draft.date} onChange={(e) => update({ date: e.target.value })} className="h-9" />
              </Field>
            </>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground"
            onClick={() => setExpanded((v) => !v)}
          >
            <SlidersHorizontal className="size-3.5" />
            {expanded ? '收起筛选' : '展开更多'}
            <ChevronDown className={cn('size-3.5 transition-transform', expanded && 'rotate-180')} />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                setDraft(emptyFilters)
                onReset()
              }}
            >
              <RotateCcw className="size-3.5" />
              重置
            </Button>
            <Button size="sm" className="gap-1" onClick={() => onApply(draft)}>
              <Search className="size-3.5" />
              查询
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
