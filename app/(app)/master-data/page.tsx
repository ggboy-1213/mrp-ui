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
  SKU_MASTER,
  WAREHOUSE_MASTER,
  MAPPING_ROWS,
  SKU_STATUS_TONE,
  MAPPING_STATUS_TONE,
  type SkuMaster,
  type WarehouseMaster,
  type MappingRow,
} from '@/lib/master-data'
import { RefreshCw, Download, Plus, Boxes, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

const masterStats: StatTile[] = [
  { key: 'sku', label: 'SKU 主数据', value: '1,284', tone: 'primary', icon: Boxes, hint: '全部产品' },
  { key: 'active', label: '启用 SKU', value: '1,198', tone: 'success', icon: CheckCircle2, hint: '占比 93.3%' },
  { key: 'pending', label: '待审核', value: 42, tone: 'warning', icon: Clock, hint: '需主数据 Owner 确认' },
  { key: 'conflict', label: '映射冲突', value: 6, tone: 'danger', icon: AlertTriangle, hint: '影响计算口径' },
]

const skuColumns: Column<SkuMaster>[] = [
  { key: 'sku', header: 'SKU', sticky: 'left', width: '130px', render: (r) => <span className="font-medium">{r.sku}</span> },
  { key: 'spu', header: 'SPU', render: (r) => <span className="text-muted-foreground">{r.spu}</span> },
  { key: 'name', header: '品名', render: (r) => r.name },
  { key: 'category', header: '品类', render: (r) => <ToneBadge tone="neutral">{r.category}</ToneBadge> },
  { key: 'productLine', header: '产品线', render: (r) => r.productLine },
  { key: 'brand', header: '品牌', render: (r) => r.brand },
  { key: 'unit', header: '单位', align: 'center', render: (r) => r.unit },
  { key: 'status', header: '状态', render: (r) => <ToneBadge tone={SKU_STATUS_TONE[r.status]}>{r.status}</ToneBadge> },
  { key: 'updatedAt', header: '更新时间', render: (r) => <span className="text-xs text-muted-foreground">{r.updatedAt}</span> },
]

const warehouseColumns: Column<WarehouseMaster>[] = [
  { key: 'code', header: '仓库编码', sticky: 'left', width: '130px', render: (r) => <span className="font-medium text-primary">{r.code}</span> },
  { key: 'name', header: '仓库名称', render: (r) => r.name },
  { key: 'country', header: '国家', render: (r) => r.country },
  { key: 'region', header: '区域', render: (r) => <span className="text-muted-foreground">{r.region}</span> },
  { key: 'type', header: '类型', render: (r) => <ToneBadge tone="info">{r.type}</ToneBadge> },
  { key: 'capacity', header: '容量', align: 'right', sortable: true, sortValue: (r) => r.capacity, render: (r) => r.capacity.toLocaleString() },
  {
    key: 'usage',
    header: '使用率',
    align: 'right',
    sortable: true,
    sortValue: (r) => r.usage,
    render: (r) => (
      <div className="flex items-center justify-end gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
          <div
            className={r.usage >= 90 ? 'h-full bg-destructive' : r.usage >= 75 ? 'h-full bg-warning' : 'h-full bg-primary'}
            style={{ width: `${r.usage}%` }}
          />
        </div>
        <span className="tabular-nums">{r.usage}%</span>
      </div>
    ),
  },
  { key: 'status', header: '状态', render: (r) => <ToneBadge tone={r.status === '启用' ? 'success' : 'neutral'}>{r.status}</ToneBadge> },
]

const mappingColumns: Column<MappingRow>[] = [
  { key: 'channelSku', header: '渠道 SKU', sticky: 'left', width: '150px', render: (r) => <span className="font-medium">{r.channelSku}</span> },
  { key: 'internalSku', header: '内部 SKU', render: (r) => <span className="text-primary">{r.internalSku}</span> },
  { key: 'platform', header: '平台', render: (r) => r.platform },
  { key: 'country', header: '国家', render: (r) => r.country },
  { key: 'matchType', header: '匹配方式', render: (r) => <ToneBadge tone={r.matchType === '手工' ? 'warning' : 'neutral'}>{r.matchType}</ToneBadge> },
  { key: 'status', header: '状态', render: (r) => <ToneBadge tone={MAPPING_STATUS_TONE[r.status]}>{r.status}</ToneBadge> },
  { key: 'updatedAt', header: '更新时间', render: (r) => <span className="text-xs text-muted-foreground">{r.updatedAt}</span> },
]

export default function MasterDataPage() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  return (
    <div className="space-y-4">
      <PageHeader
        title="主数据"
        subtitle="维护产品、仓库、区域与平台映射等基础主数据，保障 MRP 计算口径一致，并支持变更审计。"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="size-4" />同步 ERP</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" />导出</Button>
            <Button size="sm" className="gap-1.5"><Plus className="size-4" />新增主数据</Button>
          </>
        }
      />

      <StatTiles items={masterStats} columns={4} />

      <FilterBar>
        <FilterField label="品类">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部品类' : v)}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="all">全部品类</SelectItem>{['音频', '外设', '配件', '穿戴', '智能家居'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterField label="状态">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部状态' : v)}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="all">全部状态</SelectItem>{['启用', '停用', '待审核'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterInput label="SKU" />
        <FilterInput label="SPU" />
        <FilterInput label="产品线" />
        <FilterInput label="品牌" />
      </FilterBar>

      <Tabs defaultValue="sku">
        <TabsList>
          <TabsTrigger value="sku">SKU 主数据</TabsTrigger>
          <TabsTrigger value="warehouse">仓库主数据</TabsTrigger>
          <TabsTrigger value="mapping">映射关系</TabsTrigger>
        </TabsList>

        <TabsContent value="sku" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={SKU_MASTER.length} density={density} onDensity={setDensity} />
            <DataTable columns={skuColumns} rows={SKU_MASTER} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="warehouse" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={WAREHOUSE_MASTER.length} density={density} onDensity={setDensity} />
            <DataTable columns={warehouseColumns} rows={WAREHOUSE_MASTER} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="mapping" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={MAPPING_ROWS.length} density={density} onDensity={setDensity} />
            <DataTable columns={mappingColumns} rows={MAPPING_ROWS} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
