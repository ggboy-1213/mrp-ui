'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  PageHeader,
  SectionCard,
  ToneBadge,
} from '@/components/shared/page-kit'
import { DataTable, DataTableToolbar, type Column } from '@/components/shared/data-table'
import {
  DATA_SOURCES,
  IMPORT_BATCHES,
  SOURCE_STATUS_TONE,
  IMPORT_STATUS_TONE,
  type ImportBatch,
} from '@/lib/data-ops-data'
import { Upload, RefreshCw, FileDown, Plug, Clock, Database } from 'lucide-react'

const batchColumns: Column<ImportBatch>[] = [
  { key: 'id', header: '批次号', sticky: 'left', width: '170px', render: (r) => <span className="font-mono text-xs font-medium text-primary">{r.id}</span> },
  { key: 'source', header: '数据源', render: (r) => r.source },
  { key: 'fileType', header: '类型', render: (r) => <ToneBadge tone="neutral">{r.fileType}</ToneBadge> },
  { key: 'rows', header: '总行数', align: 'right', sortable: true, sortValue: (r) => r.rows, render: (r) => r.rows.toLocaleString() },
  { key: 'success', header: '成功', align: 'right', render: (r) => <span className="text-success">{r.success.toLocaleString()}</span> },
  { key: 'failed', header: '失败', align: 'right', render: (r) => (r.failed > 0 ? <span className="font-medium text-destructive">{r.failed}</span> : <span className="text-muted-foreground">0</span>) },
  { key: 'status', header: '状态', render: (r) => <ToneBadge tone={IMPORT_STATUS_TONE[r.status]}>{r.status}</ToneBadge> },
  { key: 'operator', header: '操作人', render: (r) => r.operator },
  { key: 'startedAt', header: '开始时间', render: (r) => <span className="text-xs text-muted-foreground">{r.startedAt}</span> },
  { key: 'duration', header: '耗时', align: 'right', render: (r) => <span className="tabular-nums text-muted-foreground">{r.duration}</span> },
  {
    key: 'ops',
    header: '操作',
    align: 'right',
    render: (r) =>
      r.failed > 0 ? (
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
          <FileDown className="size-3.5" />失败明细
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
]

const sourceIcon = { ERP: Database, 接口: Plug, 表格: Upload, SCM: Plug }

export default function DataImportPage() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  return (
    <div className="space-y-4">
      <PageHeader
        title="数据导入"
        subtitle="支持模板导入与系统对接，记录导入批次并进入数据校验流程；失败明细可下载与重传。"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><FileDown className="size-4" />下载模板</Button>
            <Button size="sm" className="gap-1.5"><Upload className="size-4" />上传数据</Button>
          </>
        }
      />

      {/* Data source cards */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">数据源状态</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_SOURCES.map((s) => {
            const Icon = sourceIcon[s.type]
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.type} · {s.cadence}</p>
                    </div>
                  </div>
                  <ToneBadge tone={SOURCE_STATUS_TONE[s.status]}>{s.status}</ToneBadge>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="size-3.5" />{s.lastSync}</span>
                  <span className="tabular-nums">{s.rows.toLocaleString()} 行</span>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs"><RefreshCw className="size-3.5" />立即同步</Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Import batches */}
      <SectionCard title="导入批次记录" description="记录每次导入的行数、成功/失败明细与耗时，支持失败明细下载与重传。" bodyClassName="p-0">
        <DataTableToolbar count={IMPORT_BATCHES.length} density={density} onDensity={setDensity} />
        <DataTable columns={batchColumns} rows={IMPORT_BATCHES} density={density} maxHeight="32rem" />
      </SectionCard>
    </div>
  )
}
