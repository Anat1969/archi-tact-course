import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { GUIDE_STEPS } from '@/data/guideSteps'

interface Guide {
  on: boolean
  step: number
  open: (step?: number) => void
  close: () => void
  go: (step: number) => void
}

const GuideContext = createContext<Guide | null>(null)
const KEY = 'architact-guide'

function load(): { on: boolean; step: number } {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { on: saved.on === true, step: Number.isInteger(saved.step) ? Math.min(Math.max(saved.step, 0), GUIDE_STEPS.length - 1) : 0 }
  } catch {
    return { on: false, step: 0 }
  }
}

export function GuideProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [state, setState] = useState(load)

  const update = useCallback((next: { on: boolean; step: number }) => {
    setState(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // בלי אחסון מקומי המדריך פשוט לא יזכור את השלב
    }
  }, [])

  const go = useCallback(
    (step: number) => {
      const index = Math.min(Math.max(step, 0), GUIDE_STEPS.length - 1)
      update({ on: true, step: index })
      const route = GUIDE_STEPS[index].route
      if (route) navigate(route)
    },
    [navigate, update],
  )

  const value = useMemo<Guide>(
    () => ({ ...state, go, open: (step) => go(step ?? state.step), close: () => update({ ...state, on: false }) }),
    [state, go, update],
  )
  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>
}

export function useGuide() {
  const guide = useContext(GuideContext)
  if (!guide) throw new Error('useGuide חייב לרוץ בתוך GuideProvider')
  return guide
}
