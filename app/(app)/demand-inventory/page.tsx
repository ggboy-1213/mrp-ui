import { PackageSearch } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function DemandInventoryPage() {
  return (
    <PagePlaceholder
      icon={PackageSearch}
      title="需求与库存"
      description="接收周度预测与各仓库存数据，作为 MRP 计算的核心输入。"
      points={[
        '周度预测：国家 + 平台 + SPU / SKU + 仓',
        '可用库存与平台仓库存',
        '订单占用与可用退货',
        '数据来源：预测系统 / WMS / 平台仓 / BI',
        '数据更新时间与快照版本',
        '异常与缺失字段提示',
      ]}
    />
  )
}
