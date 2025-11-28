import { Search, Menu } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Logo } from '../Logo'
import { NotificationCenter } from '../NotificationCenter'
import { UserMenu } from './UserMenu'

interface TopbarProps {
  onMenuClick?: () => void
}

export const Topbar = ({ onMenuClick }: TopbarProps) => {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-md h-16 bg-slate-900/95 border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4 shadow-sm text-white">
      <div className="flex items-center gap-2 lg:gap-4 flex-1">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Toggle menu"
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Logo size="md" showText={true} />
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search projects..."
              className="pl-10 w-full bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <NotificationCenter />
        <UserMenu />
      </div>
    </div>
  )
}
