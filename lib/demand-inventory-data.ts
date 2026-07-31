const countries = ['美国', '德国', '英国', '日本']
const platforms = ['Amazon', 'Temu', 'TikTok', 'eBay']
const warehouses = ['US-East-01', 'US-West-02', 'DE-FRA-01', 'JP-TYO-01']
const sources = ['运营预测', '算法预测', '手工上传', 'ERP 同步']

function pick<T>(a: T[], i: number): T {
  return a[i % a.length]
}

export interface ForecastRow {
  id: string
  sku: string
  spu: string
  country: string
  platform: string
  planWeek: string
  forecastQty: number
  forecastVersion: string
  source: string
  updatedAt: string
}

export const forecastRows: ForecastRow[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `FC-${i}`,
  sku: `SKU${100000 + i}`,
  spu: `SPU${9000 + (i % 10)}`,
  country: pick(countries, i),
  platform: pick(platforms, i + 1),
  planWeek: `2026-W${24 + (i % 6)}`,
  forecastQty: 300 + ((i * 71) % 1200),
  forecastVersion: `FC-v${2 - (i % 2)}`,
  source: pick(sources, i),
  updatedAt: `2026-06-${String(18 - (i % 10)).padStart(2, '0')} 08:30`,
}))

export interface InventoryRow {
  id: string
  sku: string
  spu: string
  country: string
  platform: string
  warehouse: string
  inventory: number
  occupied: number
  available: number
  snapshotAt: string
  dataVersion: string
}

function makeInventory(prefix: string): InventoryRow[] {
  return Array.from({ length: 18 }).map((_, i) => {
    const inv = 500 + ((i * 133) % 2000)
    const occ = (i * 37) % 400
    return {
      id: `${prefix}-${i}`,
      sku: `SKU${100000 + i}`,
      spu: `SPU${9000 + (i % 10)}`,
      country: pick(countries, i),
      platform: pick(platforms, i + 1),
      warehouse: pick(warehouses, i),
      inventory: inv,
      occupied: occ,
      available: inv - occ,
      snapshotAt: `2026-06-20 06:00`,
      dataVersion: `SNP-2026W24-v${3 - (i % 3)}`,
    }
  })
}

export const beginInventoryRows = makeInventory('BI')
export const platformInventoryRows = makeInventory('PI')

export interface OrderOccupyRow {
  id: string
  sku: string
  country: string
  platform: string
  orderNo: string
  occupyQty: number
  orderTime: string
  status: string
}

export const orderOccupyRows: OrderOccupyRow[] = Array.from({ length: 16 }).map((_, i) => ({
  id: `OO-${i}`,
  sku: `SKU${100000 + i}`,
  country: pick(countries, i),
  platform: pick(platforms, i + 1),
  orderNo: `ORD-${20260600 + i}`,
  occupyQty: 10 + ((i * 13) % 120),
  orderTime: `2026-06-${String(19 - (i % 12)).padStart(2, '0')} 14:0${i % 6}`,
  status: pick(['已支付', '待发货', '部分发货'], i),
}))

export interface ReturnRow {
  id: string
  sku: string
  country: string
  platform: string
  warehouse: string
  returnQty: number
  usableQty: number
  expectAt: string
}

export const returnRows: ReturnRow[] = Array.from({ length: 14 }).map((_, i) => {
  const ret = 5 + ((i * 17) % 80)
  return {
    id: `RT-${i}`,
    sku: `SKU${100000 + i}`,
    country: pick(countries, i),
    platform: pick(platforms, i + 1),
    warehouse: pick(warehouses, i),
    returnQty: ret,
    usableQty: Math.round(ret * 0.7),
    expectAt: `2026-06-${String(25 + (i % 4)).padStart(2, '0')}`,
  }
})
