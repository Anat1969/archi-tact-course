import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { formatDate, formatShekel } from '@/lib/utils'

export function Dashboard() {
  const { projects, clients, tasks } = useStore()

  const open = projects.filter((p) => p.status !== 'done')
  const activeCount = projects.filter((p) => p.status === 'active').length
  const openTasks = tasks.filter((t) => t.stage !== 'done').length
  const expectedIncome = open.reduce((sum, p) => sum + Number(p.budget), 0)

  const stats = [
    { label: 'פרויקטים פעילים', value: String(activeCount) },
    { label: 'לקוחות', value: String(clients.length) },
    { label: 'משימות פתוחות', value: String(openTasks) },
    { label: 'הכנסה צפויה', value: formatShekel(expectedIncome), highlight: true },
  ]

  const byBudget = [...projects].sort((a, b) => Number(b.budget) - Number(a.budget))
  const maxBudget = Math.max(1, ...byBudget.map((p) => Number(p.budget)))
  const upcoming = [...open].filter((p) => p.deadline).sort((a, b) => a.deadline!.localeCompare(b.deadline!)).slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`mt-2 text-2xl font-bold sm:text-3xl ${stat.highlight ? 'text-primary' : ''}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>תקציב לפי פרויקט</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byBudget.map((project) => (
              <div key={project.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 text-sm">
                <span className="truncate">{project.name}</span>
                <span className="font-medium tabular-nums">{formatShekel(Number(project.budget))}</span>
                <div className="col-span-2 h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${project.status === 'done' ? 'bg-muted-foreground' : 'bg-primary'}`}
                    style={{ width: `${(Number(project.budget) / maxBudget) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">כחול: פרויקט פתוח. אפור: פרויקט שהושלם.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>תאריכי היעד הקרובים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((project) => (
              <div key={project.id} className="text-sm">
                <p className="font-medium">{project.name}</p>
                <p className="text-muted-foreground">{formatDate(project.deadline)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
