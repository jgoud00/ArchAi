import { TrendingUp } from 'lucide-react'
import { memo } from 'react'

interface KPICardProps {
    title: string
    value: string | number
    change?: string
    icon: React.ReactNode
}

export const KPICard = memo(({ title, value, change, icon }: KPICardProps) => (
    <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-xl flex items-center justify-between transition-all duration-300 hover:shadow-primary/30 hover:shadow-lg group">
        <div>
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
            <h3 className="text-3xl font-bold text-foreground mt-1">{value}</h3>
            {change && (
                <p className="text-xs text-green-400 mt-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" /> {change} this month
                </p>
            )}
        </div>
        <div className="text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
            {icon}
        </div>
    </div>
))

KPICard.displayName = 'KPICard'
