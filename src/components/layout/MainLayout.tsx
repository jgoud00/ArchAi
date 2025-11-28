import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Breadcrumb } from '../Breadcrumb'
import { cn } from '@/utils/cn'

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
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
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // On desktop, we don't translate out, we just let the Sidebar component handle its width
          // But here we need to ensure the container respects the width change if it was static
          // Actually, if Sidebar handles its own width, this container just needs to flow.
          // However, for the fixed positioning on mobile, we need the translate.
          // For desktop, we want it to be static and just change width.
        )}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-6">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
