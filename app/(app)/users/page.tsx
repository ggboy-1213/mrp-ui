import { Users } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function UsersPage() {
  return (
    <PagePlaceholder
      icon={Users}
      title="用户与权限"
      description="管理计划、采购、物流、仓储等角色的账户与数据权限。"
      points={[
        '用户账户与组织架构',
        '角色与功能权限',
        '数据权限（国家 / 平台 / 仓 / 品类）',
        '数据 Owner 指派',
        '登录与操作安全策略',
        '权限变更审计',
      ]}
    />
  )
}
