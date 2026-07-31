import { Lightbulb } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function SuggestionsPage() {
  return (
    <PagePlaceholder
      icon={Lightbulb}
      title="计划建议"
      description="展示 MRP 计算生成的可解释补货建议，覆盖采购、集货、发运、到货与调拨计划。"
      points={[
        '按 SPU / SKU / 国家 / 平台 / 仓 / 供应商 / 周筛选',
        '采购、集货、发运、到货、调拨多计划类型',
        '每条建议关联预测、库存、在途与参数',
        'MOQ / 箱规 / 固定量取整逻辑展示',
        '按 LT 反推计划周与到货周',
        '计算批次可复现与结果对比',
      ]}
    />
  )
}
