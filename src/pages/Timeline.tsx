import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { cn, formatDate, todayIso } from '@/lib/utils'

const MONTH = new Intl.DateTimeFormat('he-IL', { month: 'short', year: '2-digit' })
const time = (iso: string) => new Date(iso.slice(0, 10)).getTime()

// ציר זמן: כל פרויקט הוא פס מיום הפתיחה עד תאריך היעד, והנקודות הן יעדי המשימות
export function Timeline() {
  const { projects, tasks, clients } = useStore()
  const dated = projects.filter((p) => p.deadline).sort((a, b) => a.deadline!.localeCompare(b.deadline!))
  const undated = projects.filter((p) => !p.deadline)

  if (dated.length === 0) return <p className="text-muted-foreground">אין עדיין פרויקטים עם תאריך יעד. הוסיפו תאריך יעד לפרויקט כדי לראות אותו על הציר.</p>

  const start = Math.min(...dated.map((p) => time(p.created_at)), time(todayIso()))
  const end = Math.max(...dated.map((p) => time(p.deadline!)), time(todayIso()))
  const span = Math.max(1, end - start)
  // בציר מימין לשמאל, ההתחלה בצד ימין
  const position = (iso: string) => `${((time(iso) - start) / span) * 100}%`

  const months: string[] = []
  const cursor = new Date(start)
  cursor.setDate(1)
  while (cursor.getTime() <= end) {
    months.push(cursor.toISOString())
    cursor.setMonth(cursor.getMonth() + (span > 400 * 864e5 ? 3 : 1))
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl bg-card p-4 ring-1 ring-border">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4">
            <span />
            <div className="relative h-6 text-xs text-muted-foreground">
              {months.map((iso) => time(iso) >= start && (
                <span key={iso} className="absolute translate-x-1/2 whitespace-nowrap" style={{ right: position(iso) }}>{MONTH.format(new Date(iso))}</span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {dated.map((project) => {
              const from = position(project.created_at)
              const width = `${((time(project.deadline!) - time(project.created_at)) / span) * 100}%`
              const late = project.status !== 'done' && project.deadline! < todayIso()
              return (
                <div key={project.id} className="grid grid-cols-[180px_minmax(0,1fr)] items-center gap-4">
                  <Link to={`/projects/${project.id}`} className="min-w-0 text-sm hover:text-primary">
                    <p className="truncate font-medium">{project.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{clients.find((c) => c.id === project.client_id)?.name ?? 'ללא לקוח'}</p>
                  </Link>
                  <div className="relative h-8 rounded-md bg-muted/40">
                    <Link
                      to={`/projects/${project.id}`}
                      title={`${project.name}: עד ${formatDate(project.deadline)}`}
                      className={cn('absolute top-1.5 h-5 rounded-md transition hover:brightness-125', project.status === 'done' ? 'bg-muted-foreground/60' : late ? 'bg-destructive' : project.status === 'active' ? 'bg-primary' : 'bg-secondary')}
                      style={{ right: from, width }}
                    />
                    {tasks.filter((t) => t.project_id === project.id && t.due_date && t.stage !== 'done').map((task) => (
                      <Link
                        key={task.id}
                        to={`/tasks?open=${task.id}`}
                        title={`${task.title}: ${formatDate(task.due_date)}`}
                        aria-label={`משימה: ${task.title}`}
                        className={cn('absolute top-2.5 size-3 translate-x-1/2 rounded-full ring-2 ring-card', task.due_date! < todayIso() ? 'bg-destructive' : 'bg-foreground')}
                        style={{ right: position(task.due_date!) }}
                      />
                    ))}
                    <span className="pointer-events-none absolute inset-y-0 w-px bg-foreground/70" style={{ right: position(todayIso()) }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {[
          ['bg-primary', 'פרויקט פעיל'],
          ['bg-secondary', 'בתכנון'],
          ['bg-muted-foreground/60', 'הושלם'],
          ['bg-destructive', 'עבר את תאריך היעד'],
        ].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1.5"><span className={cn('h-2.5 w-5 rounded-sm', color)} /> {label}</span>
        ))}
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-foreground" /> יעד של משימה פתוחה</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-px bg-foreground/70" /> היום</span>
      </div>

      {undated.length > 0 && <p className="text-sm text-muted-foreground">בלי תאריך יעד, ולכן לא על הציר: {undated.map((p) => p.name).join(', ')}</p>}
    </div>
  )
}
