'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type Tone, toneClass, toneDot, toneText, toneSoftBg } from '@/lib/tone'
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  Inbox,
  type LucideIcon,
} from 'lucide-react'

/* ---------------- Page header ---------------- */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground text-balance">{title}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">{subtitle}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/* ---------------- Tone badge ---------------- */

export function ToneBadge({
  tone,
  children,
  dot,
  className,
}: {
  tone: Tone
  children: ReactNode
  dot?: boolean
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn('h-6 gap-1.5 px-2 text-xs font-medium', toneClass[tone], className)}>
      {dot ? <span className={cn('size-1.5 rounded-full', toneDot[tone])} aria-hidden /> : null}
      {children}
    </Badge>
  )
}

/* ---------------- Stat tiles ---------------- */

export interface StatTile {
  key: string
  label: string
  value: string | number
  unit?: string
  tone: Tone
  icon: LucideIcon
  hint?: string
}

export function StatTiles({
  items,
  columns = 6,
  active,
  onSelect,
}: {
  items: StatTile[]
  columns?: 4 | 5 | 6
  active?: string | null
  onSelect?: (key: string) => void
}) {
  const cols = {
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-3 xl:grid-cols-6',
  }[columns]
  return (
    <div className={cn('grid grid-cols-2 gap-3', cols)}>
      {items.map((s) => {
        const Icon = s.icon
        const clickable = Boolean(onSelect)
        const isActive = active === s.key
        return (
          <Card
            key={s.key}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onSelect?.(s.key) : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect?.(s.key)
                    }
                  }
                : undefined
            }
            className={cn(
              'p-4 transition-shadow',
              clickable && 'cursor-pointer hover:shadow-md focus:outline-none',
              isActive && 'ring-2 ring-primary',
            )}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <span className={cn('flex size-7 items-center justify-center rounded-md', toneSoftBg[s.tone])}>
                <Icon className="size-4" aria-hidden />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={cn('text-2xl font-semibold tabular-nums', toneText[s.tone])}>{s.value}</span>
              {s.unit ? <span className="text-xs text-muted-foreground">{s.unit}</span> : null}
            </div>
            {s.hint ? <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p> : null}
          </Card>
        )
      })}
    </div>
  )
}

/* ---------------- Filter bar ---------------- */

export function FilterBar({
  children,
  onReset,
  onSearch,
}: {
  children: ReactNode
  onReset?: () => void
  onSearch?: () => void
}) {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
      <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={onReset}>
          <RotateCcw className="size-3.5" />
          重置
        </Button>
        <Button size="sm" className="gap-1.5" onClick={onSearch}>
          <Search className="size-3.5" />
          查询
        </Button>
      </div>
    </Card>
  )
}

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function FilterInput({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <FilterField label={label}>
      <Input className="h-9" placeholder={placeholder ?? `请输入${label}`} />
    </FilterField>
  )
}

/* ---------------- Section card ---------------- */

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            {title ? <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2> : null}
            {description ? <p className="truncate text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <div className={cn(bodyClassName)}>{children}</div>
    </Card>
  )
}

/* ---------------- Pagination ---------------- */

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (p: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        共 <span className="font-medium text-foreground tabular-nums">{total}</span> 条，显示{' '}
        <span className="font-medium text-foreground tabular-nums">{from}</span>-
        <span className="font-medium text-foreground tabular-nums">{to}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className="size-4" />
          上一页
        </Button>
        <span className="px-3 text-xs text-muted-foreground tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          下一页
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

/* ---------------- Empty state ---------------- */

export function EmptyState({ message = '暂无数据', icon: Icon = Inbox }: { message?: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
