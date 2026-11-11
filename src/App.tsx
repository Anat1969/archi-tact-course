import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { GUIDE_STEPS } from '@/data/guideSteps'
import { GuideProvider, useGuide } from '@/lib/guide'
import { StoreProvider } from '@/lib/store'
import { ClientDetail } from '@/pages/ClientDetail'
import { Clients } from '@/pages/Clients'
import { Dashboard } from '@/pages/Dashboard'
import { Home } from '@/pages/Home'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { Projects } from '@/pages/Projects'
import { Tasks } from '@/pages/Tasks'
import { Timeline } from '@/pages/Timeline'
import { Upload } from '@/pages/Upload'

// הכתובת /guide פותחת את האפליקציה במצב הדרכה
function GuideEntry() {
  const guide = useGuide()
  useEffect(() => {
    guide.open()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Navigate to={GUIDE_STEPS[guide.step].route} replace />
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <GuideProvider>
          <Routes>
            <Route index element={<Home />} />
            <Route path="guide" element={<GuideEntry />} />
            <Route element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="guide/:key" element={null} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="upload" element={<Upload />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </GuideProvider>
      </BrowserRouter>
    </StoreProvider>
  )
}
