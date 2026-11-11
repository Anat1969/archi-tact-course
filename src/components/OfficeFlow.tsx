import { useEffect, useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { formatShekel } from '@/lib/utils'
import { TASK_STAGES, TASK_STAGE_LABEL, type TaskStage } from '@/types'

// האובייקט של דף הבית: זרימת המשרד, מלקוח לפרויקט ולשלב שבו המשימות נמצאות.
// הוא בנוי מהנתונים החיים של האפליקציה, מגיב לריחוף, והמקרא שלצידו מסונכרן איתו.

type Active = { kind: 'client' | 'project' | 'stage'; id: string }
const INK = '#2E2E2B'
const REST = '#D8D5CE'
const W = 1000
const cut = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)
const spread = (count: number, height: number) => Array.from({ length: count }, (_, i) => ((i + 0.5) * height) / Math.max(count, 1))

export function OfficeFlow() {
  const { clients, projects, tasks } = useStore()
  const shownClients = useMemo(() => clients.filter((c) => projects.some((p) => p.client_id === c.id)).slice(0, 10), [clients, projects])
  const shownProjects = useMemo(() => projects.filter((p) => shownClients.some((c) => c.id === p.client_id)).slice(0, 12), [projects, shownClients])
  const [cycle, setCycle] = useState(() => Math.floor(Math.random() * 10))
  const [hover, setHover] = useState<Active | null>(null)

  // בלי ריחוף, ההדגשה עוברת מלקוח ללקוח. נקודת הפתיחה שונה בכל כניסה.
  useEffect(() => {
    if (hover) return
    const timer = setInterval(() => setCycle((value) => value + 1), 3500)
    return () => clearInterval(timer)
  }, [hover])

  if (shownClients.length === 0) return <p className="text-[#6E6E6A]">כשיהיו לקוחות ופרויקטים, הזרימה שלהם תופיע כאן.</p>

  const active: Active = hover ?? { kind: 'client', id: shownClients[cycle % shownClients.length].id }
  const H = Math.max(shownProjects.length, shownClients.length, 6) * 44
  const yClient = spread(shownClients.length, H)
  const yProject = spread(shownProjects.length, H)
  const yStage = spread(TASK_STAGES.length, H)
  const maxBudget = Math.max(1, ...shownProjects.map((p) => Number(p.budget)))
  const tasksOf = (projectId: string, stage?: TaskStage) => tasks.filter((t) => t.project_id === projectId && (!stage || t.stage === stage))

  const litProjects = new Set(
    shownProjects
      .filter((p) =>
        active.kind === 'client' ? p.client_id === active.id : active.kind === 'project' ? p.id === active.id : tasksOf(p.id, active.id as TaskStage).length > 0,
      )
      .map((p) => p.id),
  )
  const litClients = new Set(shownProjects.filter((p) => litProjects.has(p.id)).map((p) => p.client_id))
  const litStages = new Set(active.kind === 'stage' ? [active.id] : TASK_STAGES.filter((stage) => [...litProjects].some((id) => tasksOf(id, stage).length > 0)))

  const litList = shownProjects.filter((p) => litProjects.has(p.id))
  const openCount = litList.reduce((sum, p) => sum + tasksOf(p.id).filter((t) => t.stage !== 'done').length, 0)
  const budget = formatShekel(litList.reduce((sum, p) => sum + Number(p.budget), 0))
  const title =
    active.kind === 'client' ? clients.find((c) => c.id === active.id)?.name : active.kind === 'project' ? projects.find((p) => p.id === active.id)?.name : `שלב: ${TASK_STAGE_LABEL[active.id as TaskStage]}`
  const story =
    active.kind === 'stage'
      ? `${litList.length} פרויקטים מחזיקים עכשיו משימות בשלב הזה.`
      : `${litList.length === 1 ? 'פרויקט אחד' : `${litList.length} פרויקטים`}, בהיקף ${budget}, עם ${openCount} משימות פתוחות.`

  const curve = (x1: number, y1: number, x2: number, y2: number) => `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`
  const handlers = (target: Active) => ({
    onMouseEnter: () => setHover(target),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(target),
    onBlur: () => setHover(null),
  })

  return (
    <div className="grid items-center gap-[3vw] lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]">
      <div className="space-y-4">
        <p className="text-[clamp(0.9rem,1vw,1.15rem)] leading-relaxed text-[#6E6E6A]">
          כל קו הוא קשר: מלקוח לפרויקט, ומפרויקט לשלב שבו המשימות שלו נמצאות.
          עובי הקו מימין הוא גודל התקציב, ומשמאל מספר המשימות.
        </p>
        <div className="min-h-[7.5em] border-r-4 border-[#2E2E2B] pr-4">
          <p className="text-[clamp(1.2rem,1.7vw,2rem)] font-semibold leading-tight">{title}</p>
          <p className="mt-1 text-[clamp(0.95rem,1.1vw,1.3rem)] leading-relaxed">{story}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {shownClients.map((client) => {
            const on = litClients.has(client.id)
            return (
              <button
                key={client.id}
                {...handlers({ kind: 'client', id: client.id })}
                className={`truncate px-3 py-2 text-right text-[clamp(0.8rem,0.9vw,1rem)] shadow-sm transition-colors ${on ? 'bg-[#2E2E2B] text-white' : 'bg-[#F4F2ED] text-[#2E2E2B] hover:bg-[#E9E6DF]'}`}
              >
                {client.name}
              </button>
            )
          })}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" style={{ direction: 'ltr' }} role="img" aria-label="זרימת המשרד: לקוחות, פרויקטים ושלבי משימות">
        {shownProjects.map((project, i) => {
          const ci = shownClients.findIndex((c) => c.id === project.client_id)
          const on = litProjects.has(project.id)
          return (
            <g key={project.id} style={{ transition: 'opacity .4s' }} opacity={on ? 1 : 0.35}>
              <path d={curve(770, yClient[ci], 612, yProject[i])} fill="none" stroke={on ? INK : REST} strokeWidth={2 + (10 * Number(project.budget)) / maxBudget} strokeLinecap="round" />
              {TASK_STAGES.map((stage, si) => {
                const count = tasksOf(project.id, stage).length
                if (!count) return null
                const lit = on && litStages.has(stage)
                return <path key={stage} d={curve(388, yProject[i], 192, yStage[si])} fill="none" stroke={lit ? INK : REST} strokeWidth={1.5 + 2.5 * count} strokeLinecap="round" opacity={lit || !on ? 1 : 0.4} />
              })}
            </g>
          )
        })}

        {shownClients.map((client, i) => {
          const on = litClients.has(client.id)
          return (
            <g key={client.id} {...handlers({ kind: 'client', id: client.id })} tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }}>
              <rect x={772} y={yClient[i] - 16} width={228} height={32} fill={on ? INK : '#F4F2ED'} />
              <text x={988} y={yClient[i] + 5} textAnchor="end" fontSize="15" fill={on ? '#fff' : INK}>{cut(client.name, 26)}</text>
            </g>
          )
        })}
        {shownProjects.map((project, i) => {
          const on = litProjects.has(project.id)
          return (
            <g key={project.id} {...handlers({ kind: 'project', id: project.id })} tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }}>
              <rect x={390} y={yProject[i] - 16} width={220} height={32} fill={on ? '#FFF3A3' : '#FBFAF7'} stroke={on ? INK : REST} />
              <text x={600} y={yProject[i] + 5} textAnchor="end" fontSize="14" fontWeight={on ? 600 : 400} fill={INK}>{cut(project.name, 27)}</text>
            </g>
          )
        })}
        {TASK_STAGES.map((stage, i) => {
          const on = litStages.has(stage)
          const count = tasks.filter((t) => t.stage === stage && shownProjects.some((p) => p.id === t.project_id)).length
          return (
            <g key={stage} {...handlers({ kind: 'stage', id: stage })} tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }}>
              <rect x={0} y={yStage[i] - 30} width={190} height={60} fill={on ? INK : '#F4F2ED'} />
              <text x={176} y={yStage[i] - 3} textAnchor="end" fontSize="17" fontWeight="600" fill={on ? '#fff' : INK}>{TASK_STAGE_LABEL[stage]}</text>
              <text x={176} y={yStage[i] + 18} textAnchor="end" fontSize="13" fill={on ? '#D8D5CE' : '#6E6E6A'}>{count} משימות</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
