import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Dashboard } from './pages/Dashboard'
import { ProjectDetail } from './pages/ProjectDetail'
import { Settings } from './pages/Settings'
import { Documentation } from './pages/Documentation'
import { AdminPanel } from './pages/AdminPanel'
import { IssuesList } from './pages/projects/IssuesList'
import { NewIssue } from './pages/projects/NewIssue'
import { IssueDetail } from './pages/projects/IssueDetail'
import { ProgressPhotos } from './pages/projects/ProgressPhotos'
import { BudgetPage } from './pages/projects/Budget'
import { AddExpense } from './pages/projects/AddExpense'
import { Documents } from './pages/projects/Documents'
import { BlueprintSketcher } from './pages/projects/BlueprintSketcher'
import { Inventory } from './pages/projects/Inventory'
import { NewInventoryItem } from './pages/projects/NewInventoryItem'
import { EditInventoryItem } from './pages/projects/EditInventoryItem'
import { Timeline } from './pages/projects/Timeline'
import { NewTask } from './pages/projects/NewTask'
import { ModelViewer } from './pages/ModelViewer'
import { Templates } from './pages/Templates'
import { Calendar } from './pages/Calendar'
import { Spinner } from './components/ui/Spinner'
import { ConfigError } from './components/ConfigError'
import { isSupabaseConfigured } from './services/supabase'

function App() {
  const { loading, initializeAuth, user } = useAuthStore()

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

  // Don't block on loading - initializeAuth sets loading to false immediately
  // This prevents infinite loading issues
  // The router will handle auth state properly via ProtectedRoute

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public routes */}
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
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
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
          <Route path="projects/:id/sketch" element={<BlueprintSketcher />} />
          <Route path="projects/:id/viewer" element={<ModelViewer />} />
          <Route path="projects/:id/inventory" element={<Inventory />} />
          <Route path="projects/:id/inventory/new" element={<NewInventoryItem />} />
          <Route path="projects/:id/inventory/:itemId/edit" element={<EditInventoryItem />} />
          <Route path="projects/:id/timeline" element={<Timeline />} />
          <Route path="projects/:id/timeline/new-task" element={<NewTask />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="templates" element={<Templates />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App