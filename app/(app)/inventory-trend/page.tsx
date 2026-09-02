'use client'

import { useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  PageHeader,
  FilterBar,
  FilterField,
  FilterInput,
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
import { Button } from '@/components/ui/button'
import { trendPoints, trendSummary, trendAlertTone, type WeeklyTrendPoint } from '@/lib/inventory-trend-data'
import { RefreshCw, Download, TrendingDown, PackageX, PackagePlus, ShoppingCart } from 'lucide-react'

const chartConfig = {
  forecast: { label: '预测需求', color: 'var(--chart-1)' },
  arrival: { label: '预计到货', color: 'var(--chart-2)' },
  endInventory: { label: '预计期末库存', color: 'var(--chart-4)' },
} satisfies ChartConfig

export default function InventoryTrendPage({ embedded = false }: { embedded?: boolean }) {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  const stats: StatTile[] = [
    { key: 'min', label: '最低库存周', value: trendSummary.minWeek.week, tone: 'mrp', icon: TrendingDown, hint: `期末 ${trendSummary.minWeek.endInventory}` },
    { key: 'shortage', label: '缺货周数', value: trendSummary.shortageWeeks, unit: '周', tone: 'danger', icon: PackageX },
    { key: 'over', label: '高库存周数', value: trendSummary.overstockWeeks, unit: '周', tone: 'warning', icon: PackagePlus },
    { key: 'suggest', label: '建议补货总量', value: trendSummary.totalSuggest.toLocaleString(), tone: 'primary', icon: ShoppingCart },
  ]

  const columns: Column<WeeklyTrendPoint & { id: string }>[] = [
    { key: 'week', header: '周次', sticky: 'left', width: '80px', render: (r) => <span className="font-medium">{r.week}</span> },
    { key: 'startDate', header: '周开始日期', render: (r) => r.startDate },
    { key: 'beginInventory', header: '期初库存', align: 'right', sortable: true, sortValue: (r) => r.beginInventory, render: (r) => r.beginInventory.toLocaleString() },
    { key: 'forecast', header: '预测需求', align: 'right', render: (r) => r.forecast.toLocaleString() },
    { key: 'arrival', header: '预计到货', align: 'right', render: (r) => r.arrival.toLocaleString() },
    { key: 'endInventory', header: '预计期末库存', align: 'right', sortable: true, sortValue: (r) => r.endInventory, render: (r) => (
      <span className={r.alert === '缺货' ? 'font-medium text-destructive' : 'text-foreground'}>{r.endInventory.toLocaleString()}</span>
    ) },
    { key: 'targetInventory', header: '目标库存', align: 'right', render: (r) => r.targetInventory.toLocaleString() },
    { key: 'gap', header: '库存缺口', align: 'right', render: (r) => (
      <span className={r.gap > 0 ? 'font-medium text-destructive' : 'text-muted-foreground'}>{r.gap > 0 ? r.gap.toLocaleString() : '-'}</span>
    ) },
    { key: 'suggestQty', header: '补货建议', align: 'right', render: (r) => (
      <span className={r.suggestQty > 0 ? 'font-semibold text-primary' : 'text-muted-foreground'}>{r.suggestQty > 0 ? r.suggestQty.toLocaleString() : '-'}</span>
    ) },
    { key: 'alert', header: '预警状态', render: (r) => <ToneBadge tone={trendAlertTone[r.alert]} dot>{r.alert}</ToneBadge> },
  ]

  const rows = trendPoints.map((p) => ({ ...p, id: p.week }))

  return (
    <div className="space-y-4">
      {!embedded && (
        <PageHeader
          title="库存趋势"
          subtitle="查看未来 21 周的需求、到货、期末库存与缺口变化，识别缺货区间与高库存区间。"
          actions={
            <>
              <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="size-4" />刷新数据</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" />导出</Button>
            </>
          }
        />
      )}

      <FilterBar>
        <FilterInput label="SPU" />
        <FilterInput label="SKU" />
        <FilterField label="国家">
          <Select defaultValue="美国">
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['美国', '德国', '英国', '日本', '法国'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="平台">
          <Select defaultValue="Amazon">
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Amazon', 'Temu', 'TikTok', 'eBay', '独立站'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterInput label="仓库" placeholder="如 US-East-01" />
        <FilterInput label="产品线" />
        <FilterField label="计划版本">
          <Select defaultValue="v3">
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['v3', 'v2', 'v1'].map((c) => <SelectItem key={c} value={c}>MRP-2026W24-{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
      </FilterBar>

      <StatTiles items={stats} columns={4} />

      <SectionCard title="未来 21 周库存趋势" description="柱状为预测需求 / 预计到货，折线为预计期末库存；虚线为目标与安全库存" bodyClassName="p-4">
        <ChartContainer config={chartConfig} className="h-[340px] w-full">
          <ComposedChart data={trendPoints} margin={{ left: 4, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} width={44} tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="forecast" fill="var(--color-forecast)" radius={[3, 3, 0, 0]} barSize={11} />
            <Bar dataKey="arrival" fill="var(--color-arrival)" radius={[3, 3, 0, 0]} barSize={11} />
            <Line dataKey="endInventory" type="monotone" stroke="var(--color-endInventory)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            <ReferenceLine y={6000} stroke="var(--chart-3)" strokeDasharray="6 4" label={{ value: '目标库存', position: 'insideTopRight', fontSize: 11, fill: 'var(--chart-3)' }} />
            <ReferenceLine y={3200} stroke="var(--chart-5)" strokeDasharray="6 4" label={{ value: '安全库存', position: 'insideBottomRight', fontSize: 11, fill: 'var(--chart-5)' }} />
          </ComposedChart>
        </ChartContainer>
      </SectionCard>

      <SectionCard title="周度明细" bodyClassName="p-0">
        <DataTableToolbar count={rows.length} density={density} onDensity={setDensity} />
        <DataTable columns={columns} rows={rows} density={density} maxHeight="34rem" />
      </SectionCard>
    </div>
  )
}
