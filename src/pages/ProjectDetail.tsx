import { ArrowRight, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ContactActions } from '@/components/ContactActions'
import { ProjectForm } from '@/components/ProjectForm'
import { StatusBadge } from '@/components/StatusBadge'
import { TaskDialog } from '@/components/TaskDialog'
import { Button } from '@/components/ui/button'
import { mapsLink } from '@/lib/messages'
import { useStore } from '@/lib/store'
import { cn, dueLabel, formatDate, formatShekel } from '@/lib/utils'
import { PROJECT_STATUSES, PROJECT_STATUS_LABEL, TASK_STAGE_LABEL } from '@/types'

export function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, clients, tasks, saveProject, removeProject } = useStore()
  const [editing, setEditing] = useState(false)
  const [taskOpen, setTaskOpen] = useState<string | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const project = projects.find((p) => p.id === id)
  if (!project) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">הפרויקט לא נמצא. ייתכן שהוא נמחק.</p>
        <Link to="/projects" className="text-primary hover:underline">חזרה לרשימת הפרויקטים</Link>
      </div>
    )
  }

  const client = clients.find((c) => c.id === project.client_id)
  const projectTasks = tasks.filter((t) => t.project_id === project.id)
  const done = projectTasks.filter((t) => t.stage === 'done').length
  const progress = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0
  const deadline = dueLabel(project.deadline)

  async function setStatus(status: (typeof PROJECT_STATUSES)[number]) {
    try {
      const { id: _id, created_at: _created, ...input } = project!
      await saveProject({ ...input, status }, project!.id)
    } catch (err) {
      setError(`העדכון נכשל: ${(err as Error).message}`)
    }
  }

  async function remove() {
    if (!window.confirm(`למחוק את הפרויקט "${project!.name}" ואת ${projectTasks.length} המשימות שלו?`)) return
    try {
      await removeProject(project!.id)
      navigate('/projects')
    } catch (err) {
      setError(`המחיקה נכשלה: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-5">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="size-4" aria-hidden /> כל הפרויקטים
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <StatusBadge status={project.status} />
          </div>
          {project.address && (
            <a href={mapsLink(project.address)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <MapPin className="size-4" aria-hidden /> {project.address}
            </a>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}><Pencil aria-hidden /> עריכה</Button>
          <Button variant="ghost" className="text-destructive" onClick={remove}><Trash2 aria-hidden /> מחיקה</Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">תקציב</p>
              <p className="text-xl font-bold tabular-nums">{formatShekel(Number(project.budget))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">תאריך יעד</p>
              <p className="font-semibold">{formatDate(project.deadline)}</p>
              {deadline && project.status !== 'done' && <p className={cn('text-xs', deadline.late ? 'text-destructive' : 'text-muted-foreground')}>{deadline.text}</p>}
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">התקדמות</span>
              <span className="tabular-nums">{done} מתוך {projectTasks.length} משימות</span>
            </div>
            <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
          <div>
            <p className="mb-1.5 text-sm text-muted-foreground">שינוי סטטוס</p>
            <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
              {PROJECT_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatus(status)}
                  className={cn('flex-1 rounded-md px-2 py-1 transition-colors', project.status === status ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
                >
                  {PROJECT_STATUS_LABEL[status]}
                </button>
              ))}
            </div>
          </div>
          {project.notes && <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">{project.notes}</p>}
        </section>

        <section className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-border">
          <h3 className="font-semibold">לקוח</h3>
          {client ? (
            <>
              <Link to={`/clients/${client.id}`} className="block text-lg font-bold hover:text-primary">{client.name}</Link>
              <p className="text-sm text-muted-foreground"><span dir="ltr">{client.phone ?? ''}</span> {client.email && <span dir="ltr">· {client.email}</span>}</p>
              <ContactActions client={client} subject={project.name} text={`שלום ${client.name},\nבנושא הפרויקט "${project.name}": `} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">לפרויקט לא משויך לקוח. אפשר לשייך בעריכה.</p>
          )}
        </section>

        <section className="space-y-2 rounded-xl bg-card p-4 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">משימות</h3>
            <Button size="sm" variant="secondary" onClick={() => setTaskOpen(null)}><Plus aria-hidden /> משימה</Button>
          </div>
          {projectTasks.map((task) => {
            const due = dueLabel(task.due_date)
            return (
              <button key={task.id} onClick={() => setTaskOpen(task.id)} className="flex w-full items-center justify-between gap-3 rounded-lg bg-muted/40 p-2.5 text-right text-sm hover:bg-accent">
                <span className={cn('min-w-0 truncate font-medium', task.stage === 'done' && 'text-muted-foreground line-through')}>{task.title}</span>
                <span className={cn('shrink-0 text-xs', due?.late && task.stage !== 'done' ? 'text-destructive' : 'text-muted-foreground')}>
                  {TASK_STAGE_LABEL[task.stage]}{due && task.stage !== 'done' ? ` · ${due.text}` : ''}
                </span>
              </button>
            )
          })}
          {projectTasks.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">עדיין אין משימות בפרויקט</p>}
        </section>
      </div>

      {editing && <ProjectForm projectId={project.id} onClose={() => setEditing(false)} />}
      {taskOpen !== undefined && <TaskDialog taskId={taskOpen} defaultProjectId={project.id} onClose={() => setTaskOpen(undefined)} />}
    </div>
  )
}
