import { BellRing } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function AlertsPage() {
  return (
    <PagePlaceholder
      icon={BellRing}
      title="预警中心"
      description="集中管理缺货、高库存、到货延迟、LT 异常及数据类预警，并定位数据 Owner。"
      points={[
        '缺货 / 高库存 / 到货延迟 / LT 异常',
        '数据缺失 / 过期 / 冲突预警',
        '按严重级别（严重 / 预警 / 提示）分类',
        '定位责任人与数据 Owner',
        '预警处理状态与闭环',
        '预警订阅与推送',
      ]}
    />
  )
}
