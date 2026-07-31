'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Copy, Download } from 'lucide-react'
import { taskList, validationSteps, calculationSteps } from '@/lib/task-data'
import type { PlanTask } from '@/lib/task-types'
import { TaskStatsCards, statCardDefs, type StatCard } from '@/components/tasks/task-stats-cards'
import { TaskToolbar, emptyFilters, type TaskFilters } from '@/components/tasks/task-toolbar'
import { TaskTable } from '@/components/tasks/task-table'
import { TaskDetailSheet } from '@/components/tasks/task-detail-sheet'
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog'
import { ProcessDialog, type ProcessKind } from '@/components/tasks/process-dialog'
import { TaskToast, type ToastState } from '@/components/tasks/task-toast'

// 昨日环比（模拟）
const DELTAS: Record<string, number> = {
  进行中: 2,
  待校验: 1,
  校验失败: -1,
  计算中: 1,
  待调整: 3,
  待确认: -2,
}

// 快捷筛选谓词
const QUICK_PREDICATE: Record<string, (t: PlanTask) => boolean> = {
  全部任务: () => true,
  我的任务: (t) => t.mine,
  进行中: (t) => ['计算中', '调整中'].includes(t.status),
  有异常: (t) => t.exceptionCount > 0 || ['校验失败', '计算失败'].includes(t.status),
  待我处理: (t) => t.mine && ['待校验', '待计算', '待调整', '待确认', '校验失败', '计算失败'].includes(t.status),
  今日创建: (t) => t.createdAt.startsWith('2026-07-31'),
  已完成: (t) => ['已确认', '已发布'].includes(t.status),
}

// 统计卡片 -> 状态集合
const STAT_STATUS: Record<string, string[]> = {
  进行中: ['计算中', '调整中'],
  待校验: ['待校验'],
  校验失败: ['校验失败'],
  计算中: ['计算中'],
  待调整: ['待调整', '调整中'],
  待确认: ['待确认'],
}

export default function TasksPage() {
  const [tasks] = useState<PlanTask[]>(taskList)
  const [quick, setQuick] = useState('全部任务')
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters)
  const [statKey, setStatKey] = useState<string | null>(null)

  const [detailTask, setDetailTask] = useState<PlanTask | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [process, setProcess] = useState<{ open: boolean; kind: ProcessKind; task: PlanTask | null }>({
    open: false,
    kind: 'validate',
    task: null,
  })
  const [toast, setToast] = useState<ToastState | null>(null)

  const notify = (message: string, tone: ToastState['tone'] = 'success') =>
    setToast({ id: Date.now(), message, tone })

  // 统计卡片数据
  const statCards: StatCard[] = useMemo(
    () =>
      statCardDefs.map((def) => ({
        ...def,
        count: tasks.filter((t) => STAT_STATUS[def.key].includes(t.status)).length,
        delta: DELTAS[def.key] ?? 0,
      })),
    [tasks],
  )

  // 过滤后的任务列表
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (!QUICK_PREDICATE[quick](t)) return false
      if (statKey && !STAT_STATUS[statKey].includes(t.status)) return false
      if (filters.id && !t.id.toLowerCase().includes(filters.id.toLowerCase())) return false
      if (filters.name && !t.name.includes(filters.name)) return false
      if (filters.cycle && !t.cycle.includes(filters.cycle) && !t.startWeek.includes(filters.cycle)) return false
      if (filters.status !== 'all' && t.status !== filters.status) return false
      if (filters.stage !== 'all' && t.stage !== filters.stage) return false
      if (filters.validation !== 'all' && t.validation !== filters.validation) return false
      if (filters.createdBy !== 'all' && t.createdBy !== filters.createdBy) return false
      if (filters.date && !t.createdAt.startsWith(filters.date)) return false
      return true
    })
  }, [tasks, quick, statKey, filters])

  const openDetail = (task: PlanTask) => {
    setDetailTask(task)
    setDetailOpen(true)
  }

  // 动态操作分发
  const handleAction = (key: string, task: PlanTask) => {
    switch (key) {
      case 'validate':
      case 'revalidate':
        setProcess({ open: true, kind: 'validate', task })
        break
      case 'calculate':
      case 'recalculate':
        setProcess({ open: true, kind: 'calculate', task })
        break
      case 'view-progress':
      case 'view-log':
      case 'view-result':
      case 'view-version':
      case 'view-exceptions':
      case 'view-snapshot':
      case 'view-error':
      case 'view-suggestions':
      case 'compare':
        openDetail(task)
        break
      case 'edit':
      case 'edit-data':
        notify(`已打开「${task.name}」编辑`, 'info')
        break
      case 'adjust':
        notify('已进入人工调整工作台', 'info')
        break
      case 'confirm':
      case 'submit':
        notify(`「${task.name}」已提交确认`)
        break
      case 'publish':
        notify(`「${task.name}」已发布为正式版本`)
        break
      case 'reject':
        notify('已驳回调整，退回人工调整阶段', 'info')
        break
      case 'copy':
        notify(`已复制「${task.name}」为新草稿`)
        break
      case 'export':
        notify('计算结果已导出为 Excel', 'info')
        break
      case 'delete':
        notify(`已删除「${task.name}」`)
        break
      case 'cancel':
        notify(`已取消「${task.name}」`)
        break
      default:
        openDetail(task)
    }
  }

  const handleProcessDone = (kind: ProcessKind, task: PlanTask | null) => {
    if (kind === 'validate') {
      setProcess({ open: true, kind: 'calculate', task })
    } else {
      notify(`「${task?.name ?? ''}」计算完成，已生成计划建议`)
      if (task) openDetail(task)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 页面标题 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">MRP 计划任务</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理计划创建、数据校验、MRP 计算、人工调整与版本发布</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => notify('请选择要复制的历史计划', 'info')}>
            <Copy className="size-4" />
            复制已有计划
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => notify('任务列表已导出', 'info')}>
            <Download className="size-4" />
            导出任务列表
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            新建计划任务
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <TaskStatsCards
        cards={statCards}
        active={statKey}
        onSelect={(key) => setStatKey((k) => (k === key ? null : key))}
      />

      {/* 快捷筛选 + 筛选表单 */}
      <TaskToolbar
        quick={quick}
        onQuickChange={setQuick}
        filters={filters}
        onApply={(f) => setFilters(f)}
        onReset={() => setFilters(emptyFilters)}
      />

      {/* 列表统计 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          共 <span className="font-medium text-foreground tabular-nums">{filtered.length}</span> 条任务
          {statKey && <span className="ml-1">· 已按「{statKey}」筛选</span>}
        </span>
        {(statKey || quick !== '全部任务') && (
          <button
            className="text-primary hover:underline"
            onClick={() => {
              setStatKey(null)
              setQuick('全部任务')
              setFilters(emptyFilters)
            }}
          >
            清除筛选
          </button>
        )}
      </div>

      {/* 任务表格 */}
      <TaskTable tasks={filtered} onOpenDetail={openDetail} onAction={handleAction} />

      {/* 详情抽屉 */}
      <TaskDetailSheet task={detailTask} open={detailOpen} onOpenChange={setDetailOpen} onAction={handleAction} />

      {/* 新建向导 */}
      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(mode, name) =>
          notify(mode === 'draft' ? `已保存草稿「${name}」` : `已创建「${name}」并开始校验`)
        }
      />

      {/* 校验 / 计算进度 */}
      <ProcessDialog
        open={process.open}
        onOpenChange={(v) => setProcess((p) => ({ ...p, open: v }))}
        kind={process.kind}
        steps={process.kind === 'validate' ? validationSteps : calculationSteps}
        task={process.task}
        onDone={handleProcessDone}
      />

      <TaskToast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
