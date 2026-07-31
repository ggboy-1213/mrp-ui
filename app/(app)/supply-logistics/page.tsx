import { Truck } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function SupplyLogisticsPage() {
  return (
    <PagePlaceholder
      icon={Truck}
      title="供应与物流"
      description="维护供应商、采购在途及各段物流时效，用于补货时间反推计算。"
      points={[
        '供应商、采购未交、采购 LT、质检 LT',
        '集货 / 头程 / 尾程 LT',
        '在途库存与预计上架',
        '数据来源：SCM / 物流表格 / 物流服务商',
        'LT 异常波动监控',
        '到货延迟预警联动',
      ]}
    />
  )
}
