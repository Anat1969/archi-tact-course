import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// בלי משתני סביבה האפליקציה עובדת על נתוני הדמו המקומיים
export const supabase = url && anonKey ? createClient(url, anonKey) : null

// בפרויקט Supabase משותף לכמה אפליקציות, הטבלאות נושאות קידומת (למשל architact_)
const prefix = (import.meta.env.VITE_SUPABASE_TABLE_PREFIX as string | undefined) ?? ''
export const table = (name: 'clients' | 'projects' | 'tasks' | 'documents') => `${prefix}${name}`
