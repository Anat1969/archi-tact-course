import { Plus, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useStore } from '@/lib/store'

export function Clients() {
  const { clients, projects, addClient } = useStore()
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const term = query.trim()
  const visible = clients.filter(
    (c) => !term || c.name.includes(term) || (c.phone ?? '').includes(term) || (c.email ?? '').includes(term),
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await addClient({
        name: String(form.get('name')),
        phone: String(form.get('phone')) || null,
        email: String(form.get('email')) || null,
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
            placeholder="חיפוש לפי שם, טלפון או מייל"
            aria-label="חיפוש לקוחות"
            className="pr-9"
          />
        </div>
        <Button onClick={() => setFormOpen((v) => !v)}>
          <Plus aria-hidden />
          לקוח חדש
        </Button>
      </div>

      {formOpen && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Input name="name" placeholder="שם הלקוח" aria-label="שם הלקוח" required />
              <Input name="phone" type="tel" dir="ltr" placeholder="טלפון" aria-label="טלפון" className="text-right" />
              <Input name="email" type="email" dir="ltr" placeholder="מייל" aria-label="מייל" className="text-right" />
              <Button type="submit">שמירה</Button>
            </form>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">טלפון</TableHead>
                <TableHead className="text-right">מייל</TableHead>
                <TableHead className="text-right">פרויקטים</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell><span dir="ltr">{client.phone ?? ''}</span></TableCell>
                  <TableCell><span dir="ltr">{client.email ?? ''}</span></TableCell>
                  <TableCell className="tabular-nums">{projects.filter((p) => p.client_id === client.id).length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {visible.length === 0 && <p className="py-10 text-center text-muted-foreground">לא נמצאו לקוחות שמתאימים לחיפוש.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
