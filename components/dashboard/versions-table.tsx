import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from './status-badge'
import type { PlanVersion } from '@/lib/types'

export function VersionsTable({ versions }: { versions: PlanVersion[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">最近计划版本</CardTitle>
        <Button render={<Link href="/versions" />} nativeButton={false} variant="ghost" size="sm" className="gap-1 text-xs">
          全部版本
          <ArrowRight className="size-3.5" />
        </Button>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>版本</TableHead>
              <TableHead>计算批次</TableHead>
              <TableHead>范围</TableHead>
              <TableHead className="text-right">SKU</TableHead>
              <TableHead className="text-right">建议</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建人</TableHead>
              <TableHead className="text-right">创建时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{v.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{v.id}</p>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{v.batch}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{v.scope}</TableCell>
                <TableCell className="text-right tabular-nums">{v.skuCount.toLocaleString('zh-CN')}</TableCell>
                <TableCell className="text-right tabular-nums text-mrp">
                  {v.suggestionCount.toLocaleString('zh-CN')}
                </TableCell>
                <TableCell>
                  <StatusBadge status={v.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{v.createdBy}</TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {v.createdAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
