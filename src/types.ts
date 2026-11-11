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
  created_at: string
}

export interface Task {
  id: string
  title: string
  project_id: string | null
  stage: TaskStage
  created_at: string
}

export interface ExtractedData {
  project_name: string
  client_name: string
  budget: number
  deadline: string
}

export interface DocumentRecord {
  id: string
  file_url: string
  project_id: string | null
  extracted_data: ExtractedData | null
  status: DocumentStatus
  created_at: string
}

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
