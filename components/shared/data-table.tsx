'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown, Rows3, Rows4 } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  align?: 'left' | 'right' | 'center'
  width?: string
  sortable?: boolean
  className?: string
  sticky?: 'left' | 'right'
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
}

export function DataTableToolbar({
  count,
  density,
  onDensity,
  children,
}: {
  count: number
  density: 'comfortable' | 'compact'
  onDensity: (d: 'comfortable' | 'compact') => void
  children?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
      <p className="text-xs text-muted-foreground">
        查询结果 <span className="font-medium text-foreground tabular-nums">{count}</span> 条
      </p>
      <div className="flex items-center gap-2">
        {children}
        <div className="flex items-center rounded-md border border-border p-0.5">
          <button
            type="button"
            aria-label="宽松"
            onClick={() => onDensity('comfortable')}
            className={cn(
              'flex size-6 items-center justify-center rounded transition-colors',
              density === 'comfortable' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Rows3 className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="紧凑"
            onClick={() => onDensity('compact')}
            className={cn(
              'flex size-6 items-center justify-center rounded transition-colors',
              density === 'compact' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Rows4 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  density = 'comfortable',
  onRowClick,
  maxHeight = '32rem',
}: {
  columns: Column<T>[]
  rows: T[]
  density?: 'comfortable' | 'compact'
  onRowClick?: (row: T) => void
  maxHeight?: string
}) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return rows
    const arr = [...rows].sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [rows, sortKey, sortDir, columns])

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const cellPad = density === 'compact' ? 'px-3 py-1.5' : 'px-3 py-2.5'
  const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' }

  return (
    <div className="overflow-auto" style={{ maxHeight }}>
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-secondary">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'whitespace-nowrap border-b border-border px-3 py-2.5 text-xs font-medium text-muted-foreground',
                  alignClass[col.align ?? 'left'],
                  col.sticky === 'left' && 'sticky left-0 z-20 bg-secondary',
                  col.sticky === 'right' && 'sticky right-0 z-20 bg-secondary',
                )}
                style={{ width: col.width, minWidth: col.width }}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    {col.header}
                    {sortKey === col.key ? (
                      sortDir === 'asc' ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 opacity-40" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-border/70 transition-colors last:border-0',
                onRowClick && 'cursor-pointer hover:bg-accent/50',
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'whitespace-nowrap text-foreground',
                    cellPad,
                    alignClass[col.align ?? 'left'],
                    col.sticky === 'left' && 'sticky left-0 z-[1] bg-card',
                    col.sticky === 'right' && 'sticky right-0 z-[1] bg-card',
                    col.className,
                  )}
                  style={{ width: col.width, minWidth: col.width }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
