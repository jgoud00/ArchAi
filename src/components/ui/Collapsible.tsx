import * as React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CollapsibleProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

/**
 * Collapsible section component for documentation
 * Provides expand/collapse functionality with smooth animations
 * Uses refs to measure content height for proper animation
 */
export const Collapsible: React.FC<CollapsibleProps> = React.memo(({
  title,
  children,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const [contentHeight, setContentHeight] = React.useState<number | undefined>(undefined)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Measure content height when opened
  React.useEffect(() => {
    if (isOpen && contentRef.current) {
      const height = contentRef.current.scrollHeight
      setContentHeight(height)
    } else {
      setContentHeight(0)
    }
  }, [isOpen])

  // Handle toggle with useCallback to prevent re-renders
  const handleToggle = React.useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
        type="button"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-left">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          maxHeight: contentHeight !== undefined ? `${contentHeight}px` : isOpen ? 'none' : '0px',
        }}
      >
        <div ref={contentRef} className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
})

Collapsible.displayName = 'Collapsible'

