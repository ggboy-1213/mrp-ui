import type { Tone } from "@/lib/tone"

export interface SkuMaster {
  id: string
  sku: string
  spu: string
  name: string
  category: string
  productLine: string
  brand: string
  status: "启用" | "停用" | "待审核"
  unit: string
  updatedAt: string
}

export interface WarehouseMaster {
  id: string
  code: string
  name: string
  country: string
  region: string
  type: "自营仓" | "FBA" | "海外仓" | "保税仓"
  capacity: number
  usage: number
  status: "启用" | "停用"
}

export interface MappingRow {
  id: string
  channelSku: string
  internalSku: string
  platform: string
  country: string
  matchType: "自动" | "手工"
  status: "已映射" | "待确认" | "冲突"
  updatedAt: string
}

export const SKU_STATUS_TONE: Record<SkuMaster["status"], Tone> = {
  启用: "success",
  停用: "neutral",
  待审核: "warning",
}

export const MAPPING_STATUS_TONE: Record<MappingRow["status"], Tone> = {
  已映射: "success",
  待确认: "warning",
  冲突: "danger",
}

const categories = ["音频", "外设", "配件", "穿戴", "智能家居"]
const lines = ["旗舰线", "性价比线", "入门线"]
const brands = ["Aurora", "Nimbus", "Vertex"]

export const SKU_MASTER: SkuMaster[] = Array.from({ length: 16 }).map((_, i) => ({
  id: `SM-${i}`,
  sku: `SKU-1002${(31 + i).toString().padStart(2, "0")}`,
  spu: `SPU-90${(10 + i).toString().padStart(2, "0")}`,
  name: ["无线降噪耳机 Pro", "便携蓝牙音箱", "机械键盘 87 键", "USB-C 充电器 65W", "智能手表 S7", "游戏鼠标 X2"][i % 6],
  category: categories[i % categories.length],
  productLine: lines[i % lines.length],
  brand: brands[i % brands.length],
  status: i % 7 === 0 ? "待审核" : i % 11 === 0 ? "停用" : "启用",
  unit: "个",
  updatedAt: `2026-07-${(10 + (i % 18)).toString().padStart(2, "0")} 09:${(10 + i).toString().padStart(2, "0")}`,
}))

export const WAREHOUSE_MASTER: WarehouseMaster[] = [
  { id: "WH-01", code: "US-EAST-01", name: "美东自营仓", country: "美国", region: "新泽西", type: "自营仓", capacity: 120000, usage: 82, status: "启用" },
  { id: "WH-02", code: "US-WEST-01", name: "美西自营仓", country: "美国", region: "洛杉矶", type: "自营仓", capacity: 98000, usage: 76, status: "启用" },
  { id: "WH-03", code: "US-FBA-AMZ", name: "Amazon FBA (US)", country: "美国", region: "多地", type: "FBA", capacity: 60000, usage: 91, status: "启用" },
  { id: "WH-04", code: "EU-DE-01", name: "德国海外仓", country: "德国", region: "法兰克福", type: "海外仓", capacity: 74000, usage: 68, status: "启用" },
  { id: "WH-05", code: "EU-UK-01", name: "英国保税仓", country: "英国", region: "曼彻斯特", type: "保税仓", capacity: 42000, usage: 54, status: "启用" },
  { id: "WH-06", code: "JP-FBA-01", name: "Amazon FBA (JP)", country: "日本", region: "东京", type: "FBA", capacity: 38000, usage: 88, status: "启用" },
  { id: "WH-07", code: "US-EAST-02", name: "美东二仓 (筹建)", country: "美国", region: "亚特兰大", type: "自营仓", capacity: 50000, usage: 0, status: "停用" },
]

const platforms = ["Amazon", "Temu", "TikTok", "eBay"]
const countries = ["美国", "德国", "英国", "日本"]

export const MAPPING_ROWS: MappingRow[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `MP-${i}`,
  channelSku: `CH-${platforms[i % 4].slice(0, 3).toUpperCase()}-${8800 + i}`,
  internalSku: `SKU-1002${(31 + (i % 12)).toString().padStart(2, "0")}`,
  platform: platforms[i % 4],
  country: countries[i % 4],
  matchType: i % 3 === 0 ? "手工" : "自动",
  status: i % 9 === 0 ? "冲突" : i % 5 === 0 ? "待确认" : "已映射",
  updatedAt: `2026-07-${(12 + (i % 16)).toString().padStart(2, "0")} 14:${(10 + i).toString().padStart(2, "0")}`,
}))

export const MASTER_STATS = [
  { key: "sku", label: "SKU 主数据", value: 1284, tone: "primary" as Tone },
  { key: "active", label: "启用 SKU", value: 1198, tone: "success" as Tone },
  { key: "pending", label: "待审核", value: 42, tone: "warning" as Tone },
  { key: "conflict", label: "映射冲突", value: 6, tone: "danger" as Tone },
]
