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
import { Check, AlertTriangle, CircleAlert } from 'lucide-react'

const STEPS = ['基本信息', '计划范围', '输入数据版本', '参数版本', '确认创建']

type MultiKey = 'countries' | 'platforms' | 'warehouses' | 'productLines' | 'suppliers' | 'purchaseOwners'

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
  const [scope, setScope] = useState<Record<MultiKey, string[]>>({
    countries: ['美国'],
    platforms: ['Amazon'],
    warehouses: ['US-East', 'US-West'],
    productLines: ['3C 数码'],
    suppliers: [],
    purchaseOwners: ['采购一组'],
  })
  const [dataSel, setDataSel] = useState<string[]>(wizardReference.dataInputs.map((d) => d.type))

  const toggle = (key: MultiKey, val: string) =>
    setScope((s) => ({
      ...s,
      [key]: s[key].includes(val) ? s[key].filter((v) => v !== val) : [...s[key], val],
    }))

  const toggleData = (t: string) =>
    setDataSel((s) => (s.includes(t) ? s.filter((v) => v !== t) : [...s, t]))

  const reset = () => {
    setStep(0)
  }

  const finish = (mode: 'draft' | 'validate') => {
    onCreate(mode, name)
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle>新建计划任务</DialogTitle>
          <DialogDescription>按步骤配置计划范围、输入数据与参数版本，完成后可直接发起校验。</DialogDescription>
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
              <MultiSection title="平台" items={wizardReference.platforms} selected={scope.platforms} onToggle={(v) => toggle('platforms', v)} />
              <MultiSection title="仓库" items={wizardReference.warehouses} selected={scope.warehouses} onToggle={(v) => toggle('warehouses', v)} />
              <MultiSection title="产品线" items={wizardReference.productLines} selected={scope.productLines} onToggle={(v) => toggle('productLines', v)} />
              <MultiSection title="供应商" items={wizardReference.suppliers} selected={scope.suppliers} onToggle={(v) => toggle('suppliers', v)} />
              <MultiSection title="采购归属" items={wizardReference.purchaseOwners} selected={scope.purchaseOwners} onToggle={(v) => toggle('purchaseOwners', v)} />
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                预计参与计算 SKU：<span className="font-semibold text-primary tabular-nums">1,284</span> 个
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-2">
              {wizardReference.dataInputs.map((d) => (
                <label
                  key={d.type}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm',
                    dataSel.includes(d.type) ? 'border-primary/40 bg-primary/5' : 'border-border',
                  )}
                >
                  <Checkbox checked={dataSel.includes(d.type)} onCheckedChange={() => toggleData(d.type)} />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{d.type}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{d.version}</span> · {d.dataDate} · {d.rows.toLocaleString('zh-CN')} 行
                    </p>
                  </div>
                  <ValidationBadge status={d.validation} />
                  {d.expired && (
                    <span className="inline-flex items-center gap-1 text-xs text-[oklch(0.5_0.13_60)]">
                      <AlertTriangle className="size-3.5" /> 已过期
                    </span>
                  )}
                </label>
              ))}
              <p className="text-xs text-muted-foreground">默认已选择各数据类型的最新有效版本，过期或校验失败的数据请更新后再校验。</p>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-[oklch(0.5_0.13_60)]">
                参数覆盖率 <span className="font-semibold">98.6%</span>，存在 <span className="font-semibold">18</span> 个 SKU 参数不完整
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {wizardReference.params.map((p) => (
                  <div key={p.type} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{p.type}</p>
                      <p className="font-mono text-xs text-muted-foreground">{p.version}</p>
                    </div>
                    <span className={cn('text-sm font-medium tabular-nums', p.coverage < 95 ? 'text-[oklch(0.5_0.13_60)]' : 'text-success')}>
                      {p.coverage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-3">
              <SummaryRow label="计划名称" value={name} />
              <SummaryRow label="计划周期" value={`${startWeek} · ${weeks} 周`} />
              <SummaryRow label="计划范围" value={`${scope.countries.join('、') || '—'} / ${scope.platforms.join('、') || '—'} / ${scope.warehouses.join('、') || '—'}`} />
              <SummaryRow label="参与 SKU 数" value="1,284 个" />
              <SummaryRow label="输入数据版本" value={`${dataSel.length} 类数据`} />
              <SummaryRow label="参数版本" value="P2026.8（覆盖率 98.6%）" />
              <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-[oklch(0.5_0.13_60)]">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                <span>风险提示：主数据存在 1 类数据已过期，18 个 SKU 参数不完整，建议校验后再发起计算。</span>
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
              <Button onClick={() => finish('validate')}>创建并校验</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
