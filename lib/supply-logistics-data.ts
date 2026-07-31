import type { Tone } from "@/lib/tone"

export type PoStatus = "待审核" | "已下单" | "生产中" | "已发货" | "已入库" | "已取消"
export type ShipStatus = "在途" | "清关中" | "到港" | "派送中" | "已签收" | "异常"

export const PO_STATUS_TONE: Record<PoStatus, Tone> = {
  待审核: "warning",
  已下单: "info",
  生产中: "info",
  已发货: "primary",
  已入库: "success",
  已取消: "neutral",
}

export const SHIP_STATUS_TONE: Record<ShipStatus, Tone> = {
  在途: "info",
  清关中: "warning",
  到港: "primary",
  派送中: "primary",
  已签收: "success",
  异常: "danger",
}

export interface PurchaseOrder {
  id: string
  sku: string
  name: string
  supplier: string
  qty: number
  unitCost: number
  currency: string
  warehouse: string
  status: PoStatus
  createdAt: string
  expectedArrival: string
  leadTimeDays: number
  onTimeRate: number
  owner: string
}

export interface Shipment {
  id: string
  poId: string
  sku: string
  carrier: string
  mode: "海运" | "空运" | "快递" | "铁路"
  qty: number
  origin: string
  destination: string
  status: ShipStatus
  etd: string
  eta: string
  delayDays: number
  trackingNo: string
}

export interface SupplierPerf {
  id: string
  supplier: string
  category: string
  activePo: number
  onTimeRate: number
  qualityRate: number
  avgLeadTime: number
  rating: "A" | "B" | "C"
}

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: "PO-2026-08841", sku: "SKU-100231", name: "无线降噪耳机 Pro", supplier: "深圳声学科技", qty: 3200, unitCost: 128, currency: "CNY", warehouse: "US-东部仓", status: "生产中", createdAt: "2026-07-12", expectedArrival: "2026-08-18", leadTimeDays: 37, onTimeRate: 94, owner: "王敏" },
  { id: "PO-2026-08840", sku: "SKU-100455", name: "便携蓝牙音箱", supplier: "东莞智声", qty: 5000, unitCost: 86, currency: "CNY", warehouse: "US-西部仓", status: "已发货", createdAt: "2026-07-05", expectedArrival: "2026-08-09", leadTimeDays: 35, onTimeRate: 88, owner: "王敏" },
  { id: "PO-2026-08838", sku: "SKU-100892", name: "机械键盘 87 键", supplier: "苏州键值", qty: 2400, unitCost: 152, currency: "CNY", warehouse: "US-东部仓", status: "已下单", createdAt: "2026-07-20", expectedArrival: "2026-08-28", leadTimeDays: 39, onTimeRate: 91, owner: "李强" },
  { id: "PO-2026-08835", sku: "SKU-101120", name: "USB-C 充电器 65W", supplier: "深圳快充", qty: 8000, unitCost: 42, currency: "CNY", warehouse: "EU-德国仓", status: "待审核", createdAt: "2026-07-22", expectedArrival: "2026-09-02", leadTimeDays: 42, onTimeRate: 79, owner: "李强" },
  { id: "PO-2026-08829", sku: "SKU-100231", name: "无线降噪耳机 Pro", supplier: "深圳声学科技", qty: 1800, unitCost: 128, currency: "CNY", warehouse: "US-东部仓", status: "已入库", createdAt: "2026-06-18", expectedArrival: "2026-07-24", leadTimeDays: 36, onTimeRate: 94, owner: "王敏" },
  { id: "PO-2026-08822", sku: "SKU-101340", name: "智能手表 S7", supplier: "杭州智联", qty: 1500, unitCost: 268, currency: "CNY", warehouse: "US-西部仓", status: "生产中", createdAt: "2026-07-15", expectedArrival: "2026-08-30", leadTimeDays: 46, onTimeRate: 83, owner: "陈婷" },
  { id: "PO-2026-08810", sku: "SKU-100455", name: "便携蓝牙音箱", supplier: "东莞智声", qty: 3600, unitCost: 86, currency: "CNY", warehouse: "EU-德国仓", status: "已发货", createdAt: "2026-07-02", expectedArrival: "2026-08-14", leadTimeDays: 43, onTimeRate: 88, owner: "陈婷" },
  { id: "PO-2026-08805", sku: "SKU-101560", name: "游戏鼠标 X2", supplier: "苏州键值", qty: 4200, unitCost: 74, currency: "CNY", warehouse: "US-东部仓", status: "已取消", createdAt: "2026-06-28", expectedArrival: "2026-08-05", leadTimeDays: 38, onTimeRate: 91, owner: "李强" },
]

export const SHIPMENTS: Shipment[] = [
  { id: "SHP-55021", poId: "PO-2026-08840", sku: "SKU-100455", carrier: "Maersk 马士基", mode: "海运", qty: 5000, origin: "深圳盐田港", destination: "美国长滩港", status: "在途", etd: "2026-07-28", eta: "2026-08-19", delayDays: 0, trackingNo: "MSKU7788231" },
  { id: "SHP-55018", poId: "PO-2026-08810", sku: "SKU-100455", carrier: "DHL", mode: "空运", qty: 3600, origin: "深圳宝安机场", destination: "德国法兰克福", status: "清关中", etd: "2026-08-01", eta: "2026-08-11", delayDays: 2, trackingNo: "DHL4432189" },
  { id: "SHP-55009", poId: "PO-2026-08829", sku: "SKU-100231", carrier: "COSCO 中远", mode: "海运", qty: 1800, origin: "深圳盐田港", destination: "美国纽约港", status: "已签收", etd: "2026-06-22", eta: "2026-07-23", delayDays: -1, trackingNo: "COSU9981234" },
  { id: "SHP-55033", poId: "PO-2026-08822", sku: "SKU-101340", carrier: "FedEx", mode: "空运", qty: 1500, origin: "杭州萧山机场", destination: "美国洛杉矶", status: "异常", etd: "2026-08-03", eta: "2026-08-12", delayDays: 5, trackingNo: "FDX2213908" },
  { id: "SHP-55040", poId: "PO-2026-08838", sku: "SKU-100892", carrier: "中欧班列", mode: "铁路", qty: 2400, origin: "苏州", destination: "德国杜伊斯堡", status: "在途", etd: "2026-07-30", eta: "2026-08-25", delayDays: 0, trackingNo: "CRE-889201" },
  { id: "SHP-55048", poId: "PO-2026-08840", sku: "SKU-100455", carrier: "UPS", mode: "快递", qty: 800, origin: "美国长滩港", destination: "US-西部仓", status: "派送中", etd: "2026-08-06", eta: "2026-08-08", delayDays: 0, trackingNo: "UPS1Z8890" },
]

export const SUPPLIER_PERF: SupplierPerf[] = [
  { id: "SUP-01", supplier: "深圳声学科技", category: "音频", activePo: 4, onTimeRate: 94, qualityRate: 98.5, avgLeadTime: 36, rating: "A" },
  { id: "SUP-02", supplier: "东莞智声", category: "音频", activePo: 6, onTimeRate: 88, qualityRate: 96.2, avgLeadTime: 39, rating: "B" },
  { id: "SUP-03", supplier: "苏州键值", category: "外设", activePo: 3, onTimeRate: 91, qualityRate: 97.8, avgLeadTime: 38, rating: "A" },
  { id: "SUP-04", supplier: "深圳快充", category: "配件", activePo: 5, onTimeRate: 79, qualityRate: 94.1, avgLeadTime: 42, rating: "C" },
  { id: "SUP-05", supplier: "杭州智联", category: "穿戴", activePo: 2, onTimeRate: 83, qualityRate: 95.6, avgLeadTime: 46, rating: "B" },
]
