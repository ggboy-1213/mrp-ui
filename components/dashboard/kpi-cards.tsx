import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { KpiMetric } from '@/lib/types'

const toneStyles: Record<KpiMetric['tone'], { bar: string; value: string }> = {
  default: { bar: 'bg-primary', value: 'text-foreground' },
  mrp: { bar: 'bg-mrp', value: 'text-mrp' },
  success: { bar: 'bg-success', value: 'text-success' },
  warning: { bar: 'bg-warning', value: 'text-foreground' },
  danger: { bar: 'bg-destructive', value: 'text-destructive' },
}

function formatValue(v: number) {
  return v >= 10000 ? v.toLocaleString('zh-CN') : v.toString()
}

export function KpiCards({ kpis }: { kpis: KpiMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => {
        const tone = toneStyles[kpi.tone]
        const positive = (kpi.delta ?? 0) >= 0
        return (
          <Card key={kpi.key} className="relative overflow-hidden p-4">
            <span className={cn('absolute inset-y-0 left-0 w-1', tone.bar)} aria-hidden />
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={cn('text-2xl font-semibold tabular-nums', tone.value)}>
                {formatValue(kpi.value)}
              </span>
              {kpi.unit && <span className="text-xs text-muted-foreground">{kpi.unit}</span>}
            </div>
            {kpi.delta !== undefined && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-medium',
                    positive ? 'text-success' : 'text-destructive',
                  )}
                >
                  {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                  {Math.abs(kpi.delta)}%
                </span>
                <span className="text-muted-foreground">环比</span>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
