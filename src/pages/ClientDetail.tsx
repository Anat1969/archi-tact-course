import { ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ClientForm } from '@/components/ClientForm'
import { ContactActions } from '@/components/ContactActions'
import { ProjectForm } from '@/components/ProjectForm'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { OFFICE } from '@/lib/messages'
import { useStore } from '@/lib/store'
import { formatDate, formatShekel } from '@/lib/utils'

export function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, projects, tasks, removeClient } = useStore()
  const [editing, setEditing] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const client = clients.find((c) => c.id === id)
  if (!client) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">הלקוח לא נמצא. ייתכן שהוא נמחק.</p>
        <Link to="/clients" className="text-primary hover:underline">חזרה לרשימת הלקוחות</Link>
      </div>
    )
  }

  const own = projects.filter((p) => p.client_id === client.id)
  const openTasks = tasks.filter((t) => t.stage !== 'done' && own.some((p) => p.id === t.project_id)).length

  async function remove() {
    if (!window.confirm(`למחוק את הלקוח "${client!.name}"? הפרויקטים שלו יישארו בלי לקוח.`)) return
    try {
      await removeClient(client!.id)
      navigate('/clients')
    } catch (err) {
      setError(`המחיקה נכשלה: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-5">
      <Link to="/clients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="size-4" aria-hidden /> כל הלקוחות
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{client.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span dir="ltr">{client.phone ?? 'אין טלפון'}</span> · <span dir="ltr">{client.email ?? 'אין מייל'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}><Pencil aria-hidden /> עריכה</Button>
          <Button variant="ghost" className="text-destructive" onClick={remove}><Trash2 aria-hidden /> מחיקה</Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-3 gap-3 text-sm">
        {[
          ['פרויקטים', String(own.length)],
          ['היקף כולל', formatShekel(own.reduce((sum, p) => sum + Number(p.budget), 0))],
          ['משימות פתוחות', String(openTasks)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-card p-4 ring-1 ring-border">
            <p className="text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-border">
        <h3 className="font-semibold">יצירת קשר</h3>
        <ContactActions client={client} subject={`עדכון מ${OFFICE}`} text={`שלום ${client.name},\n`} />
      </section>

      <section className="space-y-2 rounded-xl bg-card p-4 ring-1 ring-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">הפרויקטים של הלקוח</h3>
          <Button size="sm" variant="secondary" onClick={() => setProjectOpen(true)}><Plus aria-hidden /> פרויקט</Button>
        </div>
        {own.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 text-sm hover:bg-accent">
            <span className="min-w-0 truncate font-medium">{project.name}</span>
            <span className="flex shrink-0 items-center gap-3 text-muted-foreground">
              <span className="hidden tabular-nums sm:inline">{formatShekel(Number(project.budget))}</span>
              <span className="hidden sm:inline">{formatDate(project.deadline)}</span>
              <StatusBadge status={project.status} />
            </span>
          </Link>
        ))}
        {own.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">ללקוח עדיין אין פרויקטים</p>}
      </section>

      {editing && <ClientForm clientId={client.id} onClose={() => setEditing(false)} />}
      {projectOpen && <ProjectForm projectId={null} defaultClientId={client.id} onClose={() => setProjectOpen(false)} />}
    </div>
  )
}
