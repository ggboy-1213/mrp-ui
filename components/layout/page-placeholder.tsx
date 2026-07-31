import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function PagePlaceholder({
  icon: Icon,
  title,
  description,
  points,
}: {
  icon: LucideIcon
  title: string
  description: string
  points: string[]
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <Badge variant="outline" className="border-mrp/30 bg-mrp/10 text-mrp">
              规划中
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-5">
          <p className="mb-3 text-sm font-medium text-foreground">本模块将包含</p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
