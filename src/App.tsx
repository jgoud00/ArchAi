import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect, lazy, Suspense } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ConfigError } from './components/ConfigError'
import { isSupabaseConfigured } from './services/supabase'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Spinner } from './components/ui/Spinner'

// Lazy load pages to improve initial load time
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.default })))
const Signup = lazy(() => import('./pages/Signup').then(module => ({ default: module.default })))
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })))
const Logout = lazy(() => import('./pages/Logout').then(module => ({ default: module.Logout })))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })))
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(module => ({ default: module.ResetPassword })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail').then(module => ({ default: module.ProjectDetail })))
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })))
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(module => ({ default: module.AdminPanel })))
const IssuesList = lazy(() => import('./pages/projects/IssuesList').then(module => ({ default: module.IssuesList })))
const NewIssue = lazy(() => import('./pages/projects/NewIssue').then(module => ({ default: module.NewIssue })))
const IssueDetail = lazy(() => import('./pages/projects/IssueDetail').then(module => ({ default: module.IssueDetail })))
const ProgressPhotos = lazy(() => import('./pages/projects/ProgressPhotos').then(module => ({ default: module.ProgressPhotos })))
const BudgetPage = lazy(() => import('./pages/projects/Budget').then(module => ({ default: module.BudgetPage })))
const AddExpense = lazy(() => import('./pages/projects/AddExpense').then(module => ({ default: module.AddExpense })))
const Documents = lazy(() => import('./pages/projects/Documents').then(module => ({ default: module.Documents })))
const LayoutPlanner = lazy(() => import('./pages/projects/LayoutPlanner').then(module => ({ default: module.default })))
const Inventory = lazy(() => import('./pages/projects/Inventory').then(module => ({ default: module.Inventory })))
const NewInventoryItem = lazy(() => import('./pages/projects/NewInventoryItem').then(module => ({ default: module.NewInventoryItem })))
const EditInventoryItem = lazy(() => import('./pages/projects/EditInventoryItem').then(module => ({ default: module.EditInventoryItem })))
const Timeline = lazy(() => import('./pages/projects/Timeline').then(module => ({ default: module.Timeline })))
const NewTask = lazy(() => import('./pages/projects/NewTask').then(module => ({ default: module.NewTask })))
const Calendar = lazy(() => import('./pages/Calendar').then(module => ({ default: module.Calendar })))
const ModelViewer = lazy(() => import('./pages/ModelViewer'))
const Templates = lazy(() => import('./pages/Templates').then(module => ({ default: module.Templates })))
const Documentation = lazy(() => import('./pages/Documentation').then(module => ({ default: module.Documentation })))
const BlueprintSketcher = lazy(() => import('./pages/projects/BlueprintSketcher').then(module => ({ default: module.BlueprintSketcher })))

/**
 * Main Application Component
 * 
 * Architecture Note:
 * - Uses React Router for client-side routing
 * - Implements a top-level ErrorBoundary for global error handling
 * - Uses Suspense for lazy-loaded routes with a loading spinner
 * - ProtectedRoute wrapper handles authentication guards
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

  // Show config error if Supabase is not configured
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
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen bg-background">
            <Spinner size="lg" />
          </div>
        }>
          <Routes>
            {/* Public routes */}
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

            {/* Protected routes - using a wrapper to avoid path conflict */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/issues" element={<IssuesList />} />
              <Route path="projects/:id/issues/new" element={<NewIssue />} />
              <Route path="projects/:id/issues/:issueId" element={<IssueDetail />} />
              <Route path="projects/:id/progress" element={<ProgressPhotos />} />
              <Route path="projects/:id/budget" element={<BudgetPage />} />
              <Route path="projects/:id/budget/add-expense" element={<AddExpense />} />
              <Route path="projects/:id/documents" element={<Documents />} />
              <Route path="projects/:id/layout" element={<LayoutPlanner />} />
              <Route path="projects/:id/blueprint" element={<BlueprintSketcher />} />

              {/* Lazy loaded routes with granular error boundaries */}
              <Route
                path="projects/:id/viewer"
                element={
                  <ErrorBoundary>
                    <ModelViewer />
                  </ErrorBoundary>
                }
              />

              <Route path="projects/:id/inventory" element={<Inventory />} />
              <Route path="projects/:id/inventory/new" element={<NewInventoryItem />} />
              <Route path="projects/:id/inventory/:itemId/edit" element={<EditInventoryItem />} />
              <Route path="projects/:id/timeline" element={<Timeline />} />
              <Route path="projects/:id/timeline/new-task" element={<NewTask />} />
              <Route path="calendar" element={<Calendar />} />

              <Route
                path="templates"
                element={
                  <ErrorBoundary>
                    <Templates />
                  </ErrorBoundary>
                }
              />

              <Route
                path="documentation"
                element={
                  <ErrorBoundary>
                    <Documentation />
                  </ErrorBoundary>
                }
              />

              <Route path="settings" element={<Settings />} />
              <Route path="logout" element={<Logout />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App