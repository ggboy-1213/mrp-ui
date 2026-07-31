import { Settings2 } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function ParametersPage() {
  return (
    <PagePlaceholder
      icon={Settings2}
      title="计划参数"
      description="维护目标库存天数、MOQ、箱规、固定发运量等计划参数，支持版本化管理。"
      points={[
        '目标库存天数与安全库存策略',
        'MOQ、箱规与固定发运量',
        '按国家 / 平台 / 仓 / 品类分层配置',
        '参数版本化与生效范围',
        '参数变更留痕',
        '固化到计算快照',
      ]}
    />
  )
}
