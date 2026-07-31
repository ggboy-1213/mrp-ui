'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  PageHeader,
  SectionCard,
  StatTiles,
  ToneBadge,
  type StatTile,
} from '@/components/shared/page-kit'
import { DataTable, DataTableToolbar, type Column } from '@/components/shared/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  versionDiffs,
  diffSummary,
  diffTypeTone,
  versionOptions,
  type VersionDiff,
} from '@/lib/version-diff-data'
import {
  ArrowLeftRight,
  Play,
  Download,
  PackagePlus,
  PackageX,
  Boxes,
  PlusCircle,
  MinusCircle,
  Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function VersionComparePage() {
  const [versionA, setVersionA] = useState(versionOptions[0])
  const [versionB, setVersionB] = useState(versionOptions[1])
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact')

  const swap = () => {
    setVersionA(versionB)
    setVersionB(versionA)
  }

  const stats: StatTile[] = [
    { key: 'replenish', label: '补货总量变化', value: `${diffSummary.replenishDelta > 0 ? '+' : ''}${diffSummary.replenishDelta.toLocaleString()}`, tone: diffSummary.replenishDelta >= 0 ? 'success' : 'danger', icon: Boxes },
    { key: 'shortage', label: '缺货 SKU 变化', value: diffSummary.shortageDelta, tone: 'success', icon: PackageX },
    { key: 'overstock', label: '高库存 SKU 变化', value: `+${diffSummary.overstockDelta}`, tone: 'warning', icon: PackagePlus },
    { key: 'added', label: '新增建议', value: diffSummary.added, unit: '条', tone: 'primary', icon: PlusCircle },
    { key: 'removed', label: '删除建议', value: diffSummary.removed, unit: '条', tone: 'danger', icon: MinusCircle },
    { key: 'changed', label: '数量变更建议', value: diffSummary.changed, unit: '条', tone: 'mrp', icon: Pencil },
  ]

  const columns: Column<VersionDiff>[] = [
    { key: 'sku', header: 'SKU', sticky: 'left', width: '120px', render: (r) => <span className="font-medium">{r.sku}</span> },
    { key: 'country', header: '国家', render: (r) => r.country },
    { key: 'platform', header: '平台', render: (r) => r.platform },
    { key: 'warehouse', header: '仓库', render: (r) => r.warehouse },
    { key: 'planWeek', header: '计划周', render: (r) => r.planWeek },
    { key: 'qtyA', header: '版本 A 数量', align: 'right', sortable: true, sortValue: (r) => r.qtyA, render: (r) => r.qtyA.toLocaleString() },
    { key: 'qtyB', header: '版本 B 数量', align: 'right', sortable: true, sortValue: (r) => r.qtyB, render: (r) => r.qtyB.toLocaleString() },
    { key: 'diff', header: '差异数量', align: 'right', render: (r) => (
      <span className={cn('font-medium tabular-nums', r.diff > 0 ? 'text-success' : r.diff < 0 ? 'text-destructive' : 'text-muted-foreground')}>
        {r.diff > 0 ? `+${r.diff}` : r.diff}
      </span>
    ) },
    { key: 'diffRate', header: '差异比例', align: 'right', render: (r) => (
      <span className={cn('tabular-nums', r.diffRate > 0 ? 'text-success' : r.diffRate < 0 ? 'text-destructive' : 'text-muted-foreground')}>
        {r.diffType === '无变化' ? '-' : `${r.diffRate > 0 ? '+' : ''}${r.diffRate}%`}
      </span>
    ) },
    { key: 'diffType', header: '差异类型', render: (r) => <ToneBadge tone={diffTypeTone[r.diffType]}>{r.diffType}</ToneBadge> },
    { key: 'reason', header: '差异原因', width: '160px', render: (r) => <span className="text-muted-foreground">{r.reason}</span> },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="版本对比"
        subtitle="对比两个 MRP 版本之间的补货数量、缺货与高库存变化，定位新增、删除与数量变更建议。"
        actions={<Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" />导出差异</Button>}
      />

      <Card className="p-4">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <p className="text-xs text-muted-foreground">版本 A（基准）</p>
            <Select value={versionA} onValueChange={(v) => setVersionA(v as string)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {versionOptions.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" className="mb-0.5 shrink-0" onClick={swap} aria-label="交换版本">
            <ArrowLeftRight className="size-4" />
          </Button>
          <div className="flex-1 space-y-1.5">
            <p className="text-xs text-muted-foreground">版本 B（对比）</p>
            <Select value={versionB} onValueChange={(v) => setVersionB(v as string)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {versionOptions.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="mb-0.5 shrink-0 gap-1.5"><Play className="size-4" />开始对比</Button>
        </div>
      </Card>

      <StatTiles items={stats} columns={6} />

      <SectionCard title="差异明细" description={`${versionA} 与 ${versionB} 的逐 SKU 差异`} bodyClassName="p-0">
        <DataTableToolbar count={versionDiffs.length} density={density} onDensity={setDensity} />
        <DataTable columns={columns} rows={versionDiffs} density={density} maxHeight="36rem" />
      </SectionCard>
    </div>
  )
}
