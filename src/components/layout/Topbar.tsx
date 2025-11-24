import { Search, Bell, Menu } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface TopbarProps {
  onMenuClick?: () => void
}

export const Topbar = ({ onMenuClick }: TopbarProps) => {
  return (
    <div className="h-16 border-b border-border bg-background px-4 lg:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 lg:gap-4 flex-1">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
