import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  taskStatusMeta,
  validationMeta,
  type TaskStatus,
  type ValidationStatus,
  type TaskStage,
  type Tone,
} from '@/lib/task-types'
import {
  FileEdit,
  Database,
  ShieldCheck,
  Camera,
  Cpu,
  SlidersHorizontal,
  CircleCheckBig,
  Rocket,
} from 'lucide-react'

export const toneClass: Record<Tone, string> = {
  muted: 'bg-muted text-muted-foreground border-transparent',
  primary: 'bg-primary/10 text-primary border-primary/25',
  mrp: 'bg-mrp/10 text-mrp border-mrp/30',
  warning: 'bg-warning/15 text-[oklch(0.5_0.13_60)] border-warning/40',
  success: 'bg-success/12 text-success border-success/30',
  danger: 'bg-destructive/10 text-destructive border-destructive/30',
}

export const toneDot: Record<Tone, string> = {
  muted: 'bg-muted-foreground',
  primary: 'bg-primary',
  mrp: 'bg-mrp',
  warning: 'bg-warning',
  success: 'bg-success',
  danger: 'bg-destructive',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const tone = taskStatusMeta[status].tone
  const pulse = status === '计算中' || status === '调整中'
  return (
    <Badge variant="outline" className={cn('h-6 gap-1.5 px-2 text-xs font-medium', toneClass[tone])}>
      <span className={cn('size-1.5 rounded-full', toneDot[tone], pulse && 'animate-pulse')} aria-hidden />
      {status}
    </Badge>
  )
}

export function ValidationBadge({ status }: { status: ValidationStatus }) {
  const tone = validationMeta[status].tone
  return (
    <Badge variant="outline" className={cn('h-6 px-2 text-xs font-medium', toneClass[tone])}>
      {status}
    </Badge>
  )
}

const stageIcon: Record<TaskStage, typeof FileEdit> = {
  草稿: FileEdit,
  数据准备: Database,
  数据校验: ShieldCheck,
  数据快照: Camera,
  MRP计算: Cpu,
  人工调整: SlidersHorizontal,
  待确认: CircleCheckBig,
  已发布: Rocket,
}

export function StageBadge({ stage }: { stage: TaskStage }) {
  const Icon = stageIcon[stage]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
      <Icon className="size-3.5 text-primary" aria-hidden />
      {stage}
    </span>
  )
}
