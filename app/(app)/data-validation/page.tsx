import { ShieldCheck } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function DataValidationPage() {
  return (
    <PagePlaceholder
      icon={ShieldCheck}
      title="数据校验"
      description="计算前对数据进行校验，关键错误阻断计算，非关键错误提示并记录导入批次。"
      points={[
        '主数据映射校验',
        '缺失字段与必填项检查',
        '日期过期与快照时效',
        '重复 / 冲突数据识别',
        '关键错误阻断，非关键错误提示',
        '校验结果按 Owner 分派处理',
      ]}
    />
  )
}
