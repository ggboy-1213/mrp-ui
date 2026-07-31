export type Tone = 'muted' | 'primary' | 'mrp' | 'warning' | 'success' | 'danger' | 'info'

export const toneClass: Record<Tone, string> = {
  muted: 'bg-muted text-muted-foreground border-transparent',
  primary: 'bg-primary/10 text-primary border-primary/25',
  mrp: 'bg-mrp/10 text-mrp border-mrp/30',
  warning: 'bg-warning/15 text-[oklch(0.5_0.13_60)] border-warning/40',
  success: 'bg-success/12 text-success border-success/30',
  danger: 'bg-destructive/10 text-destructive border-destructive/30',
  info: 'bg-primary/8 text-primary border-primary/20',
}

export const toneDot: Record<Tone, string> = {
  muted: 'bg-muted-foreground',
  primary: 'bg-primary',
  mrp: 'bg-mrp',
  warning: 'bg-warning',
  success: 'bg-success',
  danger: 'bg-destructive',
  info: 'bg-primary',
}

export const toneText: Record<Tone, string> = {
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  mrp: 'text-mrp',
  warning: 'text-[oklch(0.5_0.13_60)]',
  success: 'text-success',
  danger: 'text-destructive',
  info: 'text-primary',
}

export const toneSoftBg: Record<Tone, string> = {
  muted: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  mrp: 'bg-mrp/10 text-mrp',
  warning: 'bg-warning/15 text-[oklch(0.5_0.13_60)]',
  success: 'bg-success/12 text-success',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-primary/8 text-primary',
}
