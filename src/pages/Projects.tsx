import { Plus, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { formatDate, formatShekel } from '@/lib/utils'
import { PROJECT_STATUS_LABEL } from '@/types'

export function Projects() {
  const { projects, clients, addProject } = useStore()
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clientName = (id: string | null) => clients.find((c) => c.id === id)?.name ?? 'ללא לקוח'
  const term = query.trim()
  const visible = projects.filter((p) => !term || p.name.includes(term) || clientName(p.client_id).includes(term))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await addProject({
        name: String(form.get('name')),
        client_id: String(form.get('client_id')) || null,
        budget: Number(form.get('budget')) || 0,
        status: 'planning',
        deadline: String(form.get('deadline')) || null,
      })
      setFormOpen(false)
      setError(null)
    } catch (err) {
      setError(`השמירה נכשלה: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש פרויקט או לקוח"
            aria-label="חיפוש פרויקטים"
            className="pr-9"
          />
        </div>
        <Button onClick={() => setFormOpen((v) => !v)}>
          <Plus aria-hidden />
          פרויקט חדש
        </Button>
      </div>

      {formOpen && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Input name="name" placeholder="שם הפרויקט" aria-label="שם הפרויקט" required />
              <select name="client_id" aria-label="לקוח" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm">
                <option value="" className="bg-card">ללא לקוח</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-card">{c.name}</option>
                ))}
              </select>
              <Input name="budget" type="number" min="0" placeholder="תקציב בשקלים" aria-label="תקציב" />
              <Input name="deadline" type="date" aria-label="תאריך יעד" />
              <Button type="submit">שמירה</Button>
            </form>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground">
        מוצגים {visible.length} מתוך {projects.length} פרויקטים
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="leading-snug">{project.name}</CardTitle>
                <Badge variant="secondary" className={project.status === 'active' ? 'bg-emerald-950 text-emerald-400' : project.status === 'done' ? 'bg-muted text-muted-foreground' : ''}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{clientName(project.client_id)}</p>
            </CardHeader>
            <CardContent className="flex items-end justify-between text-sm">
              <div>
                <p className="text-muted-foreground">תקציב</p>
                <p className="text-lg font-bold tabular-nums">{formatShekel(Number(project.budget))}</p>
              </div>
              <div className="text-left">
                <p className="text-muted-foreground">תאריך יעד</p>
                <p className="font-medium">{formatDate(project.deadline)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visible.length === 0 && <p className="py-10 text-center text-muted-foreground">לא נמצאו פרויקטים שמתאימים לחיפוש.</p>}
    </div>
  )
}
