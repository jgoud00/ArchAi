import { cn } from '@/utils/cn'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
}

export const Skeleton = ({
    className,
    variant = 'rectangular',
    width,
    height,
}: SkeletonProps) => {
    const baseClasses = 'animate-pulse bg-muted'

    const variantClasses = {
        text: 'h-4 w-full rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
    }

    const style: React.CSSProperties = {}
    if (width) style.width = typeof width === 'number' ? `${width}px` : width
    if (height) style.height = typeof height === 'number' ? `${height}px` : height

    return (
        <div
            className={cn(baseClasses, variantClasses[variant], className)}
            style={style}
        />
    )
}

// Skeleton variants for common use cases
export const ProjectCardSkeleton = () => (
    <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton variant="circular" width={32} height={32} />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 mt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
        </div>
    </div>
)

export const IssueCardSkeleton = () => (
    <div className="bg-card border border-border rounded-lg p-3 space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center justify-between mt-3">
            <Skeleton className="h-6 w-16" />
            <div className="flex gap-2">
                <Skeleton variant="circular" width={24} height={24} />
            </div>
        </div>
    </div>
)

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border border-border rounded-lg">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-8 w-20" />
            </div>
        ))}
    </div>
)
