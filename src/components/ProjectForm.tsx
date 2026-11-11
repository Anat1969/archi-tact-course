import { useState, type FormEvent } from 'react'
import { Field, Modal, fieldClass } from '@/components/Modal'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { PROJECT_STATUSES, PROJECT_STATUS_LABEL, type ProjectInput } from '@/types'

export function ProjectForm({ projectId, defaultClientId, onClose }: { projectId: string | null; defaultClientId?: string | null; onClose: (savedId?: string) => void }) {
  const { projects, clients, saveProject } = useStore()
  const existing = projects.find((p) => p.id === projectId)
  const [form, setForm] = useState<ProjectInput>({
    name: existing?.name ?? '',
    client_id: existing?.client_id ?? defaultClientId ?? null,
    budget: existing?.budget ?? 0,
    status: existing?.status ?? 'planning',
    deadline: existing?.deadline ?? null,
    address: existing?.address ?? null,
    notes: existing?.notes ?? null,
  })
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => setForm((prev) => ({ ...prev, [key]: value }))

  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      const saved = await saveProject(form, existing?.id)
      onClose(saved.id)
    } catch (err) {
      setError(`השמירה נכשלה: ${(err as Error).message}`)
    }
  }

  return (
    <Modal title={existing ? 'עריכת פרויקט' : 'פרויקט חדש'} onClose={() => onClose()}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="שם הפרויקט">
          <input className={fieldClass} value={form.name} onChange={(e) => set('name', e.target.value)} required autoFocus />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="לקוח">
            <select className={fieldClass} value={form.client_id ?? ''} onChange={(e) => set('client_id', e.target.value || null)}>
              <option value="">ללא לקוח</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="סטטוס">
            <select className={fieldClass} value={form.status} onChange={(e) => set('status', e.target.value as ProjectInput['status'])}>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>{PROJECT_STATUS_LABEL[status]}</option>
              ))}
            </select>
          </Field>
          <Field label="תקציב בשקלים">
            <input type="number" min="0" className={fieldClass} value={form.budget || ''} onChange={(e) => set('budget', Number(e.target.value) || 0)} />
          </Field>
          <Field label="תאריך יעד">
            <input type="date" className={fieldClass} value={form.deadline ?? ''} onChange={(e) => set('deadline', e.target.value || null)} />
          </Field>
        </div>
        <Field label="כתובת האתר">
          <input className={fieldClass} value={form.address ?? ''} onChange={(e) => set('address', e.target.value || null)} />
        </Field>
        <Field label="הערות">
          <textarea className={`${fieldClass} h-16 py-2`} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value || null)} />
        </Field>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="submit">שמירה</Button>
          <Button type="button" variant="ghost" onClick={() => onClose()}>ביטול</Button>
        </div>
      </form>
    </Modal>
  )
}
