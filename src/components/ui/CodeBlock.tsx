import * as React from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { logger } from '@/utils/logger'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

/**
 * Code block component with syntax highlighting and copy functionality
 * Uses a simple approach - can be enhanced with Prism.js or highlight.js
 * Memoized to prevent unnecessary re-renders
 */
export const CodeBlock: React.FC<CodeBlockProps> = React.memo(({
  code,
  language = 'typescript',
  className,
}) => {
  const [copied, setCopied] = React.useState(false)
  const codeRef = React.useRef<HTMLPreElement>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopy = React.useCallback(async () => {
    if (codeRef.current) {
      try {
        const text = codeRef.current.innerText
        await navigator.clipboard.writeText(text)
        setCopied(true)

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
          setCopied(false)
          timeoutRef.current = null
        }, 2000)
      } catch (error) {
        logger.error('Failed to copy code', error)
      }
    }
  }, [])

  return (
    <div className={cn('relative group', className)}>
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleCopy}
          className="p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
          title="Copy code"
          type="button"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
      <pre
        ref={codeRef}
        className={cn(
          'p-4 rounded-lg bg-muted overflow-x-auto text-sm',
          'font-mono',
          language && `language-${language}`
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
})

CodeBlock.displayName = 'CodeBlock'

