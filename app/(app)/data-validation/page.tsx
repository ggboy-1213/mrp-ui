'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  PageHeader,
  SectionCard,
  ToneBadge,
  StatTiles,
  type StatTile,
} from '@/components/shared/page-kit'
import { DataTable, DataTableToolbar, type Column } from '@/components/shared/data-table'
import {
  VALIDATION_RULES,
  VALIDATION_ISSUES,
  VALIDATION_SEVERITY_TONE,
  type ValidationRule,
  type ValidationIssue,
} from '@/lib/data-ops-data'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ShieldCheck, ShieldAlert, ShieldX, PlayCircle, ArrowRight } from 'lucide-react'

const validationStats: StatTile[] = [
  { key: 'total', label: '校验规则', value: 6, tone: 'primary', icon: ShieldCheck, hint: '4 类维度' },
  { key: 'pass', label: '通过', value: 1, tone: 'success', icon: ShieldCheck, hint: '规则全部达标' },
  { key: 'warn', label: '警告', value: 3, tone: 'warning', icon: ShieldAlert, hint: '非阻断，可继续' },
  { key: 'block', label: '阻断错误', value: 2, tone: 'danger', icon: ShieldX, hint: '需修复后重算' },
]

const ruleColumns: Column<ValidationRule>[] = [
  { key: 'name', header: '校验规则', sticky: 'left', width: '160px', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'category', header: '维度', render: (r) => <ToneBadge tone="neutral">{r.category}</ToneBadge> },
  { key: 'target', header: '校验对象', render: (r) => <span className="text-muted-foreground">{r.target}</span> },
  { key: 'severity', header: '级别', render: (r) => <ToneBadge tone={VALIDATION_SEVERITY_TONE[r.severity]}>{r.severity}</ToneBadge> },
  { key: 'passed', header: '通过', align: 'right', render: (r) => <span className="text-success tabular-nums">{r.passed.toLocaleString()}</span> },
  { key: 'failed', header: '失败', align: 'right', sortable: true, sortValue: (r) => r.failed, render: (r) => (r.failed > 0 ? <span className="font-medium text-destructive tabular-nums">{r.failed}</span> : <span className="text-muted-foreground">0</span>) },
  { key: 'status', header: '结果', render: (r) => <ToneBadge tone={r.status === '通过' ? 'success' : r.status === '警告' ? 'warning' : 'danger'}>{r.status}</ToneBadge> },
]

const issueColumns: Column<ValidationIssue>[] = [
  { key: 'severity', header: '级别', sticky: 'left', width: '80px', render: (r) => <ToneBadge tone={VALIDATION_SEVERITY_TONE[r.severity]}>{r.severity}</ToneBadge> },
  { key: 'rule', header: '规则', render: (r) => <span className="font-medium">{r.rule}</span> },
  { key: 'sku', header: 'SKU', render: (r) => <span className="text-primary">{r.sku}</span> },
  { key: 'scope', header: '范围', render: (r) => r.scope },
  { key: 'detail', header: '问题详情', render: (r) => <span className="text-muted-foreground">{r.detail}</span> },
  { key: 'suggestion', header: '处理建议', render: (r) => r.suggestion },
]

export default function DataValidationPage() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  return (
    <div className="space-y-4">
      <PageHeader
        title="数据校验"
        subtitle="计算前对数据进行校验，阻断级错误必须修复后才能重算，警告与提示不阻断计算但会记录。"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><PlayCircle className="size-4" />重新校验</Button>
            <Button size="sm" className="gap-1.5">进入 MRP 计算<ArrowRight className="size-4" /></Button>
          </>
        }
      />

      <StatTiles items={validationStats} columns={4} />

      {/* Blocking banner */}
      <Card className="flex items-start gap-3 border-destructive/30 bg-destructive/5 p-4">
        <ShieldX className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div>
          <p className="text-sm font-medium text-foreground">存在 2 项阻断级错误，暂时无法进入 MRP 计算</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            请修复「预测数量非空」「SKU 主数据存在」两项校验后重新校验。警告类问题可选择忽略并继续。
          </p>
        </div>
      </Card>

      <Tabs defaultValue="issues">
        <TabsList>
          <TabsTrigger value="issues">问题明细</TabsTrigger>
          <TabsTrigger value="rules">校验规则</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={VALIDATION_ISSUES.length} density={density} onDensity={setDensity} />
            <DataTable columns={issueColumns} rows={VALIDATION_ISSUES} density={density} maxHeight="32rem" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="rules" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={VALIDATION_RULES.length} density={density} onDensity={setDensity} />
            <DataTable columns={ruleColumns} rows={VALIDATION_RULES} density={density} maxHeight="32rem" />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
