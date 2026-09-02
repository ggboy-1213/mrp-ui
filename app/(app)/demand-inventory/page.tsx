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
  forecastRows,
  beginInventoryRows,
  platformInventoryRows,
  orderOccupyRows,
  returnRows,
  type ForecastRow,
  type InventoryRow,
  type OrderOccupyRow,
  type ReturnRow,
} from '@/lib/demand-inventory-data'
import { RefreshCw, Download } from 'lucide-react'

const forecastColumns: Column<ForecastRow>[] = [
  { key: 'sku', header: 'SKU', sticky: 'left', width: '120px', render: (r) => <span className="font-medium">{r.sku}</span> },
  { key: 'spu', header: 'SPU', render: (r) => <span className="text-muted-foreground">{r.spu}</span> },
  { key: 'country', header: '国家', render: (r) => r.country },
  { key: 'platform', header: '平台', render: (r) => r.platform },
  { key: 'planWeek', header: '计划周', render: (r) => r.planWeek },
  { key: 'forecastQty', header: '预测数量', align: 'right', sortable: true, sortValue: (r) => r.forecastQty, render: (r) => r.forecastQty.toLocaleString() },
  { key: 'forecastVersion', header: '预测版本', render: (r) => r.forecastVersion },
  { key: 'source', header: '数据来源', render: (r) => <ToneBadge tone="info">{r.source}</ToneBadge> },
  { key: 'updatedAt', header: '更新时间', render: (r) => <span className="text-xs text-muted-foreground">{r.updatedAt}</span> },
]

function inventoryColumns(): Column<InventoryRow>[] {
  return [
    { key: 'sku', header: 'SKU', sticky: 'left', width: '120px', render: (r) => <span className="font-medium">{r.sku}</span> },
    { key: 'spu', header: 'SPU', render: (r) => <span className="text-muted-foreground">{r.spu}</span> },
    { key: 'country', header: '国家', render: (r) => r.country },
    { key: 'platform', header: '平台', render: (r) => r.platform },
    { key: 'warehouse', header: '仓库', render: (r) => r.warehouse },
    { key: 'inventory', header: '库存数量', align: 'right', sortable: true, sortValue: (r) => r.inventory, render: (r) => r.inventory.toLocaleString() },
    { key: 'occupied', header: '占用数量', align: 'right', render: (r) => r.occupied.toLocaleString() },
    { key: 'available', header: '可用数量', align: 'right', render: (r) => <span className="font-medium text-primary">{r.available.toLocaleString()}</span> },
    { key: 'snapshotAt', header: '快照时间', render: (r) => <span className="text-xs text-muted-foreground">{r.snapshotAt}</span> },
    { key: 'dataVersion', header: '数据版本', render: (r) => r.dataVersion },
  ]
}

const orderColumns: Column<OrderOccupyRow>[] = [
  { key: 'orderNo', header: '订单编号', sticky: 'left', width: '140px', render: (r) => <span className="font-medium text-primary">{r.orderNo}</span> },
  { key: 'sku', header: 'SKU', render: (r) => r.sku },
  { key: 'country', header: '国家', render: (r) => r.country },
  { key: 'platform', header: '平台', render: (r) => r.platform },
  { key: 'occupyQty', header: '占用数量', align: 'right', sortable: true, sortValue: (r) => r.occupyQty, render: (r) => r.occupyQty },
  { key: 'orderTime', header: '下单时间', render: (r) => <span className="text-xs text-muted-foreground">{r.orderTime}</span> },
  { key: 'status', header: '状态', render: (r) => <ToneBadge tone="primary">{r.status}</ToneBadge> },
]

const returnColumns: Column<ReturnRow>[] = [
  { key: 'sku', header: 'SKU', sticky: 'left', width: '120px', render: (r) => <span className="font-medium">{r.sku}</span> },
  { key: 'country', header: '国家', render: (r) => r.country },
  { key: 'platform', header: '平台', render: (r) => r.platform },
  { key: 'warehouse', header: '仓库', render: (r) => r.warehouse },
  { key: 'returnQty', header: '退货数量', align: 'right', sortable: true, sortValue: (r) => r.returnQty, render: (r) => r.returnQty },
  { key: 'usableQty', header: '可用数量', align: 'right', render: (r) => <span className="font-medium text-success">{r.usableQty}</span> },
  { key: 'expectAt', header: '预计可用日期', render: (r) => r.expectAt },
]

export default function DemandInventoryPage({ embedded = false }: { embedded?: boolean }) {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  return (
    <div className="space-y-4">
      {!embedded && (
        <PageHeader
          title="需求与库存"
          subtitle="统一查看需求预测与库存输入数据，包含期初库存、平台库存、订单占用与可用退货，作为 MRP 计算的核心输入。"
          actions={
            <>
              <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="size-4" />同步数据</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" />导出</Button>
            </>
          }
        />
      )}

      <FilterBar>
        <FilterField label="数据版本">
          <Select defaultValue="v3">
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{['v3', 'v2', 'v1'].map((c) => <SelectItem key={c} value={c}>2026W24-{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterField label="国家">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部国家' : v)}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="all">全部国家</SelectItem>{['美国', '德国', '英国', '日本'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterField label="平台">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部平台' : v)}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="all">全部平台</SelectItem>{['Amazon', 'Temu', 'TikTok', 'eBay'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterInput label="仓库" />
        <FilterInput label="SPU" />
        <FilterInput label="SKU" />
        <FilterInput label="产品线" />
        <FilterInput label="数据日期" placeholder="如 2026-06-20" />
      </FilterBar>

      <Tabs defaultValue="forecast">
        <TabsList>
          <TabsTrigger value="forecast">需求预测</TabsTrigger>
          <TabsTrigger value="begin">期初库存</TabsTrigger>
          <TabsTrigger value="platform">平台库存</TabsTrigger>
          <TabsTrigger value="order">订单占用</TabsTrigger>
          <TabsTrigger value="return">可用退货</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={forecastRows.length} density={density} onDensity={setDensity} />
            <DataTable columns={forecastColumns} rows={forecastRows} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="begin" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={beginInventoryRows.length} density={density} onDensity={setDensity} />
            <DataTable columns={inventoryColumns()} rows={beginInventoryRows} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="platform" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={platformInventoryRows.length} density={density} onDensity={setDensity} />
            <DataTable columns={inventoryColumns()} rows={platformInventoryRows} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="order" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={orderOccupyRows.length} density={density} onDensity={setDensity} />
            <DataTable columns={orderColumns} rows={orderOccupyRows} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="return" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={returnRows.length} density={density} onDensity={setDensity} />
            <DataTable columns={returnColumns} rows={returnRows} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
