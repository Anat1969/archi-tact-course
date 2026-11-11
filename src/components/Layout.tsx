import { CalendarRange, FileUp, FolderKanban, GraduationCap, LayoutDashboard, ListChecks, Users } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Backstage } from '@/components/Backstage'
import { GuidePanel } from '@/components/GuidePanel'
import { GUIDE_STEPS } from '@/data/guideSteps'
import { useGuide } from '@/lib/guide'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/dashboard', label: 'דשבורד', icon: LayoutDashboard, subtitle: 'תמונת מצב של המשרד' },
  { to: '/projects', label: 'פרויקטים', icon: FolderKanban, subtitle: 'כל הפרויקטים של המשרד' },
  { to: '/clients', label: 'לקוחות', icon: Users, subtitle: 'פרטי קשר ופרויקטים לכל לקוח' },
  { to: '/tasks', label: 'לוח משימות', icon: ListChecks, subtitle: 'לביצוע, בתהליך, הושלם' },
  { to: '/timeline', label: 'ציר זמן', icon: CalendarRange, subtitle: 'פרויקטים ויעדים לאורך הזמן' },
  { to: '/upload', label: 'ייבוא מאקסל', icon: FileUp, subtitle: 'מרשימה קיימת לנתונים חיים' },
]

// האפליקציה עצמה: כהה, navy וכחול
function AppShell({ compact }: { compact: boolean }) {
  const { pathname } = useLocation()
  const { source, loading, error } = useStore()
  const current = NAV.find((item) => pathname.startsWith(item.to)) ?? NAV[0]

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-background text-foreground md:flex-row">
      <aside className={cn('flex shrink-0 border-b border-border bg-sidebar md:flex-col md:border-b-0 md:border-l', compact ? 'md:w-44' : 'md:w-48 xl:w-60')}>
        <NavLink to="/" dir="ltr" className="flex items-center justify-end px-5 py-4 text-lg font-bold tracking-wide md:py-6">
          ARCHI<span className="text-primary">·</span>TACT
        </NavLink>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto px-2 md:flex-col md:items-stretch md:overflow-visible md:px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
        <p className="hidden px-5 py-4 text-xs text-muted-foreground md:block">
          מקור הנתונים: <span className="text-foreground">{source === 'supabase' ? 'Supabase' : 'נתוני דמו'}</span>
        </p>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold">{current.label}</h1>
            <p className="truncate text-sm text-muted-foreground">{current.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-left text-sm sm:block">
              <p className="font-medium">אדר' נועה שחר</p>
              <p className="text-xs text-muted-foreground">שחר אדריכלים</p>
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-primary font-bold text-primary-foreground">נ</div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-5 md:p-8">
          {error && <p className="mb-4 rounded-lg bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</p>}
          {loading ? <p className="text-muted-foreground">טוען נתונים...</p> : <Outlet />}
        </main>
      </div>
    </div>
  )
}

export function Layout() {
  const guide = useGuide()
  const { pathname } = useLocation()
  // הכתובת קובעת מה מוצג: /guide/<שם> הוא מסך "מאחורי הקלעים", וכל כתובת אחרת היא האפליקציה עצמה
  const backstageIndex = GUIDE_STEPS.findIndex((item) => item.backstage && item.route === pathname)
  useEffect(() => {
    if (backstageIndex >= 0 && (!guide.on || guide.step !== backstageIndex)) guide.go(backstageIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backstageIndex])

  if (!guide.on && backstageIndex < 0) {
    return (
      <div className="h-dvh">
        <AppShell compact={false} />
        <button
          onClick={() => guide.open()}
          className="fixed bottom-4 left-4 z-30 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#111] shadow-lg ring-2 ring-[#f0d060] transition hover:shadow-xl"
        >
          <GraduationCap className="size-4" aria-hidden /> מדריך בנייה
        </button>
      </div>
    )
  }

  const backstage = backstageIndex >= 0
  const step = GUIDE_STEPS[backstage ? backstageIndex : guide.step]

  // מצב הדרכה: המדריך הבהיר מימין, והאפליקציה החיה בתוך מסגרת דפדפן משמאל
  return (
    <div className="flex h-dvh flex-col bg-[#e4e4e4] lg:flex-row">
      <GuidePanel />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <p className="flex shrink-0 items-center gap-2 px-4 py-2 text-xs text-[#555]">
          <span className={cn('rounded px-2 py-0.5 font-bold text-[#111]', backstage ? 'bg-[#cfcfcf]' : 'bg-[#f0d060]')}>{backstage ? 'מאחורי הקלעים' : 'האפליקציה החיה'}</span>
          {backstage ? 'השלב הזה קורה מחוץ למסכי האפליקציה. המספרים נלקחים מהאפליקציה החיה.' : 'זו האפליקציה האמיתית. כל לחיצה כאן עובדת ונשמרת.'}
        </p>
        <div className="mx-3 mb-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg shadow-xl ring-1 ring-black/25">
          <div className="flex shrink-0 items-center gap-3 bg-[#2d2d2d] px-3 py-2" aria-hidden>
            <span className="flex gap-1.5" dir="ltr">
              <i className="size-2.5 rounded-full bg-[#ff5f57]" />
              <i className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <i className="size-2.5 rounded-full bg-[#27c93f]" />
            </span>
            <span dir="ltr" className="flex-1 truncate rounded bg-[#1a1a1a] px-3 py-1 text-center text-[11px] text-[#aaa]">
              {backstage ? 'מאחורי הקלעים' : `${window.location.host}${pathname}`}
            </span>
          </div>
          <div className="min-h-0 flex-1">{backstage ? <Backstage step={step} /> : <AppShell compact />}</div>
        </div>
      </div>
    </div>
  )
}
