import * as React from 'react'
import { Badge } from './Badge'
import { cn } from '@/utils/cn'

interface TechBadgeProps {
  name: string
  category: 'frontend' | 'backend' | 'database' | 'tool' | 'library'
  className?: string
}

/**
 * Color-coded technology badge component
 * Different colors for different technology categories
 * Memoized to prevent unnecessary re-renders
 */
export const TechBadge: React.FC<TechBadgeProps> = React.memo(({
  name,
  category,
  className,
}) => {
  const colorMap = React.useMemo(() => ({
    frontend: 'bg-primary/10 text-primary border-primary/20',
    backend: 'bg-green-100 text-green-800 border-green-200',
    database: 'bg-purple-100 text-purple-800 border-purple-200',
    tool: 'bg-orange-100 text-orange-800 border-orange-200',
    library: 'bg-pink-100 text-pink-800 border-pink-200',
  }), [])

  return (
    <Badge
      variant="outline"
      className={cn(colorMap[category], 'font-medium', className)}
    >
      {name}
    </Badge>
  )
})

TechBadge.displayName = 'TechBadge'

