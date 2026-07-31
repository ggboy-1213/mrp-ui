import { CalendarClock, GitBranch, Globe2, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import type { PlanVersion } from '@/lib/types'

export function CurrentVersionCard({ version }: { version: PlanVersion }) {
  const rows = [
    { icon: GitBranch, label: '计算批次', value: version.batch },
    { icon: Globe2, label: '计划范围', value: version.scope },
    { icon: User, label: '创建人', value: version.createdBy },
    { icon: CalendarClock, label: '创建时间', value: version.createdAt },
  ]
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">当前计划版本</p>
          <CardTitle className="mt-1 text-base">{version.name}</CardTitle>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{version.id}</p>
        </div>
        <StatusBadge status={version.status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <dl className="flex flex-col gap-2.5">
          {rows.map((r) => {
            const Icon = r.icon
            return (
              <div key={r.label} className="flex items-center gap-2 text-sm">
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <dt className="w-16 shrink-0 text-muted-foreground">{r.label}</dt>
                <dd className="truncate font-medium text-foreground">{r.value}</dd>
              </div>
            )
          })}
        </dl>
        <div className="mt-1 grid grid-cols-2 gap-3 border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground">参与 SKU</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {version.skuCount.toLocaleString('zh-CN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">计划建议</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-mrp">
              {version.suggestionCount.toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
