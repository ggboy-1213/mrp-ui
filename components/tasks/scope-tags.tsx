import { cn } from '@/lib/utils'
import type { TaskScope } from '@/lib/task-types'

// 将计划范围压缩为简洁标签：国家 / 平台 / 仓库 / 产品范围，超出折叠为 +N
export function ScopeTags({ scope, className }: { scope: TaskScope; className?: string }) {
  const parts: string[] = [
    scope.countries.length > 1 ? `${scope.countries[0]} +${scope.countries.length - 1}` : scope.countries[0],
    scope.platforms.length > 1 ? `${scope.platforms[0]} +${scope.platforms.length - 1}` : scope.platforms[0],
    scope.warehouses.length > 1 ? `${scope.warehouses[0]} +${scope.warehouses.length - 1}` : scope.warehouses[0],
    scope.productScope,
  ]
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {parts.map((p, i) => (
        <span
          key={i}
          className="inline-flex items-center rounded border border-border bg-secondary px-1.5 py-0.5 text-[11px] leading-none text-secondary-foreground"
        >
          {p}
        </span>
      ))}
    </div>
  )
}
