import { Mail, MessageCircle, Phone } from 'lucide-react'
import { mailLink, whatsappLink } from '@/lib/messages'
import type { Client } from '@/types'

const linkClass =
  'inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground'
const offClass = 'inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground opacity-60'

// כפתורי יצירת קשר עם הלקוח. בלי טלפון או מייל, הכפתור מוצג כבוי עם הסבר.
export function ContactActions({ client, subject = '', text = '' }: { client: Client | undefined; subject?: string; text?: string }) {
  const phone = client?.phone
  const email = client?.email
  return (
    <div className="flex flex-wrap gap-2">
      {email ? (
        <a className={linkClass} href={mailLink(email, subject, text)}>
          <Mail className="size-4" aria-hidden /> שליחת מייל
        </a>
      ) : (
        <span className={offClass} title="ללקוח אין כתובת מייל"><Mail className="size-4" aria-hidden /> אין מייל</span>
      )}
      {phone ? (
        <>
          <a className={linkClass} href={whatsappLink(phone, text)} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" aria-hidden /> שליחה ב-WhatsApp
          </a>
          <a className={linkClass} href={`tel:${phone}`}>
            <Phone className="size-4" aria-hidden /> חיוג
          </a>
        </>
      ) : (
        <span className={offClass} title="ללקוח אין מספר טלפון"><MessageCircle className="size-4" aria-hidden /> אין טלפון</span>
      )}
    </div>
  )
}
