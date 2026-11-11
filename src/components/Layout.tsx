import { FileUp, FolderKanban, LayoutDashboard, ListChecks, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'דשבורד', icon: LayoutDashboard, title: 'דשבורד', subtitle: 'תמונת מצב של המשרד' },
  { to: '/projects', label: 'פרויקטים', icon: FolderKanban, title: 'פרויקטים', subtitle: 'כל הפרויקטים של המשרד' },
  { to: '/clients', label: 'לקוחות', icon: Users, title: 'לקוחות', subtitle: 'פרטי קשר ופרויקטים לכל לקוח' },
  { to: '/tasks', label: 'לוח משימות', icon: ListChecks, title: 'לוח משימות', subtitle: 'לביצוע, בתהליך, הושלם' },
  { to: '/upload', label: 'ייבוא מסמכים', icon: FileUp, title: 'ייבוא מסמכים', subtitle: 'העלאה, חילוץ נתונים ואישור' },
]

export function Layout() {
  const { pathname } = useLocation()
  const { source, loading, error } = useStore()
  const current = NAV.find((item) => item.to === pathname) ?? NAV[0]

  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <aside className="flex shrink-0 border-b border-border bg-sidebar md:w-48 md:flex-col lg:w-60 md:border-b-0 md:border-l">
        <NavLink to="/" dir="ltr" className="flex items-center justify-end px-5 py-4 text-lg font-bold tracking-wide md:py-6">
          ARCHI<span className="text-primary">·</span>TACT
        </NavLink>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto px-2 md:flex-col md:items-stretch md:overflow-visible md:px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold">{current.title}</h1>
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
