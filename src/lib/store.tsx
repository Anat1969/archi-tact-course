import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { demoClients, demoDocuments, demoProjects, demoTasks } from '@/data/demo'
import { supabase, table } from '@/lib/supabase'
import type { Client, ClientInput, DocumentRecord, Project, ProjectInput, Task, TaskInput } from '@/types'

type TableName = 'clients' | 'projects' | 'tasks' | 'documents'
type DocumentInput = Pick<DocumentRecord, 'file_url' | 'project_id' | 'extracted_data' | 'status'>

interface Store {
  source: 'demo' | 'supabase'
  loading: boolean
  error: string | null
  clients: Client[]
  projects: Project[]
  tasks: Task[]
  documents: DocumentRecord[]
  saveClient: (input: ClientInput, id?: string) => Promise<Client>
  removeClient: (id: string) => Promise<void>
  saveProject: (input: ProjectInput, id?: string) => Promise<Project>
  removeProject: (id: string) => Promise<void>
  saveTask: (input: Partial<TaskInput>, id?: string) => Promise<Task>
  removeTask: (id: string) => Promise<void>
  addDocument: (input: DocumentInput) => Promise<void>
}

const StoreContext = createContext<Store | null>(null)

const localRow = () => ({ id: crypto.randomUUID(), created_at: new Date().toISOString() })

// כתיבה למאגר: Supabase כשהוא מחובר, אחרת שורה מקומית בלבד
async function persist<T extends { id: string }>(name: TableName, input: object, id: string | undefined, current: T | undefined): Promise<T> {
  if (!supabase) return (id ? { ...current, ...input } : { ...localRow(), ...input }) as T
  const query = id ? supabase.from(table(name)).update(input).eq('id', id) : supabase.from(table(name)).insert(input)
  const { data, error } = await query.select().single()
  if (error) throw new Error(error.message)
  return data as T
}

async function erase(name: TableName, id: string) {
  if (!supabase) return
  const { error } = await supabase.from(table(name)).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

const upsert = <T extends { id: string }>(list: T[], row: T) =>
  list.some((item) => item.id === row.id) ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row]

export function StoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(supabase ? [] : demoClients)
  const [projects, setProjects] = useState<Project[]>(supabase ? [] : demoProjects)
  const [tasks, setTasks] = useState<Task[]>(supabase ? [] : demoTasks)
  const [documents, setDocuments] = useState<DocumentRecord[]>(supabase ? [] : demoDocuments)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    const db = supabase
    Promise.all([
      db.from(table('clients')).select('*').order('created_at'),
      db.from(table('projects')).select('*').order('created_at'),
      db.from(table('tasks')).select('*').order('created_at'),
      db.from(table('documents')).select('*').order('created_at'),
    ]).then(([c, p, t, d]) => {
      const failed = [c, p, t, d].find((r) => r.error)
      if (failed?.error) {
        setError(`טעינת הנתונים מ-Supabase נכשלה: ${failed.error.message}`)
      } else {
        setClients(c.data as Client[])
        setProjects(p.data as Project[])
        setTasks(t.data as Task[])
        setDocuments(d.data as DocumentRecord[])
      }
      setLoading(false)
    })

    // Realtime: לוח המשימות מתעדכן אצל כל מי שפתוח אצלו, בלי רענון
    const channel = db
      .channel('tasks-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: table('tasks') }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id: string }).id
          setTasks((prev) => prev.filter((task) => task.id !== id))
        } else {
          setTasks((prev) => upsert(prev, payload.new as Task))
        }
      })
      .subscribe()
    return () => {
      db.removeChannel(channel)
    }
  }, [])

  const saveClient = useCallback<Store['saveClient']>(
    async (input, id) => {
      const row = await persist<Client>('clients', input, id, clients.find((c) => c.id === id))
      setClients((prev) => upsert(prev, row))
      return row
    },
    [clients],
  )

  const removeClient = useCallback<Store['removeClient']>(async (id) => {
    await erase('clients', id)
    setClients((prev) => prev.filter((c) => c.id !== id))
    setProjects((prev) => prev.map((p) => (p.client_id === id ? { ...p, client_id: null } : p)))
  }, [])

  const saveProject = useCallback<Store['saveProject']>(
    async (input, id) => {
      const row = await persist<Project>('projects', input, id, projects.find((p) => p.id === id))
      setProjects((prev) => upsert(prev, row))
      return row
    },
    [projects],
  )

  const removeProject = useCallback<Store['removeProject']>(async (id) => {
    await erase('projects', id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setTasks((prev) => prev.filter((t) => t.project_id !== id))
    setDocuments((prev) => prev.map((d) => (d.project_id === id ? { ...d, project_id: null } : d)))
  }, [])

  const saveTask = useCallback<Store['saveTask']>(
    async (input, id) => {
      const row = await persist<Task>('tasks', input, id, tasks.find((t) => t.id === id))
      setTasks((prev) => upsert(prev, row))
      return row
    },
    [tasks],
  )

  const removeTask = useCallback<Store['removeTask']>(async (id) => {
    await erase('tasks', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addDocument = useCallback<Store['addDocument']>(async (input) => {
    const row = await persist<DocumentRecord>('documents', input, undefined, undefined)
    setDocuments((prev) => [...prev, row])
  }, [])

  const value = useMemo<Store>(
    () => ({
      source: supabase ? 'supabase' : 'demo',
      loading,
      error,
      clients,
      projects,
      tasks,
      documents,
      saveClient,
      removeClient,
      saveProject,
      removeProject,
      saveTask,
      removeTask,
      addDocument,
    }),
    [loading, error, clients, projects, tasks, documents, saveClient, removeClient, saveProject, removeProject, saveTask, removeTask, addDocument],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore חייב לרוץ בתוך StoreProvider')
  return store
}
