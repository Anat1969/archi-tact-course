import { Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { ContactActions } from '@/components/ContactActions'
import { Field, Modal, fieldClass } from '@/components/Modal'
import { Button } from '@/components/ui/button'
import { taskMessage } from '@/lib/messages'
import { useStore } from '@/lib/store'
import { TASK_STAGES, TASK_STAGE_LABEL, type TaskInput } from '@/types'

// חלון משימה: יצירה, עריכה, מחיקה, ושליחת הודעה ללקוח לפי השלב
export function TaskDialog({ taskId, defaultProjectId, onClose }: { taskId: string | null; defaultProjectId?: string | null; onClose: () => void }) {
  const { tasks, projects, clients, saveTask, removeTask } = useStore()
  const existing = tasks.find((task) => task.id === taskId)
  const [form, setForm] = useState<TaskInput>({
    title: existing?.title ?? '',
    project_id: existing?.project_id ?? defaultProjectId ?? null,
    stage: existing?.stage ?? 'todo',
    due_date: existing?.due_date ?? null,
    notes: existing?.notes ?? null,
  })
  const [error, setError] = useState<string | null>(null)

  const project = projects.find((p) => p.id === form.project_id)
  const client = clients.find((c) => c.id === project?.client_id)
  const suggested = taskMessage(form, project, client)
  const [message, setMessage] = useState(suggested.text)
  const [edited, setEdited] = useState(false)
  useEffect(() => {
    if (!edited) setMessage(suggested.text)
  }, [suggested.text, edited])

  const set = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) => setForm((prev) => ({ ...prev, [key]: value }))

  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await saveTask(form, existing?.id)
      onClose()
    } catch (err) {
      setError(`השמירה נכשלה: ${(err as Error).message}`)
    }
  }

  async function remove() {
    if (!existing || !window.confirm(`למחוק את המשימה "${existing.title}"?`)) return
    try {
      await removeTask(existing.id)
      onClose()
    } catch (err) {
      setError(`המחיקה נכשלה: ${(err as Error).message}`)
    }
  }

  return (
    <Modal title={existing ? 'פרטי משימה' : 'משימה חדשה'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="כותרת">
          <input className={fieldClass} value={form.title} onChange={(e) => set('title', e.target.value)} required autoFocus={!existing} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="פרויקט">
            <select className={fieldClass} value={form.project_id ?? ''} onChange={(e) => set('project_id', e.target.value || null)}>
              <option value="">ללא פרויקט</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="שלב">
            <select className={fieldClass} value={form.stage} onChange={(e) => set('stage', e.target.value as TaskInput['stage'])}>
              {TASK_STAGES.map((stage) => (
                <option key={stage} value={stage}>{TASK_STAGE_LABEL[stage]}</option>
              ))}
            </select>
          </Field>
          <Field label="תאריך יעד">
            <input type="date" className={fieldClass} value={form.due_date ?? ''} onChange={(e) => set('due_date', e.target.value || null)} />
          </Field>
        </div>
        <Field label="הערות">
          <textarea className={`${fieldClass} h-16 py-2`} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value || null)} />
        </Field>

        <section className="space-y-2 rounded-lg bg-muted/50 p-3">
          <div className="flex items-center justify-between gap-2 text-sm">
            <h3 className="font-semibold">הודעה ללקוח {client ? `(${client.name})` : ''}</h3>
            <span className="text-xs text-muted-foreground">הנוסח מתאים לשלב: {TASK_STAGE_LABEL[form.stage]}</span>
          </div>
          <textarea
            aria-label="נוסח ההודעה"
            className={`${fieldClass} h-28 py-2 leading-relaxed`}
            value={message}
            onChange={(e) => { setMessage(e.target.value); setEdited(true) }}
          />
          {client ? (
            <ContactActions client={client} subject={suggested.subject} text={message} />
          ) : (
            <p className="text-xs text-muted-foreground">כדי לשלוח, בחרו פרויקט שמשויך ללקוח.</p>
          )}
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex gap-2">
            <Button type="submit">שמירה</Button>
            <Button type="button" variant="ghost" onClick={onClose}>ביטול</Button>
          </div>
          {existing && (
            <Button type="button" variant="ghost" onClick={remove} className="text-destructive">
              <Trash2 aria-hidden /> מחיקה
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}
