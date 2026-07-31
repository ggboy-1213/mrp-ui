'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { LOGS, type LogRow } from '@/lib/admin-data'
import { Download } from 'lucide-react'

const actionTone: Record<string, Parameters<typeof ToneBadge>[0]['tone']> = {
  创建: 'success',
  编辑: 'info',
  删除: 'danger',
  发布: 'primary',
  校验: 'info',
  导出: 'neutral',
  登录: 'neutral',
  调整参数: 'warning',
}

const columns: Column<LogRow>[] = [
  { key: 'time', header: '时间', sticky: 'left', width: '160px', render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.time}</span> },
  { key: 'operator', header: '操作人', render: (r) => <span className="font-medium">{r.operator}</span> },
  { key: 'module', header: '模块', render: (r) => <ToneBadge tone="neutral">{r.module}</ToneBadge> },
  { key: 'action', header: '操作', render: (r) => <ToneBadge tone={actionTone[r.action] ?? 'neutral'}>{r.action}</ToneBadge> },
  { key: 'target', header: '对象', render: (r) => <span className="font-mono text-xs text-primary">{r.target}</span> },
  { key: 'result', header: '结果', render: (r) => <ToneBadge tone={r.result === '成功' ? 'success' : 'danger'}>{r.result}</ToneBadge> },
  { key: 'ip', header: 'IP 地址', render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.ip}</span> },
]

export default function LogsPage() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact')

  return (
    <div className="space-y-4">
      <PageHeader
        title="操作日志"
        subtitle="记录计算发起、参数调整、计划确认等关键操作，全量留痕，支持按用户 / 模块 / 时间检索与审计导出。"
        actions={<Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" />导出日志</Button>}
      />

      <FilterBar>
        <FilterField label="模块">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部模块' : v)}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="all">全部模块</SelectItem>{['计划任务', '人工调整', '计划参数', '数据导入', '主数据', '用户与权限', '系统配置'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterField label="结果">
          <Select defaultValue="all">
            <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部结果' : v)}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="all">全部结果</SelectItem>{['成功', '失败'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FilterField>
        <FilterInput label="操作人" />
        <FilterInput label="日期范围" placeholder="如 2026-07-31" />
      </FilterBar>

      <SectionCard bodyClassName="p-0">
        <DataTableToolbar count={LOGS.length} density={density} onDensity={setDensity} />
        <DataTable columns={columns} rows={LOGS} density={density} maxHeight="36rem" />
      </SectionCard>
    </div>
  )
}
