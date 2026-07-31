import { TrendingUp } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function InventoryTrendPage() {
  return (
    <PagePlaceholder
      icon={TrendingUp}
      title="库存趋势"
      description="按 SKU 或聚合维度查看未来 21 周的库存走势、缺口与供需平衡明细。"
      points={[
        '未来 21 周期末库存与安全库存对比',
        '预测需求 / 可用到货 / 期末库存分解',
        '缺货周与高库存周高亮标记',
        '可用期初、订单占用、可用退货明细',
        '多维度聚合（国家 / 平台 / 仓）',
        '导出趋势数据用于复盘',
      ]}
    />
  )
}
