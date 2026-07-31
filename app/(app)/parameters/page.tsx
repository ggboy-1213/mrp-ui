'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  PageHeader,
  SectionCard,
  ToneBadge,
} from '@/components/shared/page-kit'
import { DataTable, type Column } from '@/components/shared/data-table'
import { cn } from '@/lib/utils'
import {
  PARAM_VERSIONS,
  PARAM_RULES,
  PARAM_GROUPS,
  PARAM_STATUS_TONE,
  type ParamRule,
} from '@/lib/parameters-data'
import { Plus, Save, GitBranch, CheckCircle2 } from 'lucide-react'

const sourceTone = { '全局默认': 'neutral', '维度覆盖': 'info', 'SKU 覆盖': 'primary' } as const

const ruleColumns: Column<ParamRule>[] = [
  { key: 'label', header: '参数', sticky: 'left', width: '160px', render: (r) => <span className="font-medium">{r.label}</span> },
  { key: 'key', header: '参数键', render: (r) => <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{r.key}</code> },
  { key: 'scope', header: '生效范围', render: (r) => r.scope },
  {
    key: 'value',
    header: '参数值',
    align: 'right',
    render: (r) => (
      <span className="font-semibold tabular-nums text-foreground">
        {r.value}
        <span className="ml-1 text-xs font-normal text-muted-foreground">{r.unit}</span>
      </span>
    ),
  },
  { key: 'source', header: '来源', render: (r) => <ToneBadge tone={sourceTone[r.source]}>{r.source}</ToneBadge> },
]

export default function ParametersPage() {
  const [activeGroup, setActiveGroup] = useState<string>('全部')
  const [activeVersion, setActiveVersion] = useState<string>('PV-2026-07')

  const groups = ['全部', ...PARAM_GROUPS]
  const filtered = activeGroup === '全部' ? PARAM_RULES : PARAM_RULES.filter((r) => r.group === activeGroup)

  return (
    <div className="space-y-4">
      <PageHeader
        title="计划参数"
        subtitle="维护安全库存、服务水平、MOQ、提前期缓冲等计划参数，支持版本化管理与分层覆盖，固化到计算快照。"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Save className="size-4" />保存草稿</Button>
            <Button size="sm" className="gap-1.5"><CheckCircle2 className="size-4" />发布并生效</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Version rail */}
        <SectionCard title="参数版本" bodyClassName="p-0">
          <div className="flex flex-col">
            {PARAM_VERSIONS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveVersion(v.id)}
                className={cn(
                  'flex flex-col gap-1.5 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent/40',
                  activeVersion === v.id && 'bg-accent/60',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-primary">
                    <GitBranch className="size-3.5" />
                    {v.version}
                  </span>
                  <ToneBadge tone={PARAM_STATUS_TONE[v.status]}>{v.status}</ToneBadge>
                </div>
                <p className="text-sm font-medium text-foreground">{v.name}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{v.scope}</span>
                  <span>覆盖 {v.coverage}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{v.createdBy} · {v.createdAt}</p>
              </button>
            ))}
            <div className="p-3">
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <Plus className="size-4" />新建参数版本
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* Rules */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {groups.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setActiveGroup(g)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  activeGroup === g
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {g}
              </button>
            ))}
          </div>

          <SectionCard
            title="参数明细"
            description="按参数组查看分层配置，SKU 覆盖优先级最高，其次维度覆盖，最后全局默认。"
            bodyClassName="p-0"
          >
            <DataTable columns={ruleColumns} rows={filtered} maxHeight="34rem" />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
