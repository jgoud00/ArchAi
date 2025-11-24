import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, Settings, LogOut, User, BookOpen, Shield, X, Calendar, FileText } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { Button } from '../ui/Button'
import { ShowIfHasRole } from '../RoleGuard'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/templates', icon: FileText, label: 'Templates' },
  { path: '/documentation', icon: BookOpen, label: 'Docs' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  onClose?: () => void
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    onClose?.()
  }

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">ArchitectAI</h1>
          <p className="text-sm text-muted-foreground mt-1">Construction Management</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
        
        {/* Admin Panel - Only visible to admins */}
        <ShowIfHasRole requiredRole="admin">
          <button
            onClick={() => handleNavigate('/admin')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              location.pathname === '/admin'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Shield className="h-5 w-5" />
            Admin Panel
          </button>
        </ShowIfHasRole>
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground">
          <User className="h-5 w-5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {user?.displayName || 'Guest'}
            </p>
            <p className="text-xs truncate">
              {user?.email || 'No email'}
            </p>
            {user?.role && (
              <p className="text-xs mt-1">
                <span className="px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary">
                  {user.role}
                </span>
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}