import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { cn, daysUntil, dueLabel, formatDate, formatShekel } from '@/lib/utils'

export function Dashboard() {
  const { projects, clients, tasks } = useStore()

  const open = projects.filter((p) => p.status !== 'done')
  const openTasks = tasks.filter((t) => t.stage !== 'done')
  const stats = [
    { label: 'פרויקטים פעילים', value: String(projects.filter((p) => p.status === 'active').length), to: '/projects' },
    { label: 'לקוחות', value: String(clients.length), to: '/clients' },
    { label: 'משימות פתוחות', value: String(openTasks.length), to: '/tasks' },
    { label: 'הכנסה צפויה', value: formatShekel(open.reduce((sum, p) => sum + Number(p.budget), 0)), to: '/timeline', highlight: true },
  ]

  const byBudget = [...projects].sort((a, b) => Number(b.budget) - Number(a.budget))
  const maxBudget = Math.max(1, ...byBudget.map((p) => Number(p.budget)))
  // דורש טיפול: משימות פתוחות שהיעד שלהן עבר, או שיגיע בתוך שבוע
  const urgent = openTasks
    .filter((t) => t.due_date && daysUntil(t.due_date) <= 7)
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
    .slice(0, 6)
  const projectName = (id: string | null) => projects.find((p) => p.id === id)?.name ?? 'ללא פרויקט'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="rounded-xl bg-card p-4 ring-1 ring-border transition hover:-translate-y-0.5 hover:ring-primary">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn('mt-2 text-2xl font-bold sm:text-3xl', stat.highlight && 'text-primary')}>{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-border lg:col-span-2">
          <h2 className="font-semibold">תקציב לפי פרויקט</h2>
          {byBudget.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 text-sm">
              <span className="truncate group-hover:text-primary">{project.name}</span>
              <span className="font-medium tabular-nums">{formatShekel(Number(project.budget))}</span>
              <div className="col-span-2 h-2 rounded-full bg-muted">
                <div className={cn('h-2 rounded-full', project.status === 'done' ? 'bg-muted-foreground' : 'bg-primary')} style={{ width: `${(Number(project.budget) / maxBudget) * 100}%` }} />
              </div>
            </Link>
          ))}
          <p className="pt-1 text-xs text-muted-foreground">כחול: פרויקט פתוח. אפור: פרויקט שהושלם.</p>
        </section>

        <section className="space-y-2 rounded-xl bg-card p-4 ring-1 ring-border">
          <h2 className="font-semibold">דורש טיפול השבוע</h2>
          {urgent.map((task) => {
            const due = dueLabel(task.due_date)!
            return (
              <Link key={task.id} to={`/tasks?open=${task.id}`} className="block rounded-lg bg-muted/40 p-2.5 text-sm hover:bg-accent">
                <p className="font-medium">{task.title}</p>
                <p className="flex justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{projectName(task.project_id)}</span>
                  <span className={cn('shrink-0', due.late && 'font-semibold text-destructive')}>{due.text}</span>
                </p>
              </Link>
            )
          })}
          {urgent.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">אין משימות דחופות השבוע</p>}
          <p className="pt-1 text-xs text-muted-foreground">היעד הקרוב של פרויקט: {open.filter((p) => p.deadline).sort((a, b) => a.deadline!.localeCompare(b.deadline!)).map((p) => `${p.name}, ${formatDate(p.deadline)}`)[0] ?? 'אין'}</p>
        </section>
      </div>
    </div>
  )
}
