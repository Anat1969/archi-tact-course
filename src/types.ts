export type ProjectStatus = 'planning' | 'active' | 'done'
export type TaskStage = 'todo' | 'doing' | 'done'
export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'imported'

export interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  created_at: string
}

export interface Project {
  id: string
  name: string
  client_id: string | null
  budget: number
  status: ProjectStatus
  deadline: string | null
  address: string | null
  notes: string | null
  created_at: string
}

export interface Task {
  id: string
  title: string
  project_id: string | null
  stage: TaskStage
  due_date: string | null
  notes: string | null
  created_at: string
}

export interface DocumentRecord {
  id: string
  file_url: string
  project_id: string | null
  extracted_data: { target: string; imported: number; skipped: number } | null
  status: DocumentStatus
  created_at: string
}

export type ClientInput = Pick<Client, 'name' | 'phone' | 'email'>
export type ProjectInput = Pick<Project, 'name' | 'client_id' | 'budget' | 'status' | 'deadline' | 'address' | 'notes'>
export type TaskInput = Pick<Task, 'title' | 'project_id' | 'stage' | 'due_date' | 'notes'>

export const PROJECT_STATUSES: ProjectStatus[] = ['planning', 'active', 'done']
export const TASK_STAGES: TaskStage[] = ['todo', 'doing', 'done']

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: 'בתכנון',
  active: 'פעיל',
  done: 'הושלם',
}

export const TASK_STAGE_LABEL: Record<TaskStage, string> = {
  todo: 'לביצוע',
  doing: 'בתהליך',
  done: 'הושלם',
}
