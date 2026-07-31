import { Database } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function MasterDataPage() {
  return (
    <PagePlaceholder
      icon={Database}
      title="主数据"
      description="维护产品、仓库、区域与平台映射等基础主数据，保障计算口径一致。"
      points={[
        '仓库 / 区域 / 平台映射关系',
        '产品生命周期状态',
        'SPU / SKU 基础属性',
        '箱规、包装与体积重量',
        '主数据 Owner 与维护职责',
        '主数据变更审计',
      ]}
    />
  )
}
