import { cn } from "@/utils/cn"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = "md" }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
