import { ArrowLeft, Mail, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TaskDialog } from '@/components/TaskDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { cn, dueLabel } from '@/lib/utils'
import { TASK_STAGES, TASK_STAGE_LABEL, type TaskStage } from '@/types'

const NEXT: Record<TaskStage, TaskStage | null> = { todo: 'doing', doing: 'done', done: null }

export function Tasks() {
  const { tasks, projects, saveTask } = useStore()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // החלון נפתח לפי הכתובת, כדי שאפשר יהיה להגיע למשימה גם מהדשבורד ומציר הזמן
  const openId = params.get('open')
  const creating = params.get('new') === '1'
  const close = () => setParams({}, { replace: true })

  const projectName = (id: string | null) => projects.find((p) => p.id === id)?.name ?? 'ללא פרויקט'
  const term = query.trim()
  const visible = tasks.filter((t) => !term || t.title.includes(term) || projectName(t.project_id).includes(term))

  async function advance(id: string, stage: TaskStage) {
    try {
      await saveTask({ stage }, id)
      setError(null)
    } catch (err) {
      setError(`העדכון נכשל: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש משימה או פרויקט" aria-label="חיפוש משימות" className="pr-9" />
        </div>
        <Button onClick={() => setParams({ new: '1' })}>
          <Plus aria-hidden /> משימה חדשה
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {TASK_STAGES.map((stage) => {
          const items = visible.filter((t) => t.stage === stage)
          const next = NEXT[stage]
          return (
            <section key={stage} className="rounded-xl bg-card/60 p-3">
              <header className="flex items-center justify-between px-2 pb-3">
                <h2 className="font-semibold">{TASK_STAGE_LABEL[stage]}</h2>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs tabular-nums">{items.length}</span>
              </header>
              <div className="space-y-2">
                {items.map((task) => {
                  const due = dueLabel(task.due_date)
                  return (
                    <article key={task.id} className="flex items-center gap-2 rounded-lg bg-card p-3 ring-1 ring-border transition hover:ring-primary">
                      <button onClick={() => setParams({ open: task.id })} className="min-w-0 flex-1 text-right" aria-label={`פתיחת המשימה ${task.title}`}>
                        <p className={cn('text-sm font-medium', stage === 'done' && 'text-muted-foreground line-through')}>{task.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{projectName(task.project_id)}</p>
                        {due && stage !== 'done' && <p className={cn('mt-1 text-xs', due.late ? 'font-semibold text-destructive' : 'text-muted-foreground')}>{due.text}</p>}
                      </button>
                      <Button size="icon" variant="ghost" onClick={() => setParams({ open: task.id })} aria-label="הודעה ללקוח" title="הודעה ללקוח">
                        <Mail aria-hidden />
                      </Button>
                      {next && (
                        <Button size="icon" variant="secondary" onClick={() => advance(task.id, next)} aria-label={`העברה אל ${TASK_STAGE_LABEL[next]}`} title={`העברה אל ${TASK_STAGE_LABEL[next]}`}>
                          <ArrowLeft aria-hidden />
                        </Button>
                      )}
                    </article>
                  )
                })}
                {items.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted-foreground">אין משימות בשלב הזה</p>}
              </div>
            </section>
          )
        })}
      </div>

      {(openId || creating) && <TaskDialog key={openId ?? 'new'} taskId={openId} defaultProjectId={params.get('project')} onClose={close} />}
    </div>
  )
}
