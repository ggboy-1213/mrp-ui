'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  PageHeader,
  FilterBar,
  FilterField,
  FilterInput,
  SectionCard,
  ToneBadge,
} from '@/components/shared/page-kit'
import { DataTable, DataTableToolbar, type Column } from '@/components/shared/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  USERS,
  ROLES,
  USER_STATUS_TONE,
  type UserRow,
  type RoleRow,
} from '@/lib/admin-data'
import { UserPlus, ShieldPlus, Pencil, KeyRound } from 'lucide-react'

const userColumns: Column<UserRow>[] = [
  {
    key: 'name',
    header: '用户',
    sticky: 'left',
    width: '180px',
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-xs text-primary">{r.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium leading-tight">{r.name}</p>
          <p className="text-xs text-muted-foreground">@{r.account}</p>
        </div>
      </div>
    ),
  },
  { key: 'role', header: '角色', render: (r) => <ToneBadge tone="info">{r.role}</ToneBadge> },
  { key: 'dept', header: '部门', render: (r) => r.dept },
  { key: 'scope', header: '数据权限', render: (r) => <span className="text-muted-foreground">{r.scope}</span> },
  { key: 'status', header: '状态', render: (r) => <ToneBadge tone={USER_STATUS_TONE[r.status]}>{r.status}</ToneBadge> },
  { key: 'lastLogin', header: '最近登录', render: (r) => <span className="text-xs text-muted-foreground">{r.lastLogin}</span> },
  {
    key: 'ops',
    header: '操作',
    align: 'right',
    render: () => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs"><Pencil className="size-3.5" />编辑</Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs"><KeyRound className="size-3.5" />重置密码</Button>
      </div>
    ),
  },
]

const roleColumns: Column<RoleRow>[] = [
  { key: 'name', header: '角色名称', sticky: 'left', width: '150px', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'desc', header: '描述', render: (r) => <span className="text-muted-foreground">{r.desc}</span> },
  { key: 'users', header: '用户数', align: 'right', sortable: true, sortValue: (r) => r.users, render: (r) => r.users },
  { key: 'permissions', header: '权限项', align: 'right', sortable: true, sortValue: (r) => r.permissions, render: (r) => r.permissions },
  { key: 'builtin', header: '类型', render: (r) => <ToneBadge tone={r.builtin ? 'neutral' : 'primary'}>{r.builtin ? '内置' : '自定义'}</ToneBadge> },
  {
    key: 'ops',
    header: '操作',
    align: 'right',
    render: (r) => (
      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" disabled={r.builtin}>
        <Pencil className="size-3.5" />配置权限
      </Button>
    ),
  },
]

export default function UsersPage() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  return (
    <div className="space-y-4">
      <PageHeader
        title="用户与权限"
        subtitle="管理计划、采购、物流、仓储等角色的账户与数据权限，支持数据 Owner 指派与权限变更审计。"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><ShieldPlus className="size-4" />新建角色</Button>
            <Button size="sm" className="gap-1.5"><UserPlus className="size-4" />新增用户</Button>
          </>
        }
      />

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">用户账户</TabsTrigger>
          <TabsTrigger value="roles">角色权限</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 space-y-4">
          <FilterBar>
            <FilterField label="角色">
              <Select defaultValue="all">
                <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部角色' : v)}</SelectValue></SelectTrigger>
                <SelectContent><SelectItem value="all">全部角色</SelectItem>{['计划主管', '采购计划员', '库存计划员', '数据管理员', '只读分析'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </FilterField>
            <FilterField label="状态">
              <Select defaultValue="all">
                <SelectTrigger className="h-9"><SelectValue>{(v: string) => (v === 'all' ? '全部状态' : v)}</SelectValue></SelectTrigger>
                <SelectContent><SelectItem value="all">全部状态</SelectItem>{['启用', '停用', '待激活'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </FilterField>
            <FilterInput label="姓名 / 账号" />
            <FilterInput label="部门" />
          </FilterBar>
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={USERS.length} density={density} onDensity={setDensity} />
            <DataTable columns={userColumns} rows={USERS} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <SectionCard bodyClassName="p-0">
            <DataTableToolbar count={ROLES.length} density={density} onDensity={setDensity} />
            <DataTable columns={roleColumns} rows={ROLES} density={density} maxHeight="34rem" />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
