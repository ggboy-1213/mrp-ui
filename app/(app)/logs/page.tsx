import { ScrollText } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function LogsPage() {
  return (
    <PagePlaceholder
      icon={ScrollText}
      title="操作日志"
      description="记录计算发起、参数调整、计划确认等关键操作，支持审计与追溯。"
      points={[
        '关键操作全量留痕',
        '按用户 / 模块 / 时间检索',
        '计算与调整操作详情',
        '计划确认与版本锁定记录',
        '导出审计日志',
        '异常操作告警',
      ]}
    />
  )
}
