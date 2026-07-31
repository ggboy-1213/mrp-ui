'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { WeeklyInventoryPoint } from '@/lib/types'

const chartConfig = {
  demand: { label: '预测需求', color: 'var(--chart-1)' },
  arrival: { label: '预计到货', color: 'var(--chart-2)' },
  endingStock: { label: '预计期末库存', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function InventoryChart({ data }: { data: WeeklyInventoryPoint[] }) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">未来 21 周库存趋势</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            预测需求 / 预计到货 / 预计期末库存，虚线为安全库存参考线
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <ComposedChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              width={44}
              tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="demand" fill="var(--color-demand)" radius={[3, 3, 0, 0]} barSize={10} />
            <Bar dataKey="arrival" fill="var(--color-arrival)" radius={[3, 3, 0, 0]} barSize={10} />
            <Line
              dataKey="endingStock"
              type="monotone"
              stroke="var(--color-endingStock)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <ReferenceLine
              y={6000}
              stroke="var(--chart-5)"
              strokeDasharray="6 4"
              label={{ value: '安全库存', position: 'insideTopRight', fontSize: 11, fill: 'var(--chart-5)' }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
