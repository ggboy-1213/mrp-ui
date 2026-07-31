import { Cog } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function SettingsPage() {
  return (
    <PagePlaceholder
      icon={Cog}
      title="系统配置"
      description="配置计划日历、计算范围、数据源对接与系统级参数。"
      points={[
        '计划日历与周度口径',
        '默认计划范围与滚动周数（21 周）',
        '数据源与接口配置',
        '数据留存周期（≥48 周）',
        '回写 SCM / 执行系统接口预留',
        '系统通知与集成设置',
      ]}
    />
  )
}
