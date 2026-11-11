import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OfficeFlow } from '@/components/OfficeFlow'
import { GUIDE_STEPS } from '@/data/guideSteps'
import { useGuide } from '@/lib/guide'
import { useStore } from '@/lib/store'
import { daysUntil, formatShekel } from '@/lib/utils'

// דף הבית. העיצוב שלו שונה משני המוצרים שהוא מציג: בהיר, דיו רך, משקלים קלים,
// וצבע רק עם תפקיד: אדום לבעיה, ירוק לפתרון, מרקר צהוב לתובנה.

const Mark = ({ children }: { children: ReactNode }) => (
  <span className="font-semibold" style={{ background: 'linear-gradient(transparent 58%, #FFF3A3 58%)' }}>{children}</span>
)
const body = 'text-[clamp(0.95rem,1.1vw,1.3rem)] leading-relaxed'
const label = 'text-[clamp(0.7rem,0.75vw,0.9rem)] font-semibold tracking-[0.18em] text-[#8A8882]'
const section = 'mx-auto w-full max-w-[1900px] px-[4vw] py-[clamp(2rem,3.5vw,4.5rem)]'

export function Home() {
  const { clients, projects, tasks, documents, loading } = useStore()
  const guide = useGuide()
  const navigate = useNavigate()

  const openTasks = tasks.filter((t) => t.stage !== 'done')
  const urgent = openTasks.filter((t) => t.due_date && daysUntil(t.due_date) <= 7).length
  const withClient = openTasks.filter((t) => projects.find((p) => p.id === t.project_id)?.client_id).length
  const imported = documents.reduce((sum, d) => sum + (d.extracted_data?.imported ?? 0), 0)
  const openProjects = projects.filter((p) => p.status !== 'done')
  const income = formatShekel(openProjects.reduce((sum, p) => sum + Number(p.budget), 0))
  const nearest = openProjects.filter((p) => p.deadline).map((p) => daysUntil(p.deadline!)).filter((d) => d >= 0).sort((a, b) => a - b)[0]
  const n = (value: number | string) => (loading ? '…' : value)

  const enterApp = () => {
    guide.close()
    navigate('/dashboard')
  }

  const steps = [
    { title: 'הכול במקום אחד', number: n(clients.length + projects.length + tasks.length), text: 'רשומות חיות של לקוחות, פרויקטים ומשימות, שקשורות זו לזו. פותחים לקוח ורואים את הפרויקטים שלו. פותחים פרויקט ורואים את המשימות שלו.' },
    { title: 'רואים מה דחוף', number: n(urgent), text: 'משימות שהיעד שלהן עבר, או שיגיע בתוך שבוע. הדשבורד וציר הזמן מחשבים את זה לבד, ולכן אין מה לשכוח לעדכן.' },
    { title: 'ההודעה כבר כתובה', number: n(withClient), text: 'משימות פתוחות שמחכה להן הודעה מנוסחת ללקוח, לפי השלב שבו הן נמצאות. נשאר רק לבחור: מייל או WhatsApp.' },
    { title: 'מרשימה לנתונים', number: n(imported), text: 'שורות שנכנסו מקובצי Excel. האפליקציה מזהה את העמודות, מראה תצוגה מקדימה, ומדלגת על מה שכבר קיים.' },
  ]

  const pages: { to: string; name: string; line: string; number: string | number; guide?: boolean }[] = [
    { to: '/dashboard', name: 'דשבורד', line: 'הכנסה צפויה מפרויקטים פתוחים', number: n(income) },
    { to: '/projects', name: 'פרויקטים', line: 'פרויקטים, ודף לכל אחד', number: n(projects.length) },
    { to: '/clients', name: 'לקוחות', line: 'לקוחות, ודף לכל אחד', number: n(clients.length) },
    { to: '/tasks', name: 'לוח משימות', line: 'משימות פתוחות בלוח', number: n(openTasks.length) },
    { to: '/timeline', name: 'ציר זמן', line: 'ימים עד היעד הקרוב', number: n(nearest ?? '—') },
    { to: '/upload', name: 'ייבוא מאקסל', line: 'קבצים שיובאו עד עכשיו', number: n(documents.length) },
    { to: '/guide', name: 'מדריך בנייה', line: 'שלבים, ולכל אחד פרומפט', number: GUIDE_STEPS.length, guide: true },
  ]

  return (
    <div className="h-dvh overflow-y-auto bg-white font-light text-[#2E2E2B]">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white/95 px-[4vw] py-3 shadow-[0_1px_0_#E7E5E0] backdrop-blur">
        <Link to="/" dir="ltr" className="text-[clamp(1rem,1.2vw,1.4rem)] font-semibold tracking-[0.12em]">ARCHI·TACT</Link>
        <nav className="flex gap-2 text-[clamp(0.75rem,0.95vw,1.1rem)]">
          <button onClick={enterApp} className="w-[8.5em] bg-[#2E2E2B] py-2 font-normal text-white shadow-sm transition-shadow hover:shadow-lg">כניסה לאפליקציה</button>
          <Link to="/guide" className="w-[8.5em] bg-[#FFF3A3] py-2 text-center font-normal shadow-sm transition-shadow hover:shadow-lg">מצב הדרכה</Link>
        </nav>
      </header>

      {/* פתיח: טור התובנה מול הסרטון, ביחס זהוב */}
      <section className="mx-auto grid w-full max-w-[1900px] items-center gap-[3vw] px-[4vw] py-[clamp(1.5rem,4vh,3.5rem)] lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)]">
        <div className="space-y-[2.2vh]">
          <p className={label}>ניהול משרד אדריכלים · כלי הוראה</p>
          <h1 className="text-[clamp(2.1rem,4.1vw,5.6rem)] font-light leading-[1.1]">
            אפליקציה ש<Mark>מלמדת</Mark> איך בנו אותה
          </h1>
          <p className={body}>משרד אדריכלים שלם במסך אחד, ולצידו הפרומפטים שבנו כל מסך.</p>
          <div className="grid gap-2 text-[clamp(0.85rem,0.95vw,1.1rem)] leading-snug sm:grid-cols-3">
            <p className="bg-[#FBEDEA] p-3"><strong className="block font-semibold text-[#A8402F]">הבעיה</strong>המשרד מפוזר בין אקסל, מיילים ו-WhatsApp.</p>
            <p className="bg-[#EAF4EE] p-3"><strong className="block font-semibold text-[#2E6B4F]">הפתרון</strong>מקום אחד ללקוחות, לפרויקטים ולמשימות.</p>
            <p className="bg-[#FFF9D6] p-3"><strong className="block font-semibold">התובנה</strong>{GUIDE_STEPS.length} פרומפטים מספיקים כדי לבנות אותו.</p>
          </div>
          <div className="flex gap-2 text-[clamp(0.85rem,1vw,1.2rem)]">
            <button onClick={enterApp} className="w-[10em] bg-[#2E2E2B] py-3 font-normal text-white shadow-sm transition-shadow hover:shadow-lg">כניסה לאפליקציה</button>
            <Link to="/guide" className="w-[10em] bg-[#FFF3A3] py-3 text-center font-normal shadow-sm transition-shadow hover:shadow-lg">איך בונים אותה</Link>
          </div>
        </div>
        <figure>
          <video controls preload="metadata" poster="/demo-poster.jpg" className="aspect-[16/10] w-full bg-[#0F1829] shadow-[0_18px_50px_rgba(46,46,43,0.22)]">
            <source src="/demo.mp4" type="video/mp4" />
          </video>
          <figcaption className="mt-2 flex flex-wrap justify-between gap-x-6 text-[clamp(0.8rem,0.85vw,1rem)] text-[#6E6E6A]">
            <span className="font-normal text-[#2E2E2B]">דקה אחת: המשרד, והפרומפטים שבנו אותו.</span>
            <span>מוזיקה: Bossa Antigua, Kevin MacLeod (incompetech.com), CC BY 4.0</span>
          </figcaption>
        </figure>
      </section>

      {/* שורת התובנה והאובייקט */}
      <section className="bg-[#FBFAF7]">
        <div className={section}>
          <p className={label}>התובנה</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-[1.5vw] text-[clamp(1.6rem,2.8vw,3.6rem)] font-light leading-tight">
            <span className="text-[clamp(3.5rem,7vw,9rem)] font-light leading-none">{GUIDE_STEPS.length}</span>
            <span>פרומפטים בונים את <Mark>כל מה שרואים כאן</Mark>.</span>
          </p>
          <p className={`${body} mt-3 max-w-[60ch]`}>כל פרומפט מתאר מה המסך צריך לעשות, בעברית ובלי קוד. Claude Code בונה, והאפליקציה שמולכם היא התוצאה.</p>
          <div className="mt-[clamp(1.5rem,3vw,3.5rem)]"><OfficeFlow /></div>
        </div>
      </section>

      {/* הסיפור בצעדים */}
      <section className={section}>
        <p className={label}>מה האפליקציה עושה למשרד</p>
        <div className="mt-4 grid gap-[2vw] md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step.title} className="flex flex-col gap-2 border-t-2 border-[#2E2E2B] pt-4">
              <p className="text-[clamp(0.75rem,0.8vw,0.95rem)] text-[#8A8882]">צעד {index + 1}</p>
              <p className="text-[clamp(3rem,5vw,6.5rem)] font-light leading-none tabular-nums">{step.number}</p>
              <h2 className="text-[clamp(1.15rem,1.5vw,1.9rem)] font-semibold">{step.title}</h2>
              <p className={body}>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* מפת התוכן */}
      <section className="bg-[#FBFAF7]">
        <div className={section}>
          <p className={label}>מפת האפליקציה</p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {pages.map((page) => (
              <Link
                key={page.to}
                to={page.to}
                onClick={() => !page.guide && guide.close()}
                className={`flex min-h-[9.5em] flex-col justify-between p-4 shadow-sm transition-shadow hover:shadow-lg ${page.guide ? 'bg-[#FFF3A3]' : 'bg-white'}`}
              >
                <span className="text-[clamp(1rem,1.15vw,1.4rem)] font-semibold">{page.name}</span>
                <span>
                  <span className="block text-[clamp(1.5rem,2.2vw,2.8rem)] font-light leading-none tabular-nums">{page.number}</span>
                  <span className="mt-1 block text-[clamp(0.75rem,0.8vw,0.95rem)] text-[#6E6E6A]">{page.line}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* שכבת המוזיאון: ציטוט, הייקו, ודוגמה מהעיר */}
      <section className={`${section} grid gap-[3vw] lg:grid-cols-3`}>
        <figure>
          <p className={label}>ציטוט</p>
          <blockquote className="mt-3 text-[clamp(1.3rem,1.9vw,2.4rem)] font-light leading-snug">"הצורה לעולם הולכת אחר התפקיד."</blockquote>
          <figcaption className="mt-3 text-[clamp(0.8rem,0.85vw,1rem)] leading-relaxed text-[#6E6E6A]">
            לואי סאליבן (Louis Sullivan), "בניין המשרדים הגבוה, מבט אמנותי", 1896. תרגום חופשי.
            <span className="block">במקור: "Form ever follows function".</span>
          </figcaption>
        </figure>
        <div>
          <p className={label}>הייקו</p>
          <p className="mt-3 whitespace-pre-line text-[clamp(1.3rem,1.9vw,2.4rem)] font-light leading-snug">{'שולחן עמוס דפים\nשורה אחת של בקשה\nוהלוח מתבהר'}</p>
        </div>
        <div>
          <p className={label}>דוגמה מהעיר</p>
          <p className={`${body} mt-3`}>
            גם מחלקת רישוי עירונית מנהלת עשרות תיקי היתר במקביל.
            <span className="block font-semibold">אותו לוח של שלוש עמודות מראה איזה תיק מחכה ליועץ, ואיזה מחכה ליזם.</span>
            מה שעובד למשרד של חמישה אנשים עובד גם לאגף שלם.
          </p>
        </div>
      </section>

      <footer className="flex flex-wrap justify-between gap-2 px-[4vw] py-5 text-[clamp(0.75rem,0.8vw,0.95rem)] text-[#8A8882] shadow-[0_-1px_0_#E7E5E0]">
        <span>השראה: לוח Kanban של טויוטה, ותרשימי הזרימה של שארל מינאר (Charles Minard).</span>
        <span>A&I · אד׳ ענת שטיבלמן</span>
      </footer>
    </div>
  )
}
