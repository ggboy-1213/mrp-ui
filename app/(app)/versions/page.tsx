'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  PageHeader,
  FilterBar,
  FilterField,
  FilterInput,
  SectionCard,
  Pagination,
  ToneBadge,
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
  planVersions,
  versionStatusTone,
  type PlanVersion,
} from '@/lib/plan-versions-data'
import { Plus, GitCompare, Download, Rocket } from 'lucide-react'

const PAGE_SIZE = 10

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

export default function VersionsPage() {
  const [page, setPage] = useState(1)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [active, setActive] = useState<PlanVersion | null>(null)

  const total = planVersions.length
  const rows = planVersions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<PlanVersion>[] = [
    { key: 'code', header: '版本号', sticky: 'left', width: '170px', render: (r) => <span className="font-medium text-primary">{r.code}</span> },
    { key: 'task', header: '计划任务', width: '200px', render: (r) => r.task },
    { key: 'cycle', header: '计划周期', render: (r) => r.cycle },
    { key: 'dataSnapshot', header: '数据快照', render: (r) => r.dataSnapshot },
    { key: 'paramVersion', header: '参数版本', render: (r) => r.paramVersion },
    { key: 'skuCount', header: 'SKU 数量', align: 'right', sortable: true, sortValue: (r) => r.skuCount, render: (r) => r.skuCount.toLocaleString() },
    { key: 'replenishTotal', header: '补货总量', align: 'right', sortable: true, sortValue: (r) => r.replenishTotal, render: (r) => r.replenishTotal.toLocaleString() },
    { key: 'shortageSku', header: '缺货 SKU', align: 'right', render: (r) => <span className={r.shortageSku > 20 ? 'font-medium text-destructive' : 'text-foreground'}>{r.shortageSku}</span> },
    { key: 'overstockSku', header: '高库存 SKU', align: 'right', render: (r) => <span className={r.overstockSku > 15 ? 'font-medium text-warning' : 'text-foreground'}>{r.overstockSku}</span> },
    { key: 'adjustCount', header: '调整次数', align: 'right', render: (r) => r.adjustCount },
    { key: 'status', header: '状态', render: (r) => <ToneBadge tone={versionStatusTone[r.status]} dot>{r.status}</ToneBadge> },
    { key: 'createdBy', header: '创建人', render: (r) => r.createdBy },
    { key: 'confirmedBy', header: '确认人', render: (r) => r.confirmedBy },
    { key: 'createdAt', header: '创建时间', render: (r) => <span className="text-xs text-muted-foreground">{r.createdAt}</span> },
    { key: 'confirmedAt', header: '确认时间', render: (r) => <span className="text-xs text-muted-foreground">{r.confirmedAt}</span> },
    { key: 'ops', header: '操作', sticky: 'right', width: '90px', render: (r) => (
      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); setActive(r) }}>查看详情</Button>
    ) },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="计划版本"
        subtitle="管理和追溯历史 MRP 计划版本，留存快照、参数、调整与确认记录，支持版本对比与导出。"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><GitCompare className="size-4" />版本对比</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" />导出版本</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Rocket className="size-4" />已发布版本</Button>
            <Button size="sm" className="gap-1.5"><Plus className="size-4" />创建新版本</Button>
          </>
        }
      />

      <FilterBar>
        <FilterInput label="版本号" />
        <FilterInput label="计划任务" />
        <FilterField label="状态">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部状态' : v)}</SelectValue></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {['草稿', '计算完成', '待确认', '已发布', '已归档'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterInput label="创建人" />
      </FilterBar>

      <SectionCard bodyClassName="p-0">
        <DataTableToolbar count={total} density={density} onDensity={setDensity} />
        <DataTable columns={columns} rows={rows} density={density} onRowClick={setActive} maxHeight="38rem" />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
      </SectionCard>

      <Sheet open={Boolean(active)} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
          {active ? (
            <>
              <SheetHeader className="border-b border-border p-5">
                <ToneBadge tone={versionStatusTone[active.status]} dot>{active.status}</ToneBadge>
                <SheetTitle className="text-base text-primary">{active.code}</SheetTitle>
                <SheetDescription>{active.task} · {active.cycle}</SheetDescription>
              </SheetHeader>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['SKU 数量', active.skuCount.toLocaleString()],
                    ['补货总量', active.replenishTotal.toLocaleString()],
                    ['缺货 SKU', active.shortageSku],
                    ['高库存 SKU', active.overstockSku],
                    ['调整次数', active.adjustCount],
                    ['参数版本', active.paramVersion],
                  ].map(([label, val]) => (
                    <div key={label as string} className="rounded-md border border-border bg-secondary/50 p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{val}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 divide-y divide-border">
                  <Row label="数据快照" value={active.dataSnapshot} />
                  <Row label="创建人" value={active.createdBy} />
                  <Row label="创建时间" value={active.createdAt} />
                  <Row label="确认人" value={active.confirmedBy} />
                  <Row label="确认时间" value={active.confirmedAt} />
                </div>
                <div className="mt-5 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5"><GitCompare className="size-4" />对比</Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5"><Download className="size-4" />导出</Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
