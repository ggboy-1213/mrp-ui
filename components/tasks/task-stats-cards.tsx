'use client'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight, Loader2, AlertTriangle, XCircle, Cpu, SlidersHorizontal, CircleCheckBig } from 'lucide-react'
import type { Tone } from '@/lib/task-types'

export interface StatCard {
  key: string
  label: string
  count: number
  delta: number
  tone: Tone
  icon: typeof Loader2
}

const toneText: Record<Tone, string> = {
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  mrp: 'text-mrp',
  warning: 'text-[oklch(0.5_0.13_60)]',
  success: 'text-success',
  danger: 'text-destructive',
}

const toneBg: Record<Tone, string> = {
  muted: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  mrp: 'bg-mrp/10 text-mrp',
  warning: 'bg-warning/15 text-[oklch(0.5_0.13_60)]',
  success: 'bg-success/12 text-success',
  danger: 'bg-destructive/10 text-destructive',
}

const toneRing: Record<Tone, string> = {
  muted: 'ring-muted-foreground/40',
  primary: 'ring-primary',
  mrp: 'ring-mrp',
  warning: 'ring-warning',
  success: 'ring-success',
  danger: 'ring-destructive',
}

export const statCardDefs: Omit<StatCard, 'count' | 'delta'>[] = [
  { key: '进行中', label: '进行中任务', tone: 'primary', icon: Loader2 },
  { key: '待检查', label: '待数据检查', tone: 'warning', icon: AlertTriangle },
  { key: '检查失败', label: '检查失败', tone: 'danger', icon: XCircle },
  { key: '计算中', label: '计算中', tone: 'mrp', icon: Cpu },
  { key: '计算完成', label: '待人工调整', tone: 'warning', icon: SlidersHorizontal },
  { key: '待确认', label: '待确认发布', tone: 'warning', icon: CircleCheckBig },
]

export function TaskStatsCards({
  cards,
  active,
  onSelect,
}: {
  cards: StatCard[]
  active: string | null
  onSelect: (key: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => {
        const Icon = c.icon
        const positive = c.delta >= 0
        const isActive = active === c.key
        return (
          <Card
            key={c.key}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(c.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(c.key)
              }
            }}
            className={cn(
              'cursor-pointer p-4 transition-shadow hover:shadow-md focus:outline-none',
              isActive && cn('ring-2', toneRing[c.tone]),
            )}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <span className={cn('flex size-7 items-center justify-center rounded-md', toneBg[c.tone])}>
                <Icon className={cn('size-4', c.key === '进行中' && 'animate-spin')} aria-hidden />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={cn('text-2xl font-semibold tabular-nums', toneText[c.tone])}>{c.count}</span>
              <span className="text-xs text-muted-foreground">个</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span className={cn('inline-flex items-center gap-0.5 font-medium', positive ? 'text-success' : 'text-destructive')}>
                {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {Math.abs(c.delta)}
              </span>
              <span className="text-muted-foreground">较昨日</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
