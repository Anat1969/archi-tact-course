import type { ReactNode } from 'react'
import type { GuideStep } from '@/data/guideSteps'
import { useGuide } from '@/lib/guide'
import { useStore } from '@/lib/store'

// "מאחורי הקלעים": שלבים שקורים מחוץ למסכי האפליקציה. העיצוב בהיר כמו המדריך,
// והמספרים אמיתיים: הם נלקחים מהמאגר שהאפליקציה החיה עובדת מולו.

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-[#dcdcdc] bg-white p-4">
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      {children}
    </section>
  )
}

const Mono = ({ children }: { children: ReactNode }) => <code dir="ltr" className="rounded bg-[#f0f0f0] px-1.5 py-0.5 text-[12px]">{children}</code>

function Spec() {
  const screens = ['דשבורד', 'פרויקטים', 'לקוחות', 'לוח משימות', 'ציר זמן', 'ייבוא מאקסל']
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Box title="למי, ולמה">
        <p className="text-sm leading-relaxed text-[#444]">משרד אדריכלים קטן שמנהל היום לקוחות, פרויקטים ומשימות בקובצי אקסל, במיילים וב-WhatsApp. המטרה: מקום אחד שבו רואים מה פתוח, מה דחוף, ומי מחכה לתשובה.</p>
      </Box>
      <Box title="מה מנהלים">
        <ul className="space-y-1.5 text-sm text-[#444]">
          <li><strong>לקוחות:</strong> שם, טלפון, מייל</li>
          <li><strong>פרויקטים:</strong> שם, לקוח, תקציב, סטטוס, תאריך יעד, כתובת</li>
          <li><strong>משימות:</strong> כותרת, פרויקט, שלב, תאריך יעד</li>
        </ul>
      </Box>
      <Box title="ששת המסכים">
        <ol className="grid grid-cols-2 gap-2 text-sm">
          {screens.map((name, index) => (
            <li key={name} className="flex items-center gap-2 rounded bg-[#f5f5f5] px-2.5 py-1.5">
              <span className="grid size-5 place-items-center rounded-full bg-[#f0d060] text-[11px] font-bold">{index + 1}</span>
              {name}
            </li>
          ))}
        </ol>
      </Box>
      <Box title="הכלים">
        <ul className="space-y-1.5 text-sm text-[#444]">
          <li><strong>React ו-TypeScript:</strong> המסכים עצמם</li>
          <li><strong>Tailwind ו-shadcn/ui:</strong> העיצוב והרכיבים</li>
          <li><strong>Supabase:</strong> מסד הנתונים</li>
          <li><strong>Vercel:</strong> הכתובת באינטרנט</li>
        </ul>
      </Box>
    </div>
  )
}

function Schema() {
  const { clients, projects, tasks, documents, source } = useStore()
  const tables: { name: string; label: string; count: number; fields: [string, string][] }[] = [
    { name: 'clients', label: 'לקוחות', count: clients.length, fields: [['name', 'שם'], ['phone', 'טלפון'], ['email', 'מייל']] },
    { name: 'projects', label: 'פרויקטים', count: projects.length, fields: [['name', 'שם'], ['client_id', 'מצביע על לקוח'], ['budget', 'תקציב'], ['status', 'סטטוס'], ['deadline', 'תאריך יעד'], ['address', 'כתובת']] },
    { name: 'tasks', label: 'משימות', count: tasks.length, fields: [['title', 'כותרת'], ['project_id', 'מצביע על פרויקט'], ['stage', 'שלב'], ['due_date', 'תאריך יעד']] },
    { name: 'documents', label: 'קבצים שיובאו', count: documents.length, fields: [['file_url', 'שם הקובץ'], ['extracted_data', 'סיכום הייבוא'], ['status', 'סטטוס']] },
  ]
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#444]">
        המספרים כאן אמיתיים: זה מה שנמצא עכשיו ב{source === 'supabase' ? 'מסד הנתונים של האפליקציה החיה' : 'נתוני הדוגמה של האפליקציה'}.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tables.map((table) => (
          <section key={table.name} className="overflow-hidden rounded-md border border-[#dcdcdc] bg-white">
            <header className="flex items-center justify-between bg-[#111] px-3 py-2 text-white">
              <span className="text-sm font-bold">{table.label}</span>
              <span dir="ltr" className="text-[12px] text-[#bdbdbd]">{table.name}</span>
            </header>
            <p className="border-b border-[#ececec] px-3 py-2 text-sm"><strong className="text-lg tabular-nums">{table.count}</strong> שורות</p>
            <ul className="divide-y divide-[#f0f0f0] text-sm">
              {table.fields.map(([field, meaning]) => (
                <li key={field} className="flex items-center justify-between gap-2 px-3 py-1.5">
                  <span className={field.endsWith('_id') ? 'font-semibold' : 'text-[#444]'}>{meaning}</span>
                  <span dir="ltr" className="text-[12px] text-[#888]">{field}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <Box title="איך הטבלאות קשורות">
        <p className="text-sm leading-relaxed text-[#444]">
          <strong>לקוח</strong> ← יש לו כמה <strong>פרויקטים</strong> ← לכל פרויקט כמה <strong>משימות</strong>.
          הפרויקט לא שומר את שם הלקוח, אלא מצביע עליו. לכן שינוי בשם הלקוח מופיע מיד בכל הפרויקטים שלו.
        </p>
      </Box>
    </div>
  )
}

function Env() {
  const { source } = useStore()
  const stations: [string, string, ReactNode][] = [
    ['1', 'המחשב שלכם', <>כאן Claude Code כותב את הקוד. הקובץ <Mono>.env</Mono> נשאר רק כאן.</>],
    ['2', 'GitHub', <>שומר את הקוד ואת כל הגרסאות שלו. ריפו פרטי בשם <Mono>archi-tact</Mono>.</>],
    ['3', 'Vercel', <>לוקח את הקוד מ-GitHub ומעלה אותו לכתובת. כל שמירה ל-<Mono>main</Mono> עולה לבד.</>],
    ['4', 'Supabase', <>מסד הנתונים. האפליקציה פונה אליו מהדפדפן עם המפתח הציבורי.</>],
  ]
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        {stations.map(([number, name, text]) => (
          <section key={name} className="rounded-md border border-[#dcdcdc] bg-white p-3">
            <p className="mb-1 flex items-center gap-2 text-sm font-bold">
              <span className="grid size-5 place-items-center rounded-full bg-[#f0d060] text-[11px]">{number}</span>
              {name}
            </p>
            <p className="text-sm leading-relaxed text-[#444]">{text}</p>
          </section>
        ))}
      </div>
      <Box title="משתני הסביבה">
        <ul className="space-y-1.5 text-sm text-[#444]">
          <li><Mono>VITE_SUPABASE_URL</Mono> הכתובת של פרויקט ה-Supabase</li>
          <li><Mono>VITE_SUPABASE_ANON_KEY</Mono> המפתח הציבורי. מותר בדפדפן.</li>
        </ul>
        <p className="mt-2 text-sm text-[#444]">אותם שני ערכים מופיעים פעמיים: בקובץ <Mono>.env</Mono> במחשב, ובהגדרות של Vercel.</p>
      </Box>
      <Box title="באפליקציה החיה שמולכם">
        <p className="text-sm text-[#444]">מקור הנתונים כרגע: <strong>{source === 'supabase' ? 'Supabase, מסד נתונים אמיתי' : 'נתוני דוגמה מקומיים, בלי Supabase'}</strong>.</p>
      </Box>
    </div>
  )
}

function Launch() {
  const { clients, projects, tasks, documents, source } = useStore()
  const guide = useGuide()
  const checks: [string, string, number][] = [
    [`${projects.length} פרויקטים, עם דף לכל פרויקט`, 'פרויקטים', 3],
    [`${clients.length} לקוחות, עם דף לכל לקוח`, 'לקוחות', 4],
    [`${tasks.length} משימות בלוח, ${tasks.filter((t) => t.stage !== 'done').length} מהן פתוחות`, 'לוח משימות', 5],
    ['נוסח הודעה ללקוח לפי שלב המשימה', 'תקשורת', 6],
    [`${documents.length} קבצים יובאו עד עכשיו`, 'ייבוא מאקסל', 7],
    ['דשבורד וציר זמן שמחושבים מהנתונים', 'דשבורד', 8],
  ]
  return (
    <div className="space-y-4">
      <Box title="מה כבר עובד באפליקציה החיה">
        <ul className="space-y-1.5">
          {checks.map(([text, label, step]) => (
            <li key={label}>
              <button onClick={() => guide.go(step)} className="flex w-full items-center justify-between gap-3 rounded bg-[#f5f5f5] px-3 py-2 text-right text-sm hover:bg-[#ececec]">
                <span>{text}</span>
                <span className="shrink-0 text-xs text-[#888]">לשלב {step}: {label}</span>
              </button>
            </li>
          ))}
        </ul>
      </Box>
      <Box title="מה חסר לפני עבודה אמיתית">
        <ul className="space-y-1.5 text-sm leading-relaxed text-[#444]">
          <li><strong>התחברות:</strong> באפליקציה החיה הזו היא לא מופעלת, כדי שההדגמה תישאר פתוחה לכיתה.</li>
          <li><strong>הרשאות:</strong> בלי התחברות, הטבלאות פתוחות לכל מי שמחזיק את הכתובת. לכן יש כאן רק נתוני דוגמה.</li>
          <li><strong>מקור הנתונים:</strong> {source === 'supabase' ? 'Supabase. מה שמוסיפים כאן נשמר.' : 'נתוני דוגמה מקומיים. מה שמוסיפים כאן נעלם ברענון.'}</li>
        </ul>
      </Box>
    </div>
  )
}

const VIEW: Record<NonNullable<GuideStep['backstage']>, () => ReactNode> = { spec: Spec, schema: Schema, env: Env, launch: Launch }

export function Backstage({ step }: { step: GuideStep }) {
  const View = VIEW[step.backstage!]
  return (
    <div className="h-full overflow-y-auto bg-[#f5f5f5] p-5 text-[#111]">
      <h2 className="text-lg font-bold">{step.title}</h2>
      <p className="mb-4 text-sm text-[#777]">{step.subtitle}</p>
      <View />
    </div>
  )
}
