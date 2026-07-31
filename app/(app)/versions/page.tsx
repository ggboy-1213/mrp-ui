import { History } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function VersionsPage() {
  return (
    <PagePlaceholder
      icon={History}
      title="计划版本"
      description="留存每个计算批次的快照、规则、调整与确认记录，保存不少于 48 周，支持导出与复现。"
      points={[
        '版本列表与状态（计算中 / 待评审 / 已确认 / 已归档）',
        '批次、快照、规则与参数完整留存',
        '调整记录与确认记录审计追踪',
        '版本间差异对比',
        '导出计划结果',
        '为回写 SCM / 执行系统预留接口',
      ]}
    />
  )
}
