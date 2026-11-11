import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatShekel = (amount: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount)

export const formatDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : 'ללא תאריך'

const DAY = 24 * 60 * 60 * 1000
export const todayIso = () => new Date().toISOString().slice(0, 10)

// כמה ימים נשארו עד התאריך. מספר שלילי פירושו שהתאריך עבר.
export const daysUntil = (iso: string) => Math.round((new Date(iso).getTime() - new Date(todayIso()).getTime()) / DAY)

export function dueLabel(iso: string | null) {
  if (!iso) return null
  const days = daysUntil(iso)
  if (days < 0) return { text: `באיחור של ${-days} ימים`, late: true }
  if (days === 0) return { text: 'היום', late: false }
  if (days === 1) return { text: 'מחר', late: false }
  return { text: `בעוד ${days} ימים`, late: false }
}
