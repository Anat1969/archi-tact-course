import { useState, type FormEvent } from 'react'
import { Field, Modal, fieldClass } from '@/components/Modal'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import type { ClientInput } from '@/types'

export function ClientForm({ clientId, onClose }: { clientId: string | null; onClose: (savedId?: string) => void }) {
  const { clients, saveClient } = useStore()
  const existing = clients.find((c) => c.id === clientId)
  const [form, setForm] = useState<ClientInput>({ name: existing?.name ?? '', phone: existing?.phone ?? null, email: existing?.email ?? null })
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      const saved = await saveClient(form, existing?.id)
      onClose(saved.id)
    } catch (err) {
      setError(`השמירה נכשלה: ${(err as Error).message}`)
    }
  }

  return (
    <Modal title={existing ? 'עריכת לקוח' : 'לקוח חדש'} onClose={() => onClose()}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="שם הלקוח">
          <input className={fieldClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="טלפון">
            <input type="tel" dir="ltr" className={`${fieldClass} text-right`} value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value || null })} />
          </Field>
          <Field label="מייל">
            <input type="email" dir="ltr" className={`${fieldClass} text-right`} value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value || null })} />
          </Field>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="submit">שמירה</Button>
          <Button type="button" variant="ghost" onClick={() => onClose()}>ביטול</Button>
        </div>
      </form>
    </Modal>
  )
}
