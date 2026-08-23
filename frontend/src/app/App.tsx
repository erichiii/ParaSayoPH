import { Outlet, Route, Routes } from 'react-router'
import { SiteFooter } from '../components/ui/SiteFooter'
import { ExplorePage } from '../pages/ExplorePage'
import { LandingPage } from '../pages/LandingPage'
import { MatchmakerPage } from '../pages/MatchmakerPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ProgramCardPreviewPage } from '../pages/ProgramCardPreviewPage'
import { ProgramDetailPage } from '../pages/ProgramDetailPage'
import { ResultsPage } from '../pages/ResultsPage'
import { ResultsPreviewPage } from '../pages/ResultsPreviewPage'

function PrimaryLayout() {
  return (
    <div className="ps-site-layout">
      <Outlet />
      <SiteFooter />
    </div>
  )
}

export function App() {
  return (
    <Routes>
      <Route element={<PrimaryLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/matchmaker" element={<MatchmakerPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/programs/:id" element={<ProgramDetailPage />} />
      </Route>
      {import.meta.env.DEV ? (
        <>
          <Route path="/_preview/program-cards" element={<ProgramCardPreviewPage />} />
          <Route path="/_preview/results" element={<ResultsPreviewPage />} />
        </>
      ) : null}
      <Route path="*" element={<PlaceholderPage title="Page not found" />} />
    </Routes>
  )
}
