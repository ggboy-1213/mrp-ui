'use client'

import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ToneBadge } from '@/components/shared/page-kit'
import { StageBadge } from '@/components/tasks/task-badges'
import type { PlanTask } from '@/lib/task-types'
import { taskStatusMeta } from '@/lib/task-types'
import {
  OverviewPanel,
  ScmCheckPanel,
  ParamPanel,
  ExceptionPanel,
  RunLogPanel,
} from '@/components/tasks/detail-panels'
import InventoryTrendPage from '@/app/(app)/inventory-trend/page'
import DemandInventoryPage from '@/app/(app)/demand-inventory/page'
import SupplyLogisticsPage from '@/app/(app)/supply-logistics/page'
import SuggestionsPage from '@/app/(app)/suggestions/page'
import AdjustmentsPage from '@/app/(app)/adjustments/page'
import { ChevronLeft, Play, Download, CheckCircle2 } from 'lucide-react'

const TABS = [
  { value: 'overview', label: '概览' },
  { value: 'check', label: '数据检查' },
  { value: 'param', label: '计划参数' },
  { value: 'trend', label: '库存趋势' },
  { value: 'demand', label: '需求与库存' },
  { value: 'supply', label: '供应与物流' },
  { value: 'suggestions', label: '计划建议' },
  { value: 'exception', label: '风险异常' },
  { value: 'adjust', label: '人工调整' },
  { value: 'log', label: '运行日志' },
]

export function TaskDetailView({ task }: { task: PlanTask }) {
  return (
    <div className="flex flex-col gap-4">
      {/* 面包屑 + 标题 */}
      <div className="flex flex-col gap-3">
        <Link
          href="/tasks"
          className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          返回计划任务列表
        </Link>

        <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{task.name}</h1>
              <ToneBadge tone={taskStatusMeta[task.status].tone} dot>
                {task.status}
              </ToneBadge>
              <StageBadge stage={task.stage} />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="font-mono">{task.id}</span>
              <span>周期 {task.cycle}</span>
              <span>负责人 {task.owner}</span>
              <span>创建于 {task.createdAt}</span>
              <span>更新于 {task.updatedAt}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="size-4" />
              导出结果
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Play className="size-4" />
              重新计算
            </Button>
            <Button size="sm" className="gap-1.5">
              <CheckCircle2 className="size-4" />
              提交确认
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
          <OverviewPanel task={task} />
        </TabsContent>
        <TabsContent value="check" className="mt-4">
          <ScmCheckPanel task={task} />
        </TabsContent>
        <TabsContent value="param" className="mt-4">
          <ParamPanel task={task} />
        </TabsContent>
        <TabsContent value="trend" className="mt-4">
          <InventoryTrendPage embedded />
        </TabsContent>
        <TabsContent value="demand" className="mt-4">
          <DemandInventoryPage embedded />
        </TabsContent>
        <TabsContent value="supply" className="mt-4">
          <SupplyLogisticsPage embedded />
        </TabsContent>
        <TabsContent value="suggestions" className="mt-4">
          <SuggestionsPage embedded />
        </TabsContent>
        <TabsContent value="exception" className="mt-4">
          <ExceptionPanel task={task} />
        </TabsContent>
        <TabsContent value="adjust" className="mt-4">
          <AdjustmentsPage embedded />
        </TabsContent>
        <TabsContent value="log" className="mt-4">
          <RunLogPanel task={task} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
