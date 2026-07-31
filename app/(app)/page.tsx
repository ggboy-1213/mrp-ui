import { getDashboard } from '@/lib/api'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { PlanSteps } from '@/components/dashboard/plan-steps'
import { InventoryChart } from '@/components/dashboard/inventory-chart'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { VersionsTable } from '@/components/dashboard/versions-table'
import { CurrentVersionCard } from '@/components/dashboard/current-version-card'

export default async function WorkbenchPage() {
  const data = await getDashboard()

  return (
    <div className="flex flex-col gap-5">
      <KpiCards kpis={data.kpis} />

      <PlanSteps steps={data.steps} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <InventoryChart data={data.weekly} />
        <CurrentVersionCard version={data.currentVersion} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <AlertsPanel alerts={data.alerts} />
        </div>
        <div className="xl:col-span-2">
          <VersionsTable versions={data.recentVersions} />
        </div>
      </div>
    </div>
  )
}
