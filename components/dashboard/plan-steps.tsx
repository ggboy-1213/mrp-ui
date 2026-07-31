import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PlanStep } from '@/lib/types'

export function PlanSteps({ steps }: { steps: PlanStep[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">当前计划进度</CardTitle>
        <Badge variant="outline" className="border-mrp/30 bg-mrp/10 text-mrp">
          MRP 计算中 68%
        </Badge>
      </CardHeader>
      <CardContent>
        <ol className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-y-0">
          {steps.map((step, i) => {
            const done = step.status === 'done'
            const active = step.status === 'active'
            return (
              <li key={step.key} className="relative flex flex-col gap-2 pr-2">
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      'absolute left-4 top-4 hidden h-0.5 w-full lg:block',
                      done ? 'bg-success' : 'bg-border',
                    )}
                    aria-hidden
                  />
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      done && 'bg-success text-success-foreground',
                      active && 'bg-mrp text-mrp-foreground ring-4 ring-mrp/15',
                      !done && !active && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      active ? 'text-foreground' : done ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                <p className="pl-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
