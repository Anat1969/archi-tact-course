import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClientForm } from '@/components/ClientForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { formatShekel } from '@/lib/utils'

export function Clients() {
  const { clients, projects } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const term = query.trim()
  const visible = clients.filter((c) => !term || c.name.includes(term) || (c.phone ?? '').includes(term) || (c.email ?? '').includes(term))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש לפי שם, טלפון או מייל" aria-label="חיפוש לקוחות" className="pr-9" />
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus aria-hidden /> לקוח חדש
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-right text-muted-foreground">
              <th className="px-4 py-3 font-medium">שם</th>
              <th className="px-4 py-3 font-medium">טלפון</th>
              <th className="px-4 py-3 font-medium">מייל</th>
              <th className="px-4 py-3 font-medium">פרויקטים</th>
              <th className="px-4 py-3 font-medium">היקף</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((client) => {
              const own = projects.filter((p) => p.client_id === client.id)
              return (
                <tr
                  key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/clients/${client.id}`)}
                  tabIndex={0}
                  className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent focus:bg-accent focus:outline-none"
                >
                  <td className="px-4 py-3 font-semibold">{client.name}</td>
                  <td className="px-4 py-3"><span dir="ltr">{client.phone ?? ''}</span></td>
                  <td className="px-4 py-3"><span dir="ltr">{client.email ?? ''}</span></td>
                  <td className="px-4 py-3 tabular-nums">{own.length}</td>
                  <td className="px-4 py-3 tabular-nums">{formatShekel(own.reduce((sum, p) => sum + Number(p.budget), 0))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visible.length === 0 && <p className="py-10 text-center text-muted-foreground">לא נמצאו לקוחות שמתאימים לחיפוש.</p>}
      </div>

      {formOpen && <ClientForm clientId={null} onClose={(id) => { setFormOpen(false); if (id) navigate(`/clients/${id}`) }} />}
    </div>
  )
}
