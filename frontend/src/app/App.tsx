import { Route, Routes } from 'react-router'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ProgramCardPreviewPage } from '../pages/ProgramCardPreviewPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderPage title="Home" />} />
      <Route path="/explore" element={<PlaceholderPage title="Explore" />} />
      <Route path="/matchmaker" element={<PlaceholderPage title="Matchmaker" />} />
      <Route path="/results" element={<PlaceholderPage title="Results" />} />
      <Route path="/programs/:id" element={<PlaceholderPage title="Program detail" />} />
      {import.meta.env.DEV ? (
        <Route path="/_preview/program-cards" element={<ProgramCardPreviewPage />} />
      ) : null}
      <Route path="*" element={<PlaceholderPage title="Page not found" />} />
    </Routes>
  )
}
