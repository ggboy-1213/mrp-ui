'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ValidationBadge } from './task-badges'
import { wizardReference } from '@/lib/task-data'
import type { ProductMode } from '@/lib/task-types'
import { Check, CircleAlert } from 'lucide-react'

const STEPS = ['基本信息', '计划范围', 'SCM 数据检查', '计划参数', '确认创建']

type MultiKey = 'countries' | 'productLines' | 'suppliers' | 'purchaseOwners'
const PRODUCT_MODES: ProductMode[] = ['全部', '指定SKU', '条件筛选']

export function CreateTaskDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (mode: 'draft' | 'validate', name: string) => void
}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('2026 W31 周度库存计划')
  const [startWeek, setStartWeek] = useState('2026 W31')
  const [weeks, setWeeks] = useState('21')
  const [note, setNote] = useState('')
  const [owner, setOwner] = useState('李航')
  const [collaborators, setCollaborators] = useState<string[]>(['张伟'])
  const [productMode, setProductMode] = useState<ProductMode>('全部')
  const [scope, setScope] = useState<Record<MultiKey, string[]>>({
    countries: ['美国'],
    productLines: ['3C 数码'],
    suppliers: [],
    purchaseOwners: ['采购一组'],
  })

  const toggle = (key: MultiKey, val: string) =>
    setScope((s) => ({
      ...s,
      [key]: s[key].includes(val) ? s[key].filter((v) => v !== val) : [...s[key], val],
    }))

  const reset = () => {
    setStep(0)
  }

  const finish = (mode: 'draft' | 'validate') => {
    onCreate(mode, name)
    onOpenChange(false)
    reset()
  }

  const skuEstimate = productMode === '全部' ? '1,284' : productMode === '指定SKU' ? '按清单' : '按条件'

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle>新建计划任务</DialogTitle>
          <DialogDescription>配置计划范围与参数，数据由 SCM 实时对接并自动检查，完成后可直接发起检查。</DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-1 border-b bg-muted/40 px-4 py-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                    i < step && 'bg-primary text-primary-foreground',
                    i === step && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                    i > step && 'bg-muted text-muted-foreground',
                  )}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={cn('whitespace-nowrap text-xs', i === step ? 'font-medium text-foreground' : 'text-muted-foreground')}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <span className={cn('h-px flex-1', i < step ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>计划名称</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>计划开始周</Label>
                <Input value={startWeek} onChange={(e) => setStartWeek(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>计划周数</Label>
                <Input type="number" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>负责人</Label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {wizardReference.owners.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>协作人员</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {wizardReference.owners.filter((o) => o !== owner).map((o) => (
                    <label key={o} className="flex cursor-pointer items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={collaborators.includes(o)}
                        onCheckedChange={() =>
                          setCollaborators((c) => (c.includes(o) ? c.filter((x) => x !== o) : [...c, o]))
                        }
                      />
                      {o}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>计划说明</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="填写本次计划的背景、目标或注意事项" rows={3} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <MultiSection title="国家" items={wizardReference.countries} selected={scope.countries} onToggle={(v) => toggle('countries', v)} />
              <div>
                <Label className="mb-2 block text-xs text-muted-foreground">SKU 选择方式</Label>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_MODES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setProductMode(m)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        productMode === m ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-accent',
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <MultiSection title="产品线" items={wizardReference.productLines} selected={scope.productLines} onToggle={(v) => toggle('productLines', v)} />
              <MultiSection title="供应商" items={wizardReference.suppliers} selected={scope.suppliers} onToggle={(v) => toggle('suppliers', v)} />
              <MultiSection title="采购归属" items={wizardReference.purchaseOwners} selected={scope.purchaseOwners} onToggle={(v) => toggle('purchaseOwners', v)} />
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                计划范围将解析为 <span className="font-semibold text-primary">Country + SKU</span> 引擎单元，预计参与计算 SKU：
                <span className="ml-1 font-semibold text-primary tabular-nums">{skuEstimate}</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-2">
              <div className="mb-1 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                数据全部来自 SCM 实时对接，创建时自动拉取并检查，无需人工导入或选择版本。
              </div>
              {wizardReference.scmSources.map((d) => (
                <div
                  key={d.source}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{d.source}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.rows.toLocaleString('zh-CN')} 行 · 最近同步 {d.updatedAt}
                    </p>
                  </div>
                  {d.issues > 0 && <span className="text-xs text-[oklch(0.5_0.13_60)]">{d.issues} 个问题</span>}
                  <ValidationBadge status={d.status} />
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">计划参数</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ParamRow label="安全库存天数" value={`${wizardReference.planParams.safetyStockDays} 天`} />
                  <ParamRow label="QC 周期" value={`${wizardReference.planParams.qcDays} 天`} />
                  <ParamRow label="国际物流时效" value={`${wizardReference.planParams.intlLeadTime} 天`} />
                  <ParamRow label="发运箱规倍数" value={`${wizardReference.planParams.cartonMultiple} 件 / 箱`} />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">外部参数（独立展示）</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {wizardReference.externalParams.map((p) => (
                    <div key={p.key} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{p.label}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{p.key}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tabular-nums text-foreground">{p.value}</p>
                        <p className={cn('text-[11px]', p.fallback ? 'text-[oklch(0.5_0.13_60)]' : 'text-success')}>
                          {p.source}{p.fallback && ' · 兜底'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">MOQ 与生产提前期优先取 SCM 供应商数据，缺失时回落至 MRP Supplier Config。</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-3">
              <SummaryRow label="计划名称" value={name} />
              <SummaryRow label="计划周期" value={`${startWeek} · ${weeks} 周`} />
              <SummaryRow label="计划国家" value={scope.countries.join('、') || '—'} />
              <SummaryRow label="SKU 选择方式" value={productMode} />
              <SummaryRow label="产品线 / 供应商" value={`${scope.productLines.join('、') || '—'} / ${scope.suppliers.join('、') || '不限'}`} />
              <SummaryRow label="预计参与 SKU" value={`${skuEstimate}`} />
              <SummaryRow label="数据来源" value="SCM 实时对接（7 类，自动检查）" />
              <SummaryRow label="计划参数" value={`安全库存 ${wizardReference.planParams.safetyStockDays} 天 · 物流 ${wizardReference.planParams.intlLeadTime} 天`} />
              <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-[oklch(0.5_0.13_60)]">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                <span>提示：供应商数据存在 1 项 SCM 未同步，将回落至 MRP Supplier Config 默认值；建议检查后再发起计算。</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-muted/40 p-4">
          <Button variant="ghost" onClick={() => (step === 0 ? onOpenChange(false) : setStep((s) => s - 1))}>
            {step === 0 ? '取消' : '上一步'}
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => finish('draft')}>保存草稿</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>下一步</Button>
            ) : (
              <Button onClick={() => finish('validate')}>创建并检查</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  )
}

function MultiSection({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string
  items: string[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  const allSelected = selected.length === items.length && items.length > 0
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{title}</Label>
        <button
          type="button"
          className="text-xs text-primary hover:underline"
          onClick={() => items.forEach((i) => (allSelected ? selected.includes(i) && onToggle(i) : !selected.includes(i) && onToggle(i)))}
        >
          {allSelected ? '取消全选' : '全选'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => {
          const active = selected.includes(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-accent',
              )}
            >
              {i}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
