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

// Dashboard page skeleton
export const DashboardSkeleton = () => (
    <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-20" />
                </div>
            ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-48 w-full rounded-lg" />
            </div>
        </div>
    </div>
)

// Card grid skeleton for project lists
export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
        ))}
    </div>
)

// Generic page skeleton
export const PageSkeleton = () => (
    <div className="space-y-6 p-6 animate-pulse">
        {/* Page Header */}
        <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
        </div>

        {/* Content placeholder */}
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    </div>
)

// Form skeleton for data entry pages
export const FormSkeleton = () => (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </div>

        <div className="flex gap-3 justify-end">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
        </div>
    </div>
)
