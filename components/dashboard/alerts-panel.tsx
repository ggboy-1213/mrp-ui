import Link from 'next/link'
import { AlertTriangle, ArrowRight, Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AlertItem, AlertLevel } from '@/lib/types'

const levelMeta: Record<AlertLevel, { label: string; icon: typeof Info; className: string; dot: string }> = {
  critical: { label: '严重', icon: TriangleAlert, className: 'text-destructive', dot: 'bg-destructive' },
  warning: { label: '预警', icon: AlertTriangle, className: 'text-warning', dot: 'bg-warning' },
  info: { label: '提示', icon: Info, className: 'text-muted-foreground', dot: 'bg-muted-foreground' },
}

export function AlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">缺货与高库存预警</CardTitle>
        <Button render={<Link href="/alerts" />} nativeButton={false} variant="ghost" size="sm" className="gap-1 text-xs">
          预警中心
          <ArrowRight className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {alerts.slice(0, 6).map((a) => {
          const meta = levelMeta[a.level]
          const Icon = meta.icon
          return (
            <div key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <Icon className={cn('mt-0.5 size-4 shrink-0', meta.className)} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="h-5 px-1.5 text-[11px]">
                    {a.type}
                  </Badge>
                  <span className="font-mono text-xs text-foreground">{a.sku}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.country} · {a.platform} · {a.warehouse}
                  </span>
                  <Badge className="ml-auto h-5 bg-accent px-1.5 text-[11px] text-accent-foreground">
                    {a.week}
                  </Badge>
                </div>
                <p className="mt-1 text-sm leading-snug text-foreground">{a.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">责任人：{a.owner}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
