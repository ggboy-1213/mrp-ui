'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader, SectionCard, ToneBadge, StatTiles, type StatTile } from '@/components/shared/page-kit'
import { DataTable, type Column } from '@/components/shared/data-table'
import { cn } from '@/lib/utils'
import { SUPPLIER_PARAMS, RATING_TONE, type SupplierParam } from '@/lib/supplier-params-data'
import { Plus, Save, Factory, Timer, PackageCheck, ShieldAlert } from 'lucide-react'

const columns: Column<SupplierParam>[] = [
  { key: 'supplier', header: '供应商', sticky: 'left', width: '150px', render: (r) => (
    <div className="flex flex-col">
      <span className="font-medium text-foreground">{r.supplier}</span>
      <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
    </div>
  ) },
  { key: 'category', header: '品类', render: (r) => <ToneBadge tone="neutral">{r.category}</ToneBadge> },
  { key: 'rating', header: '评级', render: (r) => <ToneBadge tone={RATING_TONE[r.rating]} dot>{r.rating} 级</ToneBadge> },
  { key: 'moq', header: 'MOQ', align: 'right', sortable: true, sortValue: (r) => r.moq, render: (r) => r.moq.toLocaleString() },
  { key: 'cartonMultiple', header: '箱规', align: 'right', render: (r) => <span>{r.cartonMultiple}<span className="ml-0.5 text-xs text-muted-foreground">件</span></span> },
  { key: 'prodLeadTime', header: '生产 (天)', align: 'right', sortable: true, sortValue: (r) => r.prodLeadTime, render: (r) => r.prodLeadTime },
  { key: 'qcDays', header: 'QC (天)', align: 'right', render: (r) => r.qcDays },
  { key: 'intlLeadTime', header: '物流 (天)', align: 'right', render: (r) => r.intlLeadTime },
  { key: 'onTimeRate', header: '准时率', align: 'right', sortable: true, sortValue: (r) => r.onTimeRate, render: (r) => (
    <span className={cn('font-medium tabular-nums', r.onTimeRate >= 90 ? 'text-success' : r.onTimeRate >= 85 ? 'text-warning' : 'text-destructive')}>
      {r.onTimeRate}%
    </span>
  ) },
  { key: 'source', header: '参数来源', render: (r) => <ToneBadge tone={r.source === 'SCM' ? 'success' : 'warning'}>{r.source}</ToneBadge> },
  { key: 'updatedAt', header: '更新时间', sticky: 'right', width: '150px', render: (r) => <span className="text-xs text-muted-foreground">{r.updatedAt}</span> },
]

const CATEGORIES = ['全部', ...Array.from(new Set(SUPPLIER_PARAMS.map((s) => s.category)))]

export default function SupplierParamsPage() {
  const [category, setCategory] = useState('全部')
  const filtered = category === '全部' ? SUPPLIER_PARAMS : SUPPLIER_PARAMS.filter((s) => s.category === category)

  const stats: StatTile[] = useMemo(() => {
    const total = SUPPLIER_PARAMS.length
    const fromScm = SUPPLIER_PARAMS.filter((s) => s.source === 'SCM').length
    const avgLead = Math.round(
      SUPPLIER_PARAMS.reduce((sum, s) => sum + s.prodLeadTime + s.qcDays + s.intlLeadTime, 0) / total,
    )
    const lowOnTime = SUPPLIER_PARAMS.filter((s) => s.onTimeRate < 85).length
    return [
      { key: 'total', label: '供应商总数', value: total, unit: '家', tone: 'mrp', icon: Factory },
      { key: 'scm', label: 'SCM 同步', value: fromScm, unit: '家', tone: 'success', icon: PackageCheck },
      { key: 'lead', label: '平均综合提前期', value: avgLead, unit: '天', tone: 'primary', icon: Timer },
      { key: 'risk', label: '准时率预警', value: lowOnTime, unit: '家', tone: lowOnTime > 0 ? 'danger' : 'success', icon: ShieldAlert },
    ]
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        title="供应商参数"
        subtitle="维护供应商级 MOQ、箱规与生产 / QC / 物流提前期，作为 MRP 计算的外部参数回退来源（SCM 优先）。"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Save className="size-4" />保存草稿</Button>
            <Button size="sm" className="gap-1.5"><Plus className="size-4" />新增供应商</Button>
          </>
        }
      />

      <StatTiles items={stats} columns={4} />

      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              category === c
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <SectionCard
        title="供应商 MRP 参数"
        description="计算时优先使用 SCM 实时参数，标记为「MRP 配置」的行表示 SCM 缺失、回退到本页维护值。"
        bodyClassName="p-0"
      >
        <DataTable columns={columns} rows={filtered} maxHeight="34rem" />
      </SectionCard>
    </div>
  )
}
