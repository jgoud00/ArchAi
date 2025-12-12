import * as React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from './ui/Button'

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: React.ReactNode
  /** Custom fallback UI to display on error */
  fallback?: React.ReactNode
  /** Callback function when error is reset */
  onReset?: () => void
  /** Error display level: 'page' | 'section' | 'component' */
  level?: 'page' | 'section' | 'component'
}

/**
 * Internal state for the ErrorBoundary
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * ErrorBoundary - React Error Boundary for graceful error handling
 * 
 * @description Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the entire application. Supports three
 * display levels for different use cases.
 * 
 * @example
 * ```tsx
 * // Page-level error boundary
 * <ErrorBoundary level="page">
 *   <MyPage />
 * </ErrorBoundary>
 * 
 * // Section-level with custom reset
 * <ErrorBoundary level="section" onReset={() => refetch()}>
 *   <DataSection />
 * </ErrorBoundary>
 * ```
 * 
 * @param props.children - Components to wrap in error boundary
 * @param props.fallback - Custom fallback UI (optional)
 * @param props.onReset - Callback when retry is clicked (optional)
 * @param props.level - Display level: 'page', 'section', or 'component'
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ errorInfo })

    // Here you could send error to monitoring service like Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo })
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onReset?.()
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { level = 'section' } = this.props

      if (level === 'page') {
        return <PageErrorFallback error={this.state.error} onReset={this.handleReset} onGoHome={this.handleGoHome} />
      }

      if (level === 'component') {
        return <ComponentErrorFallback error={this.state.error} onReset={this.handleReset} />
      }

      // Default section-level fallback
      return <SectionErrorFallback error={this.state.error} onReset={this.handleReset} />
    }

    return this.props.children
  }
}

/**
 * PageErrorBoundary - Pre-configured for page-level errors
 */
export const PageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page">{children}</ErrorBoundary>
)

/**
 * SectionErrorBoundary - Pre-configured for section-level errors
 */
export const SectionErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary level="section">{children}</ErrorBoundary>
)

/**
 * ComponentErrorBoundary - Pre-configured for component-level errors
 */
export const ComponentErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary level="component">{children}</ErrorBoundary>
)

// ========== Fallback Components ==========

interface ErrorFallbackProps {
  error: Error | null
  onReset: () => void
  onGoHome?: () => void
}

/**
 * Full page error fallback with navigation options
 */
const PageErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset, onGoHome }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-6">
    <div className="text-center max-w-md">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong</h1>
      <p className="text-muted-foreground mb-6">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onGoHome}>
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
        <Button onClick={onReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
      {import.meta.env.DEV && error && (
        <details className="mt-6 text-left text-sm bg-muted p-4 rounded-lg">
          <summary className="cursor-pointer font-medium flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Error Details (Development Only)
          </summary>
          <pre className="mt-2 overflow-auto text-xs text-destructive">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
)

/**
 * Section-level error fallback
 */
const SectionErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-card rounded-lg border border-border">
    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
    <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
    <p className="text-muted-foreground mb-4 text-center max-w-md">
      {error?.message || 'An unexpected error occurred'}
    </p>
    <Button onClick={onReset}>
      <RefreshCw className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  </div>
)

/**
 * Compact component-level error fallback
 */
const ComponentErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => (
  <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium">Failed to load</p>
      <p className="text-xs text-muted-foreground truncate">{error?.message}</p>
    </div>
    <Button size="sm" variant="outline" onClick={onReset}>
      Retry
    </Button>
  </div>
)
