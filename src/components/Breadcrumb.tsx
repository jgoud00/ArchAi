import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, LayoutDashboard } from 'lucide-react'
import { memo, useMemo } from 'react'

// Route label overrides for better readability
const routeLabelMap: Record<string, string> = {
  'dashboard': 'Dashboard',
  'projects': 'Projects',
  'settings': 'Settings',
  'calendar': 'Calendar',
  'templates': 'Templates',
  'documentation': 'Documentation',
  'admin': 'Admin Panel',
  'issues': 'Issues',
  'budget': 'Budget',
  'timeline': 'Timeline',
  'inventory': 'Inventory',
  'documents': 'Documents',
  'progress': 'Progress Photos',
  'blueprint': 'Blueprint Editor',
  'viewer': '3D Viewer',
  'layout': 'Layout Planner',
  'new': 'New',
  'edit': 'Edit',
}

// Check if segment looks like an ID (UUID or numeric)
const isIdSegment = (segment: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
    /^\d+$/.test(segment)
}

export const Breadcrumb = memo(() => {
  const location = useLocation()

  // Memoize breadcrumbs calculation
  const breadcrumbs = useMemo(() => {
    // Don't show breadcrumb on dashboard (it's the home)
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      return null
    }

    const pathSegments = location.pathname.split('/').filter(Boolean)

    const crumbs: Array<{ label: string; path?: string; isHome: boolean }> = [
      { label: 'Dashboard', path: '/dashboard', isHome: true },
    ]

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/')
      const isLast = index === pathSegments.length - 1

      // Skip if it looks like an ID
      if (isIdSegment(segment)) {
        // For project IDs, show "Project" as label
        if (pathSegments[index - 1] === 'projects') {
          crumbs.push({
            label: 'Project',
            path: isLast ? undefined : path,
            isHome: false,
          })
        }
        return
      }

      // Get label from map or format the segment
      const label = routeLabelMap[segment.toLowerCase()] ||
        segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

      crumbs.push({
        label,
        path: isLast ? undefined : path,
        isHome: false,
      })
    })

    return crumbs
  }, [location.pathname])

  if (!breadcrumbs || breadcrumbs.length <= 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-sm text-muted-foreground mb-4 py-2"
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
            )}
            {crumb.path ? (
              <Link
                to={crumb.path}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                {crumb.isHome && (
                  <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{crumb.label}</span>
              </Link>
            ) : (
              <span className="px-2 py-1 text-foreground font-medium" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
})

Breadcrumb.displayName = 'Breadcrumb'
