import { TrendingUp, TrendingDown } from 'lucide-react'
import { memo } from 'react'
import { useAnimatedCounter, useInView } from '@/hooks/useAnimatedCounter'
import { cn } from '@/utils/cn'

interface KPICardProps {
    title: string
    value: string | number
    change?: string
    changeType?: 'positive' | 'negative' | 'neutral'
    icon: React.ReactNode
    className?: string
}

/**
 * KPICard - Dashboard stat card with animated counter
 * 
 * Features:
 * - Animated number counting on first view
 * - Trend indicator with color coding
 * - Hover effects with icon animation
 */
export const KPICard = memo(({
    title,
    value,
    change,
    changeType = 'positive',
    icon,
    className
}: KPICardProps) => {
    const { ref, isInView } = useInView()

    // Parse numeric value for animation
    const numericValue = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0
    const isNumeric = typeof value === 'number' || /^\d+$/.test(String(value))

    const animatedValue = useAnimatedCounter(
        isInView ? numericValue : 0,
        { duration: 1200, easing: 'easeOut', delay: 100 }
    )

    const TrendIcon = changeType === 'negative' ? TrendingDown : TrendingUp
    const trendColor = {
        positive: 'text-green-500',
        negative: 'text-red-500',
        neutral: 'text-muted-foreground',
    }[changeType]

    return (
        <div
            ref={ref}
            className={cn(
                "bg-card border border-border p-6 rounded-xl",
                "flex items-center justify-between",
                "transition-all duration-300",
                "hover:shadow-lg hover:border-primary/20",
                "group card-hover-lift",
                className
            )}
        >
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                    {title}
                </p>
                <h3 className="text-3xl font-bold text-foreground tabular-nums">
                    {isNumeric ? animatedValue : value}
                </h3>
                {change && (
                    <p className={cn("text-xs flex items-center gap-1 mt-2", trendColor)}>
                        <TrendIcon className="h-3.5 w-3.5" />
                        <span>{change} this month</span>
                    </p>
                )}
            </div>
            <div className={cn(
                "p-3 rounded-xl bg-primary/10 text-primary",
                "transition-all duration-300",
                "group-hover:bg-primary group-hover:text-primary-foreground",
                "group-hover:scale-110 group-hover:rotate-3"
            )}>
                {icon}
            </div>
        </div>
    )
})

KPICard.displayName = 'KPICard'
