import { memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, LogOut, User, BookOpen, Shield, X, Calendar, FileText, Home, Table2, FileEdit } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Button } from '../ui/Button'
import { ShowIfHasRole } from '../RoleGuard'
import { Logo } from '../Logo'
import { logger } from '@/utils/logger'
import { Tooltip } from '../ui/Tooltip'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/spreadsheets', icon: Table2, label: 'Spreadsheets' },
  { path: '/documents', icon: FileEdit, label: 'Documents' },
  { path: '/templates', icon: FileText, label: 'Templates' },
  { path: '/documentation', icon: BookOpen, label: 'Docs' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar = memo(({ isOpen = true, onClose }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      logger.error('Logout error', error)
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
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col h-screen transition-all duration-300 ease-in-out relative z-40 will-change-[width]",
        isOpen ? "w-64" : "w-20"
      )}
      aria-label="Main navigation"
    >

      <div className={cn(
        "p-6 border-b border-border/50 flex items-center",
        isOpen ? "justify-between" : "justify-center"
      )}>
        <div className="flex items-center gap-3">
          <Logo size="md" showText={false} />
          {isOpen && (
            <div className="animate-in fade-in duration-300">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Architect<span className="text-primary">AI</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Construction OS</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={onClose}
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto" aria-label="Primary navigation">
        <Tooltip content="Home" position="right" className={isOpen ? "hidden" : ""}>
          <Button
            variant="ghost"
            className={cn(
              "w-full gap-3 transition-all duration-200 group relative overflow-hidden",
              location.pathname === '/' || location.pathname === '/dashboard'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              isOpen ? "justify-start" : "justify-center px-2"
            )}
            onClick={() => handleNavigate('/dashboard')}
          >
            {(location.pathname === '/' || location.pathname === '/dashboard') && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />
            )}
            <Home className={cn("h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110", location.pathname === '/' || location.pathname === '/dashboard' ? "text-primary" : "")} />
            {isOpen && <span className="animate-in fade-in duration-200 delay-75 fill-mode-forwards">Home</span>}
          </Button>
        </Tooltip>

        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <Tooltip key={item.path} content={item.label} position="right" className={isOpen ? "hidden" : ""}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full gap-3 transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  isOpen ? "justify-start" : "justify-center px-2"
                )}
                onClick={() => handleNavigate(item.path)}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />
                )}
                <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary" : "")} />
                {isOpen && <span className="animate-in fade-in duration-200 delay-75 fill-mode-forwards">{item.label}</span>}
              </Button>
            </Tooltip>
          )
        })}

        <ShowIfHasRole requiredRole="admin">
          <Tooltip content="Admin" position="right" className={isOpen ? "hidden" : ""}>
            <Button
              variant="ghost"
              className={cn(
                "w-full gap-3 transition-all duration-200 group relative overflow-hidden",
                location.pathname.startsWith('/admin')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                isOpen ? "justify-start" : "justify-center px-2"
              )}
              onClick={() => handleNavigate('/admin')}
            >
              {location.pathname.startsWith('/admin') && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />
              )}
              <Shield className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
              {isOpen && <span className="animate-in fade-in duration-200 delay-75 fill-mode-forwards">Admin</span>}
            </Button>
          </Tooltip>
        </ShowIfHasRole>
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2 bg-card/30">
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground",
          !isOpen && "justify-center px-2"
        )}>
          <div className="relative">
            <User className="h-5 w-5 flex-shrink-0 text-primary" />
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]" />
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <p className="font-medium text-foreground truncate">
                {user?.displayName || 'Guest'}
              </p>
              <p className="text-xs truncate text-muted-foreground">
                {user?.email || 'No email'}
              </p>
              {user?.role && (
                <p className="text-xs mt-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {user.role}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
        <Tooltip content="Logout" position="right" className={isOpen ? "hidden" : ""}>
          <Button
            variant="ghost"
            className={cn(
              "w-full gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
              isOpen ? "justify-start" : "justify-center px-2"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span className="animate-in fade-in duration-200 delay-75 fill-mode-forwards">Logout</span>}
          </Button>
        </Tooltip>
      </div>
    </aside>
  )
})

Sidebar.displayName = 'Sidebar'