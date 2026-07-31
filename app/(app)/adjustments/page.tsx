import { SlidersHorizontal } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function AdjustmentsPage() {
  return (
    <PagePlaceholder
      icon={SlidersHorizontal}
      title="人工调整"
      description="计划员对建议数量或参数进行调整、复算并确认，全程记录调整原因与差异。"
      points={[
        '调整补货数量或计划参数',
        '必填调整原因，留痕可追溯',
        '调整后一键复算并比较前后差异',
        '调整审批流与权限控制',
        '最终确认后锁定计划版本',
        '批量调整与撤销',
      ]}
    />
  )
}
