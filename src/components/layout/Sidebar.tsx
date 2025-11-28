
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, LogOut, User, BookOpen, Shield, X, Calendar, FileText, Home } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { Button } from '../ui/Button'
import { ShowIfHasRole } from '../RoleGuard'
import { Logo } from '../Logo'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/templates', icon: FileText, label: 'Templates' },
  { path: '/documentation', icon: BookOpen, label: 'Docs' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
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
    // Only close on mobile
    if (window.innerWidth < 1024) {
      onClose?.()
    }
  }

  return (
    <div className={cn(
      "bg-slate-900 border-r border-slate-800 flex flex-col h-screen transition-all duration-300",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className={cn(
        "p-6 border-b border-slate-800 flex items-center",
        isOpen ? "justify-between" : "justify-center"
      )}>
        <div className="flex items-center gap-3">
          <Logo size="md" showText={false} />
          {isOpen && (
            <div className="animate-in fade-in duration-300">
              <h1 className="text-2xl font-bold text-white">ArchitectAI</h1>
              <p className="text-sm text-slate-400 mt-1">Construction Management</p>
            </div>
          )}
        </div>
        {isOpen && onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => handleNavigate('/')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1 focus:ring-offset-slate-900",
            location.pathname === '/'
              ? "bg-cyan-900/30 text-cyan-300"
              : "text-slate-400 hover:bg-slate-800 hover:text-cyan-300",
            !isOpen && "justify-center px-2"
          )}
          title={!isOpen ? "Home" : undefined}
        >
          <Home className="h-5 w-5 flex-shrink-0" />
          {isOpen && <span>Home</span>}
        </button>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1 focus:ring-offset-slate-900",
                isActive
                  ? "bg-cyan-900/30 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-cyan-300",
                !isOpen && "justify-center px-2"
              )}
              title={!isOpen ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </button>
          )
        })}

        {/* Admin Panel - Only visible to admins */}
        <ShowIfHasRole requiredRole="admin">
          <button
            onClick={() => handleNavigate('/admin')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1 focus:ring-offset-slate-900",
              location.pathname === '/admin'
                ? "bg-cyan-900/30 text-cyan-300"
                : "text-slate-400 hover:bg-slate-800 hover:text-cyan-300",
              !isOpen && "justify-center px-2"
            )}
            title={!isOpen ? "Admin Panel" : undefined}
          >
            <Shield className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span>Admin Panel</span>}
          </button>
        </ShowIfHasRole>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 text-sm text-slate-400",
          !isOpen && "justify-center px-2"
        )}>
          <User className="h-5 w-5 flex-shrink-0" />
          {isOpen && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <p className="font-medium text-white truncate">
                {user?.displayName || 'Guest'}
              </p>
              <p className="text-xs truncate text-slate-500">
                {user?.email || 'No email'}
              </p>
              {user?.role && (
                <p className="text-xs mt-1">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-cyan-900/30 text-cyan-300">
                    {user.role}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "w-full gap-3 text-slate-400 hover:text-white hover:bg-slate-800",
            isOpen ? "justify-start" : "justify-center px-2"
          )}
          onClick={handleLogout}
          title={!isOpen ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}