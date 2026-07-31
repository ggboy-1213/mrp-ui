import { Upload } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function DataImportPage() {
  return (
    <PagePlaceholder
      icon={Upload}
      title="数据导入"
      description="支持模板导入与系统对接，记录导入批次并进入数据校验流程。"
      points={[
        '按模板批量导入预测 / 库存 / 物流数据',
        '导入批次管理与回溯',
        '字段映射与格式校验',
        '导入结果统计（成功 / 失败 / 警告）',
        '失败明细下载与重传',
        '系统对接（预测系统 / WMS / SCM）',
      ]}
    />
  )
}
