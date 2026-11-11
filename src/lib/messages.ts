import { formatDate } from '@/lib/utils'
import type { Client, Project, Task } from '@/types'

export const OFFICE = 'שחר אדריכלים'

// נוסח הודעה ללקוח לפי השלב שבו המשימה נמצאת
export function taskMessage(task: Pick<Task, 'title' | 'stage' | 'due_date'>, project: Project | undefined, client: Client | undefined) {
  const hello = `שלום ${client?.name ?? ''},`.replace(' ,', ',')
  const about = project ? `בנושא הפרויקט "${project.name}":` : ''
  const due = task.due_date ? ` היעד שלנו הוא ${formatDate(task.due_date)}.` : ''
  const body = {
    todo: `אנחנו נערכים להתחיל את "${task.title}".${due} נשמח לתאם מועד ולקבל מכם את החומרים הנדרשים.`,
    doing: `עדכון קצר: "${task.title}" נמצאת בעבודה.${due} נעדכן ברגע שתהיה גרסה לעיון.`,
    done: `"${task.title}" הושלמה. נשמח לאישורכם או להערות, כדי שנוכל להתקדם לשלב הבא.`,
  }[task.stage]
  return {
    subject: project ? `${project.name}: ${task.title}` : task.title,
    text: [hello, about, body, `תודה, ${OFFICE}`].filter(Boolean).join('\n'),
  }
}

export const mailLink = (email: string, subject: string, text: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`

// מספר ישראלי (052-1234567 או 03-1234567) לפורמט בינלאומי של WhatsApp
export function whatsappLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, '')
  const international = digits.startsWith('972') ? digits : `972${digits.replace(/^0/, '')}`
  return `https://wa.me/${international}?text=${encodeURIComponent(text)}`
}

export const mapsLink = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
