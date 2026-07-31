import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { planStatusMeta, type PlanStatus } from '@/lib/types'

const toneClass: Record<string, string> = {
  muted: 'bg-muted text-muted-foreground border-transparent',
  mrp: 'bg-mrp/10 text-mrp border-mrp/30',
  warning: 'bg-warning/15 text-[oklch(0.5_0.13_60)] border-warning/40',
  success: 'bg-success/12 text-success border-success/30',
}

export function StatusBadge({ status }: { status: PlanStatus }) {
  const meta = planStatusMeta[status]
  return (
    <Badge variant="outline" className={cn('h-6 px-2 text-xs font-medium', toneClass[meta.tone])}>
      {meta.label}
    </Badge>
  )
}
