import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { TASK_STAGE_LABEL, type TaskStage } from '@/types'

const STAGES: TaskStage[] = ['todo', 'doing', 'done']
const NEXT: Record<TaskStage, TaskStage | null> = { todo: 'doing', doing: 'done', done: null }

export function Tasks() {
  const { tasks, projects, moveTask } = useStore()
  const [error, setError] = useState<string | null>(null)
  const projectName = (id: string | null) => projects.find((p) => p.id === id)?.name ?? 'ללא פרויקט'

  async function advance(id: string, stage: TaskStage) {
    try {
      await moveTask(id, stage)
      setError(null)
    } catch (err) {
      setError(`העדכון נכשל: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {STAGES.map((stage) => {
          const items = tasks.filter((t) => t.stage === stage)
          const next = NEXT[stage]
          return (
            <section key={stage} className="rounded-xl bg-card/60 p-3">
              <header className="flex items-center justify-between px-2 pb-3">
                <h2 className="font-semibold">{TASK_STAGE_LABEL[stage]}</h2>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs tabular-nums">{items.length}</span>
              </header>
              <div className="space-y-2">
                {items.map((task) => (
                  <article key={task.id} className="flex items-center gap-3 rounded-lg bg-card p-3 ring-1 ring-border">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${stage === 'done' ? 'text-muted-foreground line-through' : ''}`}>{task.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{projectName(task.project_id)}</p>
                    </div>
                    {next && (
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => advance(task.id, next)}
                        aria-label={`העברת "${task.title}" אל ${TASK_STAGE_LABEL[next]}`}
                        title={`העברה אל ${TASK_STAGE_LABEL[next]}`}
                      >
                        <ArrowLeft aria-hidden />
                      </Button>
                    )}
                  </article>
                ))}
                {items.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted-foreground">אין משימות בשלב הזה</p>}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
