import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { demoClients, demoDocuments, demoProjects, demoTasks } from '@/data/demo'
import { supabase, table } from '@/lib/supabase'
import type { Client, DocumentRecord, Project, Task, TaskStage } from '@/types'

type Source = 'demo' | 'supabase'

interface Store {
  source: Source
  loading: boolean
  error: string | null
  clients: Client[]
  projects: Project[]
  tasks: Task[]
  documents: DocumentRecord[]
  addClient: (input: Pick<Client, 'name' | 'phone' | 'email'>) => Promise<Client>
  addProject: (input: Pick<Project, 'name' | 'client_id' | 'budget' | 'status' | 'deadline'>) => Promise<Project>
  moveTask: (id: string, stage: TaskStage) => Promise<void>
  addDocument: (input: Pick<DocumentRecord, 'file_url' | 'project_id' | 'extracted_data' | 'status'>) => Promise<void>
}

const StoreContext = createContext<Store | null>(null)

const localRow = () => ({ id: crypto.randomUUID(), created_at: new Date().toISOString() })

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
  }, [])

  const addClient = useCallback<Store['addClient']>(async (input) => {
    let row: Client = { ...localRow(), ...input }
    if (supabase) {
      const { data, error } = await supabase.from(table('clients')).insert(input).select().single()
      if (error) throw new Error(error.message)
      row = data as Client
    }
    setClients((prev) => [...prev, row])
    return row
  }, [])

  const addProject = useCallback<Store['addProject']>(async (input) => {
    let row: Project = { ...localRow(), ...input }
    if (supabase) {
      const { data, error } = await supabase.from(table('projects')).insert(input).select().single()
      if (error) throw new Error(error.message)
      row = data as Project
    }
    setProjects((prev) => [...prev, row])
    return row
  }, [])

  const moveTask = useCallback<Store['moveTask']>(async (id, stage) => {
    if (supabase) {
      const { error } = await supabase.from(table('tasks')).update({ stage }).eq('id', id)
      if (error) throw new Error(error.message)
    }
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, stage } : task)))
  }, [])

  const addDocument = useCallback<Store['addDocument']>(async (input) => {
    let row: DocumentRecord = { ...localRow(), ...input }
    if (supabase) {
      const { data, error } = await supabase.from(table('documents')).insert(input).select().single()
      if (error) throw new Error(error.message)
      row = data as DocumentRecord
    }
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
      addClient,
      addProject,
      moveTask,
      addDocument,
    }),
    [loading, error, clients, projects, tasks, documents, addClient, addProject, moveTask, addDocument],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore חייב לרוץ בתוך StoreProvider')
  return store
}
