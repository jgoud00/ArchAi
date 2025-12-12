import { memo } from 'react'
import { Search, Menu, Command } from 'lucide-react'
import { Button } from '../ui/Button'
import { Logo } from '../Logo'
import { NotificationCenter } from '../NotificationCenter'
import { UserMenu } from './UserMenu'
import { RecentPagesDropdown } from '@/components/navigation'

interface TopbarProps {
  onMenuClick?: () => void
}

export const Topbar = memo(({ onMenuClick }: TopbarProps) => {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-md h-16 bg-card/95 border-b border-border px-4 lg:px-6 flex items-center justify-between gap-4 shadow-sm text-foreground">
      <div className="flex items-center gap-2 lg:gap-4 flex-1">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Toggle menu"
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Logo size="md" showText={true} />
        <div className="flex-1 max-w-md hidden md:block">
          <button
            className="relative w-full group"
            onClick={() => {
              // Trigger Cmd+K programmatically
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))
            }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="w-full pl-10 pr-12 py-2 text-left text-sm text-muted-foreground bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
              Search or jump to...
            </div>
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-muted-foreground bg-muted rounded">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <RecentPagesDropdown />
        <NotificationCenter />
        <UserMenu />
      </div>
    </div>
  )
})

Topbar.displayName = 'Topbar'
