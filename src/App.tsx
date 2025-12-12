import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useEffect, lazy, Suspense } from 'react'

// Static imports for critical path - eliminates skeleton loading delay
import { MainLayout } from './components/layout/MainLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ConfigError } from './components/ConfigError'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageSkeleton } from './components/ui/Skeleton'
import { isSupabaseConfigured } from './services/supabase'

// Critical auth pages - loaded immediately (small bundles)
import Login from './pages/Login'
import Signup from './pages/Signup'
import { Home } from './pages/Home'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Logout } from './pages/Logout'

// Core app pages - loaded immediately for instant navigation
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'

// Lazy load only heavy/rarely-used pages
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })))
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })))
const IssuesList = lazy(() => import('./pages/projects/IssuesList').then(m => ({ default: m.IssuesList })))
const NewIssue = lazy(() => import('./pages/projects/NewIssue').then(m => ({ default: m.NewIssue })))
const IssueDetail = lazy(() => import('./pages/projects/IssueDetail').then(m => ({ default: m.IssueDetail })))
const ProgressPhotos = lazy(() => import('./pages/projects/ProgressPhotos').then(m => ({ default: m.ProgressPhotos })))
const BudgetPage = lazy(() => import('./pages/projects/Budget').then(m => ({ default: m.BudgetPage })))
const AddExpense = lazy(() => import('./pages/projects/AddExpense').then(m => ({ default: m.AddExpense })))
const Documents = lazy(() => import('./pages/projects/Documents').then(m => ({ default: m.Documents })))
const LayoutPlanner = lazy(() => import('./pages/projects/LayoutPlanner'))
const Inventory = lazy(() => import('./pages/projects/Inventory').then(m => ({ default: m.Inventory })))
const NewInventoryItem = lazy(() => import('./pages/projects/NewInventoryItem').then(m => ({ default: m.NewInventoryItem })))
const EditInventoryItem = lazy(() => import('./pages/projects/EditInventoryItem').then(m => ({ default: m.EditInventoryItem })))
const Timeline = lazy(() => import('./pages/projects/Timeline').then(m => ({ default: m.Timeline })))
const NewTask = lazy(() => import('./pages/projects/NewTask').then(m => ({ default: m.NewTask })))

// Heavy 3D/CAD components - must be lazy
const ModelViewer = lazy(() => import('./pages/ModelViewer'))
const BlueprintSketcher = lazy(() => import('./pages/projects/BlueprintSketcher').then(m => ({ default: m.BlueprintSketcher })))
const ThreeDViewerPage = lazy(() => import('./pages/ThreeDViewerPage').then(m => ({ default: m.ThreeDViewerPage })))

// Document-heavy pages - lazy load
const Templates = lazy(() => import('./pages/Templates').then(m => ({ default: m.Templates })))
const Documentation = lazy(() => import('./pages/Documentation').then(m => ({ default: m.Documentation })))
const SpreadsheetList = lazy(() => import('./pages/SpreadsheetList'))
const Spreadsheet = lazy(() => import('./pages/Spreadsheet'))
const DocumentList = lazy(() => import('./pages/DocumentList'))
const DocumentEditor = lazy(() => import('./pages/DocumentEditor'))

/**
 * Main Application Component
 * Optimized: Critical routes use static imports for instant loading.
 * Only heavy pages (3D viewers, CAD, spreadsheets) use lazy loading.
 */
function App() {
  const { initializeAuth, user } = useAuthStore()

  useEffect(() => {
    if (isSupabaseConfigured()) {
      initializeAuth()
    } else {
      useAuthStore.setState({ loading: false })
    }
  }, [initializeAuth])

  if (!isSupabaseConfigured()) {
    return <ConfigError />
  }

  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public routes - static imports, instant load */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
          />
          <Route
            path="/forgot-password"
            element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
          />
          <Route
            path="/reset-password"
            element={user ? <Navigate to="/dashboard" replace /> : <ResetPassword />}
          />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Core pages - static imports, no skeleton */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="logout" element={<Logout />} />

            <Route path="calendar" element={
              <Suspense fallback={<PageSkeleton />}>
                <Calendar />
              </Suspense>
            } />

            {/* Lazy pages wrapped in Suspense */}
            <Route path="admin" element={
              <Suspense fallback={<PageSkeleton />}>
                <AdminPanel />
              </Suspense>
            } />

            {/* Project routes */}
            <Route path="projects/:id" element={
              <Suspense fallback={<PageSkeleton />}>
                <ProjectDetail />
              </Suspense>
            } />
            <Route path="projects/:id/issues" element={
              <Suspense fallback={<PageSkeleton />}>
                <IssuesList />
              </Suspense>
            } />
            <Route path="projects/:id/issues/new" element={
              <Suspense fallback={<PageSkeleton />}>
                <NewIssue />
              </Suspense>
            } />
            <Route path="projects/:id/issues/:issueId" element={
              <Suspense fallback={<PageSkeleton />}>
                <IssueDetail />
              </Suspense>
            } />
            <Route path="projects/:id/progress" element={
              <Suspense fallback={<PageSkeleton />}>
                <ProgressPhotos />
              </Suspense>
            } />
            <Route path="projects/:id/budget" element={
              <Suspense fallback={<PageSkeleton />}>
                <BudgetPage />
              </Suspense>
            } />
            <Route path="projects/:id/budget/add-expense" element={
              <Suspense fallback={<PageSkeleton />}>
                <AddExpense />
              </Suspense>
            } />
            <Route path="projects/:id/documents" element={
              <Suspense fallback={<PageSkeleton />}>
                <Documents />
              </Suspense>
            } />
            <Route path="projects/:id/layout" element={
              <Suspense fallback={<PageSkeleton />}>
                <LayoutPlanner />
              </Suspense>
            } />
            <Route path="projects/:id/inventory" element={
              <Suspense fallback={<PageSkeleton />}>
                <Inventory />
              </Suspense>
            } />
            <Route path="projects/:id/inventory/new" element={
              <Suspense fallback={<PageSkeleton />}>
                <NewInventoryItem />
              </Suspense>
            } />
            <Route path="projects/:id/inventory/:itemId/edit" element={
              <Suspense fallback={<PageSkeleton />}>
                <EditInventoryItem />
              </Suspense>
            } />
            <Route path="projects/:id/timeline" element={
              <Suspense fallback={<PageSkeleton />}>
                <Timeline />
              </Suspense>
            } />
            <Route path="projects/:id/timeline/new-task" element={
              <Suspense fallback={<PageSkeleton />}>
                <NewTask />
              </Suspense>
            } />

            {/* Heavy 3D/CAD - must lazy load with error boundary */}
            <Route path="projects/:id/blueprint" element={
              <ErrorBoundary>
                <Suspense fallback={<PageSkeleton />}>
                  <BlueprintSketcher />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="projects/:id/viewer" element={
              <ErrorBoundary>
                <Suspense fallback={<PageSkeleton />}>
                  <ModelViewer />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="3d-viewer" element={
              <ErrorBoundary>
                <Suspense fallback={<PageSkeleton />}>
                  <ThreeDViewerPage />
                </Suspense>
              </ErrorBoundary>
            } />

            {/* Document tools */}
            <Route path="spreadsheets" element={
              <Suspense fallback={<PageSkeleton />}>
                <SpreadsheetList />
              </Suspense>
            } />
            <Route path="spreadsheets/:id" element={
              <Suspense fallback={<PageSkeleton />}>
                <Spreadsheet />
              </Suspense>
            } />
            <Route path="documents" element={
              <Suspense fallback={<PageSkeleton />}>
                <DocumentList />
              </Suspense>
            } />
            <Route path="documents/:id" element={
              <Suspense fallback={<PageSkeleton />}>
                <DocumentEditor />
              </Suspense>
            } />

            <Route path="templates" element={
              <ErrorBoundary>
                <Suspense fallback={<PageSkeleton />}>
                  <Templates />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="documentation" element={
              <ErrorBoundary>
                <Suspense fallback={<PageSkeleton />}>
                  <Documentation />
                </Suspense>
              </ErrorBoundary>
            } />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App