'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { SuggestionDetail } from '@/components/suggestions/suggestion-detail'
import {
  suggestions,
  suggestionTypeTone,
  alertTone,
  adjustTone,
  type Suggestion,
} from '@/lib/suggestions-data'
import { RefreshCw, SlidersHorizontal, Download, CheckCircle2, GitCompare } from 'lucide-react'

const PAGE_SIZE = 10

export default function SuggestionsPage({ embedded = false }: { embedded?: boolean }) {
  const [page, setPage] = useState(1)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [active, setActive] = useState<Suggestion | null>(null)

  const total = suggestions.length
  const rows = suggestions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<Suggestion>[] = [
    { key: 'sku', header: 'SKU / 商品', width: '180px', sticky: 'left', render: (r) => (
      <div className="min-w-0">
        <p className="font-medium text-foreground">{r.sku}</p>
        <p className="truncate text-xs text-muted-foreground">{r.productName}</p>
      </div>
    ) },
    { key: 'spu', header: 'SPU', render: (r) => <span className="text-muted-foreground">{r.spu}</span> },
    { key: 'country', header: '国家 / 平台', render: (r) => `${r.country} / ${r.platform}` },
    { key: 'targetWarehouse', header: '目标仓', render: (r) => r.targetWarehouse },
    { key: 'planWeek', header: '计划周', sortable: true, sortValue: (r) => r.planWeek, render: (r) => r.planWeek },
    { key: 'beginInventory', header: '期初库存', align: 'right', sortable: true, sortValue: (r) => r.beginInventory, render: (r) => r.beginInventory },
    { key: 'weekForecast', header: '当周预测', align: 'right', render: (r) => r.weekForecast },
    { key: 'weekArrival', header: '当周到货', align: 'right', render: (r) => r.weekArrival },
    { key: 'endInventory', header: '预计期末', align: 'right', sortable: true, sortValue: (r) => r.endInventory, render: (r) => (
      <span className={r.endInventory < r.targetInventory * 0.3 ? 'font-medium text-destructive' : 'text-foreground'}>{r.endInventory}</span>
    ) },
    { key: 'targetInventory', header: '目标库存', align: 'right', render: (r) => r.targetInventory },
    { key: 'rawDemand', header: '原始需求', align: 'right', render: (r) => r.rawDemand },
    { key: 'moq', header: 'MOQ', align: 'right', render: (r) => r.moq },
    { key: 'caseSize', header: '箱规', align: 'right', render: (r) => r.caseSize },
    { key: 'suggestQty', header: '建议数量', align: 'right', sortable: true, sortValue: (r) => r.suggestQty, render: (r) => (
      <span className="font-semibold text-primary tabular-nums">{r.suggestQty}</span>
    ) },
    { key: 'orderWeek', header: '建议下单周', render: (r) => r.orderWeek },
    { key: 'shipWeek', header: '建议发运周', render: (r) => r.shipWeek },
    { key: 'onShelfWeek', header: '预计上架周', render: (r) => r.onShelfWeek },
    { key: 'type', header: '建议类型', render: (r) => <ToneBadge tone={suggestionTypeTone[r.type]}>{r.type}</ToneBadge> },
    { key: 'alert', header: '预警状态', render: (r) => <ToneBadge tone={alertTone[r.alert]} dot>{r.alert}</ToneBadge> },
    { key: 'adjustStatus', header: '调整状态', render: (r) => <ToneBadge tone={adjustTone[r.adjustStatus]}>{r.adjustStatus}</ToneBadge> },
    { key: 'ops', header: '操作', sticky: 'right', width: '90px', render: (r) => (
      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); setActive(r) }}>
        查看详情
      </Button>
    ) },
  ]

  return (
    <div className="space-y-4">
      {!embedded && (
        <PageHeader
          title="计划建议"
          subtitle="展示 MRP 计算后生成的采购、补货、发运与调拨建议，支持批量调整、版本对比与提交确认。"
          actions={
            <>
              <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="size-4" />重新计算</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><SlidersHorizontal className="size-4" />批量调整</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><GitCompare className="size-4" />版本对比</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" />导出计划</Button>
              <Button size="sm" className="gap-1.5"><CheckCircle2 className="size-4" />提交确认</Button>
            </>
          }
        />
      )}

      <FilterBar>
        <FilterInput label="SPU" />
        <FilterInput label="SKU" />
        <FilterInput label="商品名称" />
        <FilterField label="国家">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部国家' : v)}</SelectValue></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部国家</SelectItem>
              {['美国', '德国', '英国', '日本', '法国'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="平台">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部平台' : v)}</SelectValue></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部平台</SelectItem>
              {['Amazon', 'Temu', 'TikTok', 'eBay', '独立站'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterInput label="目标仓" />
        <FilterInput label="供应商" />
        <FilterInput label="产品线" />
        <FilterInput label="采购归属" />
        <FilterInput label="计划周" placeholder="如 2026-W26" />
        <FilterField label="建议类型">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部类型' : v)}</SelectValue></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              {['采购', '集货', '发运', '到货', '调拨'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="预警状态">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部状态' : v)}</SelectValue></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {['正常', '缺货', '高库存', '延迟'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
      </FilterBar>

      <SectionCard bodyClassName="p-0">
        <DataTableToolbar count={total} density={density} onDensity={setDensity} />
        <DataTable columns={columns} rows={rows} density={density} onRowClick={setActive} maxHeight="40rem" />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
      </SectionCard>

      <SuggestionDetail suggestion={active} onClose={() => setActive(null)} />
    </div>
  )
}
