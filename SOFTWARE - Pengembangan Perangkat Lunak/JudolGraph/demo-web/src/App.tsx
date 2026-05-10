import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ToastProvider } from './components/ToastProvider'

const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const CasesPage = lazy(() =>
  import('./pages/CasesPage').then((module) => ({ default: module.CasesPage })),
)
const EvidenceGraphPage = lazy(() =>
  import('./pages/EvidenceGraphPage').then((module) => ({
    default: module.EvidenceGraphPage,
  })),
)
const EntityDetailPage = lazy(() =>
  import('./pages/EntityDetailPage').then((module) => ({
    default: module.EntityDetailPage,
  })),
)
const ScreenshotsPage = lazy(() =>
  import('./pages/ScreenshotsPage').then((module) => ({
    default: module.ScreenshotsPage,
  })),
)
const ReportPage = lazy(() =>
  import('./pages/ReportPage').then((module) => ({ default: module.ReportPage })),
)
const MobilePreviewPage = lazy(() =>
  import('./pages/MobilePreviewPage').then((module) => ({
    default: module.MobilePreviewPage,
  })),
)
const CrawlerPage = lazy(() =>
  import('./pages/CrawlerPage').then((module) => ({ default: module.CrawlerPage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500">
      Memuat JudolGraph...
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<LandingPage />} path="/" />
            <Route element={<AppShell />} path="/app">
              <Route element={<Navigate replace to="/app/dashboard" />} index />
              <Route element={<DashboardPage />} path="dashboard" />
              <Route element={<CasesPage />} path="cases" />
              <Route element={<EvidenceGraphPage />} path="evidence-graph" />
              <Route element={<EntityDetailPage />} path="entities/:id" />
              <Route element={<ScreenshotsPage />} path="screenshots" />
              <Route element={<ReportPage />} path="reports" />
              <Route element={<MobilePreviewPage />} path="mobile-preview" />
              <Route element={<CrawlerPage />} path="crawler" />
              <Route element={<SettingsPage />} path="settings" />
            </Route>
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  )
}
