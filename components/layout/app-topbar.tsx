'use client'

import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, Play, RefreshCw, Search } from 'lucide-react'
import { findNavItem } from '@/lib/nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const titleMap: Record<string, string> = {
  '/': 'MRP 工作台',
}

export function AppTopbar() {
  const pathname = usePathname()
  const current = findNavItem(pathname)
  const title = titleMap[pathname] ?? current?.title ?? '库存计划 MRP'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card/95 px-6 backdrop-blur">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
        <p className="truncate text-xs text-muted-foreground">
          周度滚动 · 未来 21 周 · 计算批次 BATCH-20260731-01
        </p>
      </div>

      <div className="relative ml-auto hidden w-64 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input placeholder="搜索 SKU / SPU / 计划批次" className="h-9 pl-9" />
      </div>

      <Button variant="outline" size="sm" className="hidden gap-2 lg:inline-flex">
        <RefreshCw className="size-4" aria-hidden />
        复算
      </Button>
      <Button size="sm" className="gap-2">
        <Play className="size-4" aria-hidden />
        发起计算
      </Button>

      <Button variant="ghost" size="icon" className="relative" aria-label="预警通知">
        <Bell className="size-5" aria-hidden />
        <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full bg-destructive px-1 text-[10px] text-white">
          7
        </Badge>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-accent">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">李航</AvatarFallback>
          </Avatar>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-medium text-foreground">李航</span>
            <span className="block text-xs text-muted-foreground">计划主管</span>
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>账户</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>个人资料</DropdownMenuItem>
          <DropdownMenuItem>偏好设置</DropdownMenuItem>
          <DropdownMenuItem>退出登录</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
