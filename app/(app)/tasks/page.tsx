import { ListTodo } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function TasksPage() {
  return (
    <PagePlaceholder
      icon={ListTodo}
      title="计划任务"
      description="管理每一次 MRP 计算任务的发起、排队、执行与结果追踪，支持定时与手动触发。"
      points={[
        '发起周度计算任务并选择计划范围',
        '任务队列与执行状态实时监控',
        '固化输入快照与参数版本',
        '计算耗时、成功率与失败原因',
        '定时任务与手动重算',
        '任务结果一键跳转计划建议',
      ]}
    />
  )
}
