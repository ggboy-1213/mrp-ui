'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  PURCHASE_ORDERS,
  SHIPMENTS,
  SUPPLIER_PERF,
  PO_STATUS_TONE,
  SHIP_STATUS_TONE,
  type PurchaseOrder,
  type Shipment,
  type SupplierPerf,
} from '@/lib/supply-logistics-data'
import { RefreshCw, Download, Plus, Ship, ClipboardCheck, AlertTriangle, Timer } from 'lucide-react'

const supplyStats: StatTile[] = [
  { key: 'transit', label: '在途采购单', value: 38, tone: 'info', icon: Ship, hint: '较上周 +5' },
  { key: 'pending', label: '待审核 PO', value: 6, tone: 'warning', icon: ClipboardCheck, hint: '需及时处理' },
  { key: 'abnormal', label: '异常运单', value: 3, tone: 'danger', icon: AlertTriangle, hint: '延误 ≥ 3 天' },
  { key: 'ontime', label: '平均到货准时率', value: '87.6%', tone: 'primary', icon: Timer, hint: '目标 ≥ 90%' },
]

const poColumns: Column<PurchaseOrder>[] = [
  { key: 'id', header: '采购单号', sticky: 'left', width: '150px', render: (r) => <span className="font-medium text-primary">{r.id}</span> },
  { key: 'sku', header: 'SKU', render: (r) => r.sku },
  { key: 'name', header: '品名', render: (r) => <span className="text-muted-foreground">{r.name}</span> },
  { key: 'supplier', header: '供应商', render: (r) => r.supplier },
  { key: 'qty', header: '数量', align: 'right', sortable: true, sortValue: (r) => r.qty, render: (r) => r.qty.toLocaleString() },
  { key: 'unitCost', header: '单价', align: 'right', render: (r) => `¥${r.unitCost}` },
  { key: 'warehouse', header: '目标仓', render: (r) => r.warehouse },
  { key: 'status', header: '状态', render: (r) => <ToneBadge tone={PO_STATUS_TONE[r.status]}>{r.status}</ToneBadge> },
  { key: 'expectedArrival', header: '预计到货', render: (r) => r.expectedArrival },
  { key: 'leadTimeDays', header: '交期(天)', align: 'right', sortable: true, sortValue: (r) => r.leadTimeDays, render: (r) => r.leadTimeDays },
  { key: 'onTimeRate', header: '准时率', align: 'right', render: (r) => <span className={r.onTimeRate < 85 ? 'text-destructive' : 'text-foreground'}>{r.onTimeRate}%</span> },
  { key: 'owner', header: '负责人', render: (r) => r.owner },
]

const shipColumns: Column<Shipment>[] = [
  { key: 'id', header: '运单号', sticky: 'left', width: '130px', render: (r) => <span className="font-medium text-primary">{r.id}</span> },
  { key: 'poId', header: '关联 PO', render: (r) => <span className="text-muted-foreground">{r.poId}</span> },
  { key: 'sku', header: 'SKU', render: (r) => r.sku },
  { key: 'carrier', header: '承运商', render: (r) => r.carrier },
  { key: 'mode', header: '运输方式', render: (r) => <ToneBadge tone="neutral">{r.mode}</ToneBadge> },
  { key: 'qty', header: '数量', align: 'right', sortable: true, sortValue: (r) => r.qty, render: (r) => r.qty.toLocaleString() },
  { key: 'origin', header: '起运地', render: (r) => r.origin },
  { key: 'destination', header: '目的地', render: (r) => r.destination },
  { key: 'status', header: '状态', render: (r) => <ToneBadge tone={SHIP_STATUS_TONE[r.status]}>{r.status}</ToneBadge> },
  { key: 'eta', header: '预计到达', render: (r) => r.eta },
  {
    key: 'delayDays',
    header: '延误(天)',
    align: 'right',
    sortable: true,
    sortValue: (r) => r.delayDays,
    render: (r) =>
      r.delayDays > 0 ? (
        <span className="font-medium text-destructive">+{r.delayDays}</span>
      ) : r.delayDays < 0 ? (
        <span className="text-success">{r.delayDays}</span>
      ) : (
        <span className="text-muted-foreground">0</span>
      ),
  },
]

const supplierColumns: Column<SupplierPerf>[] = [
  { key: 'supplier', header: '供应商', sticky: 'left', width: '150px', render: (r) => <span className="font-medium">{r.supplier}</span> },
  { key: 'category', header: '品类', render: (r) => <ToneBadge tone="neutral">{r.category}</ToneBadge> },
  { key: 'activePo', header: '在途 PO', align: 'right', sortable: true, sortValue: (r) => r.activePo, render: (r) => r.activePo },
  { key: 'onTimeRate', header: '准时率', align: 'right', sortable: true, sortValue: (r) => r.onTimeRate, render: (r) => <span className={r.onTimeRate < 85 ? 'text-destructive' : 'text-foreground'}>{r.onTimeRate}%</span> },
  { key: 'qualityRate', header: '良品率', align: 'right', render: (r) => `${r.qualityRate}%` },
  { key: 'avgLeadTime', header: '平均交期', align: 'right', render: (r) => `${r.avgLeadTime} 天` },
  {
    key: 'rating',
    header: '评级',
    render: (r) => <ToneBadge tone={r.rating === 'A' ? 'success' : r.rating === 'B' ? 'warning' : 'danger'}>{r.rating} 级</ToneBadge>,
  },
]

export default function SupplyLogisticsPage({ embedded = false }: { embedded?: boolean }) {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  return (
    <div className="space-y-4">
      {!embedded && (
        <PageHeader
          title="供应与物流"
          subtitle="维护供应商、采购在途及各段物流时效，用于补货时间反推计算，并联动到货延迟预警。"
          actions={
            <>
              <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="size-4" />同步 SCM</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" />导出</Button>
              <Button size="sm" className="gap-1.5"><Plus className="size-4" />新建采购单</Button>
            </>
          }
        />
      )}

      <StatTiles items={supplyStats} columns={4} />

      <FilterBar>
        <FilterField label="状态">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部状态' : v)}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="all">全部状态</SelectItem>{['待审核', '已下单', '生产中', '已发货', '已入库'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterInput label="供应商" />
        <FilterInput label="SKU" />
        <FilterInput label="目标仓" />
        <FilterInput label="采购单号" />
        <FilterInput label="预计到货" placeholder="如 2026-08-30" />
      </FilterBar>

      <Tabs defaultValue="po">
        <TabsList>
          <TabsTrigger value="po">采购单</TabsTrigger>
          <TabsTrigger value="ship">物流运单</TabsTrigger>
          <TabsTrigger value="supplier">供应商绩效</TabsTrigger>
        </TabsList>

        <TabsContent value="po" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={PURCHASE_ORDERS.length} density={density} onDensity={setDensity} />
            <DataTable columns={poColumns} rows={PURCHASE_ORDERS} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="ship" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={SHIPMENTS.length} density={density} onDensity={setDensity} />
            <DataTable columns={shipColumns} rows={SHIPMENTS} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="supplier" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={SUPPLIER_PERF.length} density={density} onDensity={setDensity} />
            <DataTable columns={supplierColumns} rows={SUPPLIER_PERF} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
