'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import type { PlanTask, TaskStatus } from '@/lib/task-types'

export interface TaskAction {
  key: string
  label: string
  danger?: boolean
}

// 根据任务状态返回动态操作项
export function getTaskActions(status: TaskStatus): TaskAction[] {
  switch (status) {
    case '草稿':
      return [
        { key: 'edit', label: '编辑' },
        { key: 'validate', label: '开始检查' },
        { key: 'delete', label: '删除', danger: true },
      ]
    case '待检查':
      return [
        { key: 'validate', label: '开始检查' },
        { key: 'edit', label: '编辑' },
        { key: 'delete', label: '删除', danger: true },
      ]
    case '检查失败':
      return [
        { key: 'view-exceptions', label: '查看异常' },
        { key: 'revalidate', label: '重新检查' },
        { key: 'view-check', label: '查看检查明细' },
      ]
    case '待计算':
      return [
        { key: 'calculate', label: '发起计算' },
        { key: 'view-snapshot', label: '查看计算快照' },
      ]
    case '计算中':
      return [
        { key: 'view-progress', label: '查看进度' },
        { key: 'view-log', label: '查看日志' },
        { key: 'cancel', label: '取消任务', danger: true },
      ]
    case '计算失败':
      return [
        { key: 'view-error', label: '查看错误' },
        { key: 'recalculate', label: '重新计算' },
        { key: 'copy', label: '复制任务' },
      ]
    case '计算完成':
      return [
        { key: 'adjust', label: '进入人工调整' },
        { key: 'view-suggestions', label: '查看计划建议' },
      ]
    case '调整中':
      return [
        { key: 'adjust', label: '继续调整' },
        { key: 'view-suggestions', label: '查看计划建议' },
        { key: 'submit', label: '提交确认' },
      ]
    case '待确认':
      return [
        { key: 'view-result', label: '查看结果' },
        { key: 'confirm', label: '提交确认' },
        { key: 'reject', label: '驳回调整', danger: true },
      ]
    case '已确认':
      return [
        { key: 'view-version', label: '查看版本' },
        { key: 'publish', label: '发布版本' },
        { key: 'copy', label: '复制任务' },
      ]
    case '已发布':
      return [
        { key: 'view-version', label: '查看版本' },
        { key: 'compare', label: '版本对比' },
        { key: 'copy', label: '复制任务' },
        { key: 'export', label: '导出结果' },
      ]
    case '已取消':
      return [
        { key: 'copy', label: '复制任务' },
        { key: 'view-log', label: '查看日志' },
      ]
    default:
      return [{ key: 'view', label: '查看详情' }]
  }
}

export function TaskActions({
  task,
  onAction,
}: {
  task: PlanTask
  onAction: (key: string, task: PlanTask) => void
}) {
  const actions = getTaskActions(task.status)
  const primary = actions[0]
  const rest = actions.slice(1)

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        size="sm"
        variant={primary.danger ? 'outline' : 'default'}
        className="h-7 px-2 text-xs"
        onClick={(e) => {
          e.stopPropagation()
          onAction(primary.key, task)
        }}
      >
        {primary.label}
      </Button>
      {rest.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="icon-sm" variant="ghost" className="size-7" />}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">更多操作</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            {rest.map((a) => (
              <DropdownMenuItem
                key={a.key}
                variant={a.danger ? 'destructive' : 'default'}
                onClick={(e) => {
                  e.stopPropagation()
                  onAction(a.key, task)
                }}
              >
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
