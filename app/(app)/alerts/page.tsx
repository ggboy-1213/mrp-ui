'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  PageHeader,
  FilterBar,
  FilterField,
  FilterInput,
  SectionCard,
  ToneBadge,
  StatTiles,
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
  ALERT_ROWS,
  ALERT_LEVEL_TONE,
  ALERT_STATUS_TONE,
  type AlertRow,
} from '@/lib/data-ops-data'
import { PackageX, Boxes, TruckIcon, ListChecks, BellRing, Check } from 'lucide-react'

const alertStats: StatTile[] = [
  { key: 'shortage', label: '缺货风险', value: 8, tone: 'danger', icon: PackageX, hint: '高级 3 项' },
  { key: 'overstock', label: '高库存', value: 5, tone: 'warning', icon: Boxes, hint: 'DOS ≥ 90 天' },
  { key: 'delay', label: '到货延迟', value: 3, tone: 'warning', icon: TruckIcon, hint: '延误 ≥ 3 天' },
  { key: 'pending', label: '待处理', value: 11, tone: 'primary', icon: ListChecks, hint: '需分派 Owner' },
]

const typeTone: Record<AlertRow['type'], Parameters<typeof ToneBadge>[0]['tone']> = {
  缺货风险: 'danger',
  高库存: 'warning',
  到货延迟: 'warning',
  数据异常: 'info',
  参数缺失: 'neutral',
}

export default function AlertsPage() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  const columns: Column<AlertRow>[] = [
    { key: 'id', header: '预警编号', sticky: 'left', width: '110px', render: (r) => <span className="font-mono text-xs font-medium text-primary">{r.id}</span> },
    { key: 'type', header: '类型', render: (r) => <ToneBadge tone={typeTone[r.type]}>{r.type}</ToneBadge> },
    { key: 'level', header: '级别', render: (r) => <ToneBadge tone={ALERT_LEVEL_TONE[r.level]}>{r.level}</ToneBadge> },
    { key: 'sku', header: 'SKU', render: (r) => r.sku },
    { key: 'scope', header: '范围', render: (r) => r.scope },
    { key: 'metric', header: '关键指标', render: (r) => <span className="text-muted-foreground">{r.metric}</span> },
    { key: 'owner', header: '责任人', render: (r) => r.owner },
    { key: 'status', header: '状态', render: (r) => <ToneBadge tone={ALERT_STATUS_TONE[r.status]}>{r.status}</ToneBadge> },
    { key: 'createdAt', header: '触发时间', render: (r) => <span className="text-xs text-muted-foreground">{r.createdAt}</span> },
    {
      key: 'ops',
      header: '操作',
      align: 'right',
      render: (r) =>
        r.status === '待处理' || r.status === '处理中' ? (
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs"><Check className="size-3.5" />处理</Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="预警中心"
        subtitle="集中管理缺货、高库存、到货延迟、LT 异常及数据类预警，按级别分类并定位数据 Owner 闭环处理。"
        actions={
          <Button variant="outline" size="sm" className="gap-1.5"><BellRing className="size-4" />预警订阅</Button>
        }
      />

      <StatTiles items={alertStats} columns={4} />

      <FilterBar>
        <FilterField label="类型">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部类型' : v)}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="all">全部类型</SelectItem>{['缺货风险', '高库存', '到货延迟', '数据异常', '参数缺失'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterField label="级别">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部级别' : v)}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="all">全部级别</SelectItem>{['高', '中', '低'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterField label="状态">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部状态' : v)}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="all">全部状态</SelectItem>{['待处理', '处理中', '已忽略', '已解决'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterInput label="SKU" />
      </FilterBar>

      <SectionCard bodyClassName="p-0">
        <DataTableToolbar count={ALERT_ROWS.length} density={density} onDensity={setDensity} />
        <DataTable columns={columns} rows={ALERT_ROWS} density={density} maxHeight="34rem" />
      </SectionCard>
    </div>
  )
}
