'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  adjustments as seed,
  adjustSummary,
  recalcTone,
  impactAnalysis,
  type Adjustment,
} from '@/lib/adjustments-data'
import {
  Save,
  RefreshCw,
  CheckCircle2,
  Undo2,
  ClipboardList,
  PencilLine,
  Boxes,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { toneText, toneSoftBg } from '@/lib/tone'
import { cn } from '@/lib/utils'

export default function AdjustmentsPage({ embedded = false }: { embedded?: boolean }) {
  const [rows, setRows] = useState<Adjustment[]>(seed)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact')

  const updateQty = (id: string, value: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, adjustedQty: value, recalcStatus: value !== r.systemQty ? '待复算' : '无需复算' }
          : r,
      ),
    )
  }

  const afterTotal = rows.reduce((s, r) => s + r.adjustedQty, 0)

  const stats: StatTile[] = [
    { key: 'pending', label: '待调整数量', value: adjustSummary.pending, unit: '项', tone: 'warning', icon: ClipboardList },
    { key: 'adjusted', label: '已调整数量', value: adjustSummary.adjusted, unit: '项', tone: 'primary', icon: PencilLine },
    { key: 'sku', label: '影响 SKU 数', value: adjustSummary.affectedSku, unit: '个', tone: 'mrp', icon: Boxes },
    { key: 'before', label: '调整前总数量', value: adjustSummary.beforeTotal.toLocaleString(), tone: 'muted', icon: TrendingUp },
    { key: 'after', label: '调整后总数量', value: afterTotal.toLocaleString(), tone: 'success', icon: TrendingUp },
  ]

  const columns: Column<Adjustment>[] = [
    { key: 'sku', header: 'SKU', sticky: 'left', width: '120px', render: (r) => <span className="font-medium">{r.sku}</span> },
    { key: 'spu', header: 'SPU', render: (r) => <span className="text-muted-foreground">{r.spu}</span> },
    { key: 'country', header: '国家 / 平台', render: (r) => `${r.country} / ${r.platform}` },
    { key: 'targetWarehouse', header: '目标仓', render: (r) => r.targetWarehouse },
    { key: 'planWeek', header: '计划周', render: (r) => r.planWeek },
    { key: 'systemQty', header: '系统建议', align: 'right', sortable: true, sortValue: (r) => r.systemQty, render: (r) => r.systemQty.toLocaleString() },
    { key: 'adjustedQty', header: '调整后数量', align: 'right', width: '120px', render: (r) => (
      <Input
        type="number"
        value={r.adjustedQty}
        onChange={(e) => updateQty(r.id, Number(e.target.value) || 0)}
        className="h-8 w-24 text-right tabular-nums"
      />
    ) },
    { key: 'diff', header: '调整差异', align: 'right', render: (r) => {
      const d = r.adjustedQty - r.systemQty
      return <span className={cn('font-medium tabular-nums', d > 0 ? 'text-success' : d < 0 ? 'text-destructive' : 'text-muted-foreground')}>{d > 0 ? `+${d}` : d}</span>
    } },
    { key: 'reason', header: '调整原因', width: '160px', render: (r) => (
      <Input
        defaultValue={r.reason}
        placeholder={r.adjustedQty !== r.systemQty ? '必填' : '无需填写'}
        className={cn('h-8', r.adjustedQty !== r.systemQty && !r.reason && 'border-destructive')}
      />
    ) },
    { key: 'operator', header: '调整人', render: (r) => r.operator },
    { key: 'adjustTime', header: '调整时间', render: (r) => <span className="text-xs text-muted-foreground">{r.adjustTime}</span> },
    { key: 'recalcStatus', header: '复算状态', render: (r) => <ToneBadge tone={recalcTone[r.recalcStatus]} dot>{r.recalcStatus}</ToneBadge> },
    { key: 'ops', header: '操作', sticky: 'right', width: '80px', render: (r) => (
      <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => updateQty(r.id, r.systemQty)}>
        <Undo2 className="size-3.5" />撤销
      </Button>
    ) },
  ]

  return (
    <div className="space-y-4">
      {!embedded && (
        <PageHeader
          title="人工调整"
          subtitle="对系统生成的补货建议进行人工修改，实时评估对缺货、高库存、采购金额及后续计划周的影响。"
          actions={
            <>
              <Button variant="outline" size="sm" className="gap-1.5"><Save className="size-4" />保存草稿</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="size-4" />重新计算</Button>
              <Button size="sm" className="gap-1.5"><CheckCircle2 className="size-4" />提交确认</Button>
            </>
          }
        />
      )}

      <StatTiles items={stats} columns={5} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <SectionCard title="调整明细" description="直接编辑「调整后数量」，差异将实时汇总并触发复算状态" bodyClassName="p-0">
            <DataTableToolbar count={rows.length} density={density} onDensity={setDensity} />
            <DataTable columns={columns} rows={rows} density={density} maxHeight="38rem" />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-foreground">影响分析</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">调整前后对比</p>

            <div className="mt-4 space-y-3">
              <ImpactRow label="缺货风险 SKU" before={impactAnalysis.shortageBefore} after={impactAnalysis.shortageAfter} good="down" />
              <ImpactRow label="高库存风险 SKU" before={impactAnalysis.overstockBefore} after={impactAnalysis.overstockAfter} good="down" />
              <ImpactRow
                label="采购金额 (元)"
                before={impactAnalysis.amountBefore}
                after={impactAnalysis.amountAfter}
                good="down"
                money
              />
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold text-foreground">后续计划周影响</h2>
            <ul className="mt-3 space-y-2">
              {impactAnalysis.futureWeeks.map((w) => (
                <li key={w.week} className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5">
                  <span className="text-sm font-medium text-foreground">{w.week}</span>
                  <span className={cn('flex items-center gap-1 text-xs font-medium', toneText[w.tone])}>
                    <span className={cn('flex size-5 items-center justify-center rounded', toneSoftBg[w.tone])}>
                      <ArrowRight className="size-3" />
                    </span>
                    {w.effect}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ImpactRow({
  label,
  before,
  after,
  good,
  money,
}: {
  label: string
  before: number
  after: number
  good: 'up' | 'down'
  money?: boolean
}) {
  const diff = after - before
  const improved = good === 'down' ? diff < 0 : diff > 0
  const fmt = (n: number) => (money ? n.toLocaleString() : n)
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-center gap-2 text-sm">
        <span className="tabular-nums text-muted-foreground">{fmt(before)}</span>
        <ArrowRight className="size-3.5 text-muted-foreground" />
        <span className="font-semibold tabular-nums text-foreground">{fmt(after)}</span>
        {diff !== 0 ? (
          <span className={cn('ml-auto text-xs font-medium', improved ? 'text-success' : 'text-destructive')}>
            {diff > 0 ? `+${fmt(diff)}` : fmt(diff)}
          </span>
        ) : null}
      </div>
    </div>
  )
}
