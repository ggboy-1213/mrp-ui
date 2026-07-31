'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ToneBadge } from '@/components/shared/page-kit'
import {
  suggestionTypeTone,
  alertTone,
  suggestionCalcTrace,
  type Suggestion,
} from '@/lib/suggestions-data'
import { ArrowRight } from 'lucide-react'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

export function SuggestionDetail({
  suggestion,
  onClose,
}: {
  suggestion: Suggestion | null
  onClose: () => void
}) {
  return (
    <Sheet open={Boolean(suggestion)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
        {suggestion ? (
          <>
            <SheetHeader className="border-b border-border p-5">
              <div className="flex items-center gap-2">
                <ToneBadge tone={suggestionTypeTone[suggestion.type]}>{suggestion.type}建议</ToneBadge>
                <ToneBadge tone={alertTone[suggestion.alert]} dot>
                  {suggestion.alert}
                </ToneBadge>
              </div>
              <SheetTitle className="text-base">{suggestion.productName}</SheetTitle>
              <SheetDescription>
                {suggestion.sku} · {suggestion.country} / {suggestion.platform} · {suggestion.planWeek}
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="info" className="p-5">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="calc">计算过程</TabsTrigger>
                <TabsTrigger value="source">数据来源</TabsTrigger>
                <TabsTrigger value="adjust">调整记录</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4 divide-y divide-border">
                <Row label="SPU" value={suggestion.spu} />
                <Row label="SKU" value={suggestion.sku} />
                <Row label="供应商" value={suggestion.supplier} />
                <Row label="产品线" value={suggestion.productLine} />
                <Row label="目标仓" value={suggestion.targetWarehouse} />
                <Row label="采购归属" value={suggestion.purchaseOwner} />
                <Row label="MOQ" value={suggestion.moq} />
                <Row label="箱规" value={suggestion.caseSize} />
              </TabsContent>

              <TabsContent value="calc" className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['期初库存', suggestion.beginInventory],
                    ['当周预测', suggestion.weekForecast],
                    ['当周到货', suggestion.weekArrival],
                    ['预计期末', suggestion.endInventory],
                    ['目标库存', suggestion.targetInventory],
                    ['原始需求', suggestion.rawDemand],
                  ].map(([label, val]) => (
                    <div key={label as string} className="rounded-md border border-border bg-secondary/50 p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{val}</p>
                    </div>
                  ))}
                </div>
                <ol className="mt-2 space-y-2">
                  {suggestionCalcTrace.map((t, i) => (
                    <li key={t.step} className="flex gap-3 rounded-md border border-border p-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{t.step}</p>
                        <p className="text-xs text-primary">{t.value}</p>
                        <p className="text-xs text-muted-foreground">{t.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </TabsContent>

              <TabsContent value="source" className="mt-4 space-y-2">
                {[
                  ['需求预测', 'FC-2026W24 · 预测版本 v2', '运营中心 · 2026-06-18 更新'],
                  ['期初库存', 'SNP-2026W24 · 数据版本 v3', '仓储系统 · 2026-06-20 快照'],
                  ['采购未交', 'PO 在途 128 单', 'ERP 采购模块 · 实时同步'],
                  ['物流在途', '海运 6 票 / 空运 2 票', 'OMS 物流模块 · 每日同步'],
                  ['计划参数', '参数版本 PARAM-v12', '计划中心 · 生效 2026-06-01'],
                ].map(([title, main, sub]) => (
                  <div key={title} className="rounded-md border border-border p-3">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-primary">{main}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="adjust" className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 p-3 text-sm">
                  <span className="text-muted-foreground">系统建议</span>
                  <span className="font-semibold tabular-nums text-foreground">{suggestion.suggestQty}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">调整后</span>
                  <span className="font-semibold tabular-nums text-primary">{suggestion.suggestQty}</span>
                </div>
                {suggestion.adjustStatus === '未调整' ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">暂无调整记录</p>
                ) : (
                  <ul className="space-y-2">
                    {[
                      ['王磊', '按供应商产能上调 15%', '2026-06-21 10:24'],
                      ['李静', '结合促销预测修正', '2026-06-21 14:02'],
                    ].map(([who, reason, time]) => (
                      <li key={time} className="rounded-md border border-border p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{who}</span>
                          <span className="text-xs text-muted-foreground">{time}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{reason}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
