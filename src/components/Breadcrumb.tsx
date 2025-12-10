import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { memo, useMemo } from 'react'

export const Breadcrumb = memo(() => {
  const location = useLocation()

  // Memoize breadcrumbs calculation
  const breadcrumbs = useMemo(() => {
    // Don't show breadcrumb on home page
    if (location.pathname === '/') {
      return null
    }

    const pathSegments = location.pathname.split('/').filter(Boolean)

    return [
      { label: 'Home', path: '/' },
      ...pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/')
        // Convert segment to readable label
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        return {
          label,
          path: index === pathSegments.length - 1 ? undefined : path
        }
      })
    ]
  }, [location.pathname])

  if (!breadcrumbs) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-2">
            {index === 0 ? (
              <Link
                to={crumb.path || '#'}
                className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
                aria-label="Home"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
})

Breadcrumb.displayName = 'Breadcrumb'

