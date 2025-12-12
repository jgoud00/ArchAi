import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Breadcrumb } from '../Breadcrumb'
import { cn } from '@/utils/cn'
import { SkipLink } from '@/components/ui/Accessibility'
import { CommandPalette, KeyboardShortcutsHelp } from '@/components/navigation'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Enable global keyboard shortcuts
  useKeyboardShortcuts()

  const handleSidebarClose = useCallback(() => setSidebarOpen(false), [])
  const handleSidebarToggle = useCallback(() => setSidebarOpen(prev => !prev), [])

  return (
    <>
      <SkipLink />
      {/* Global Navigation Components */}
      <CommandPalette />
      <KeyboardShortcutsHelp />

      <div className="flex h-screen overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Topbar onMenuClick={handleSidebarToggle} />
          <main id="main-content" className="flex-1 overflow-y-auto bg-background p-4 lg:p-6" role="main">
            <Breadcrumb />
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
