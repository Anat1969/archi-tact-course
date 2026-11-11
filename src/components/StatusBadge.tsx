import { cn } from '@/lib/utils'
import { PROJECT_STATUS_LABEL, type ProjectStatus } from '@/types'

const STYLE: Record<ProjectStatus, string> = {
  active: 'bg-emerald-950 text-emerald-400',
  planning: 'bg-secondary text-secondary-foreground',
  done: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', STYLE[status])}>{PROJECT_STATUS_LABEL[status]}</span>
}
