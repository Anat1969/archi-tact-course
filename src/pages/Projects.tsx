import { MapPin, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProjectForm } from '@/components/ProjectForm'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { cn, formatDate, formatShekel } from '@/lib/utils'
import { PROJECT_STATUSES, PROJECT_STATUS_LABEL, type ProjectStatus } from '@/types'

export function Projects() {
  const { projects, clients, tasks } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)

  const clientName = (id: string | null) => clients.find((c) => c.id === id)?.name ?? 'ללא לקוח'
  const term = query.trim()
  const visible = projects.filter(
    (p) =>
      (filter === 'all' || p.status === filter) &&
      (!term || p.name.includes(term) || clientName(p.client_id).includes(term) || (p.address ?? '').includes(term)),
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש פרויקט, לקוח או כתובת" aria-label="חיפוש פרויקטים" className="pr-9" />
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
          {(['all', ...PROJECT_STATUSES] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn('rounded-md px-3 py-1 transition-colors', filter === value ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              {value === 'all' ? 'הכול' : PROJECT_STATUS_LABEL[value]}
            </button>
          ))}
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus aria-hidden /> פרויקט חדש
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">מוצגים {visible.length} מתוך {projects.length} פרויקטים</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((project) => {
          const open = tasks.filter((t) => t.project_id === project.id && t.stage !== 'done').length
          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group rounded-xl bg-card p-4 ring-1 ring-border transition hover:ring-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-snug group-hover:text-primary">{project.name}</h3>
                <StatusBadge status={project.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{clientName(project.client_id)}</p>
              {project.address && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" aria-hidden /> {project.address}
                </p>
              )}
              <div className="mt-4 flex items-end justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">תקציב</p>
                  <p className="text-lg font-bold tabular-nums">{formatShekel(Number(project.budget))}</p>
                </div>
                <div className="text-left">
                  <p className="text-muted-foreground">{open} משימות פתוחות</p>
                  <p className="font-medium">{formatDate(project.deadline)}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {visible.length === 0 && <p className="py-10 text-center text-muted-foreground">לא נמצאו פרויקטים שמתאימים לחיפוש.</p>}
      {formOpen && <ProjectForm projectId={null} onClose={(id) => { setFormOpen(false); if (id) navigate(`/projects/${id}`) }} />}
    </div>
  )
}
