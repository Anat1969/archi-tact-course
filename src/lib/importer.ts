import { readSheet } from 'read-excel-file/browser'
import type { ProjectStatus, TaskStage } from '@/types'

export type ImportTarget = 'clients' | 'projects' | 'tasks'
type Cell = string | number | boolean | Date | null

export const TARGET_LABEL: Record<ImportTarget, string> = { clients: 'לקוחות', projects: 'פרויקטים', tasks: 'משימות' }

// לכל שדה: שם התצוגה, ואילו כותרות עמודה מזוהות כשדה הזה
const FIELDS: Record<ImportTarget, { key: string; label: string; required?: boolean; headers: string[] }[]> = {
  clients: [
    { key: 'name', label: 'שם', required: true, headers: ['שם', 'שם לקוח', 'שם הלקוח', 'לקוח', 'name', 'client'] },
    { key: 'phone', label: 'טלפון', headers: ['טלפון', 'נייד', 'מספר טלפון', 'phone', 'mobile'] },
    { key: 'email', label: 'מייל', headers: ['מייל', 'אימייל', 'דואל', 'דוא"ל', 'email', 'e-mail'] },
  ],
  projects: [
    { key: 'name', label: 'שם הפרויקט', required: true, headers: ['שם פרויקט', 'שם הפרויקט', 'פרויקט', 'שם', 'project', 'name'] },
    { key: 'client', label: 'לקוח', headers: ['לקוח', 'שם לקוח', 'שם הלקוח', 'client'] },
    { key: 'budget', label: 'תקציב', headers: ['תקציב', 'סכום', 'שכר טרחה', 'budget'] },
    { key: 'status', label: 'סטטוס', headers: ['סטטוס', 'מצב', 'status'] },
    { key: 'deadline', label: 'תאריך יעד', headers: ['תאריך יעד', 'יעד', 'תאריך סיום', 'deadline'] },
    { key: 'address', label: 'כתובת', headers: ['כתובת', 'מיקום', 'address'] },
  ],
  tasks: [
    { key: 'title', label: 'משימה', required: true, headers: ['משימה', 'כותרת', 'שם המשימה', 'תיאור', 'title', 'task'] },
    { key: 'project', label: 'פרויקט', headers: ['פרויקט', 'שם פרויקט', 'שם הפרויקט', 'project'] },
    { key: 'stage', label: 'שלב', headers: ['שלב', 'סטטוס', 'מצב', 'stage', 'status'] },
    { key: 'due_date', label: 'תאריך יעד', headers: ['תאריך יעד', 'יעד', 'עד תאריך', 'due', 'deadline'] },
  ],
}

export const fieldsOf = (target: ImportTarget) => FIELDS[target]

const clean = (value: Cell) => String(value ?? '').trim().toLowerCase().replace(/[:*]/g, '')

function parseCsv(text: string): Cell[][] {
  const delimiter = (text.split('\n')[0].match(/;/g)?.length ?? 0) > (text.split('\n')[0].match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === delimiter) { row.push(cell); cell = '' }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else if (ch !== '\r') cell += ch
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows
}

export async function readTable(file: File): Promise<{ headers: string[]; rows: Cell[][] }> {
  const name = file.name.toLowerCase()
  let grid: Cell[][]
  if (name.endsWith('.xlsx')) grid = (await readSheet(file)) as Cell[][]
  else if (name.endsWith('.csv')) grid = parseCsv((await file.text()).replace(/^﻿/, ''))
  else if (name.endsWith('.xls')) throw new Error('קובץ xls ישן לא נתמך. שמרו אותו באקסל כ-xlsx ונסו שוב.')
  else throw new Error('אפשר לייבא קובצי Excel (xlsx) או CSV.')
  const filled = grid.filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
  if (filled.length < 2) throw new Error('בקובץ צריכה להיות שורת כותרות ולפחות שורת נתונים אחת.')
  return { headers: filled[0].map((cell) => String(cell ?? '').trim()), rows: filled.slice(1) }
}

// לכל שדה של היעד: מספר העמודה בקובץ, או 1- אם לא נמצאה
export function mapColumns(target: ImportTarget, headers: string[]) {
  const used = new Set<number>()
  const mapping: Record<string, number> = {}
  for (const field of FIELDS[target]) {
    const index = headers.findIndex((header, i) => !used.has(i) && field.headers.includes(clean(header)))
    mapping[field.key] = index
    if (index >= 0) used.add(index)
  }
  return mapping
}

// ניחוש היעד לפי הכותרות: היעד שהכי הרבה מהשדות שלו נמצאו, כולל שדה החובה
export function guessTarget(headers: string[]): ImportTarget {
  const names = headers.map(clean)
  if (names.some((h) => ['משימה', 'כותרת', 'שם המשימה', 'task', 'title'].includes(h))) return 'tasks'
  if (names.some((h) => ['תקציב', 'שם פרויקט', 'שם הפרויקט', 'פרויקט', 'budget', 'project'].includes(h))) return 'projects'
  return 'clients'
}

const text = (value: Cell) => {
  const result = String(value ?? '').trim()
  return result === '' ? null : result
}

function date(value: Cell): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const raw = text(value)
  if (!raw) return null
  const local = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/)
  if (local) {
    const year = local[3].length === 2 ? `20${local[3]}` : local[3]
    return `${year}-${local[2].padStart(2, '0')}-${local[1].padStart(2, '0')}`
  }
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : null
}

const amount = (value: Cell) => (typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^\d.-]/g, '')) || 0)

const status = (value: Cell): ProjectStatus => {
  const raw = clean(value)
  if (/הושלם|הסתיים|done|complete/.test(raw)) return 'done'
  if (/תכנון|planning/.test(raw)) return 'planning'
  return raw ? 'active' : 'planning'
}

const stage = (value: Cell): TaskStage => {
  const raw = clean(value)
  if (/הושלם|בוצע|done/.test(raw)) return 'done'
  if (/תהליך|בעבודה|doing|progress/.test(raw)) return 'doing'
  return 'todo'
}

export type ImportRow = Record<string, string | number | null>

// ממיר את שורות הקובץ לרשומות נקיות. שורה בלי שדה החובה מדולגת.
export function buildRows(target: ImportTarget, mapping: Record<string, number>, rows: Cell[][]) {
  const at = (row: Cell[], key: string) => (mapping[key] >= 0 ? row[mapping[key]] ?? null : null)
  const required = FIELDS[target].find((field) => field.required)!.key
  const result: ImportRow[] = []
  let skipped = 0
  for (const row of rows) {
    if (!text(at(row, required))) { skipped++; continue }
    if (target === 'clients') result.push({ name: text(at(row, 'name')), phone: text(at(row, 'phone')), email: text(at(row, 'email')) })
    if (target === 'projects')
      result.push({
        name: text(at(row, 'name')), client: text(at(row, 'client')), budget: amount(at(row, 'budget')),
        status: status(at(row, 'status')), deadline: date(at(row, 'deadline')), address: text(at(row, 'address')),
      })
    if (target === 'tasks')
      result.push({ title: text(at(row, 'title')), project: text(at(row, 'project')), stage: stage(at(row, 'stage')), due_date: date(at(row, 'due_date')) })
  }
  return { rows: result, skipped }
}
