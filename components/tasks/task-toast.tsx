'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, Info, X } from 'lucide-react'

export interface ToastState {
  id: number
  message: string
  tone: 'success' | 'info'
}

export function TaskToast({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 2600)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  const Icon = toast.tone === 'success' ? CheckCircle2 : Info
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div
        className={cn(
          'pointer-events-auto flex items-center gap-2 rounded-lg border bg-popover px-4 py-2.5 text-sm shadow-lg ring-1 ring-foreground/10',
          'animate-in fade-in-0 slide-in-from-bottom-2',
        )}
      >
        <Icon className={cn('size-4', toast.tone === 'success' ? 'text-success' : 'text-primary')} />
        <span className="text-foreground">{toast.message}</span>
        <button onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground">
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
