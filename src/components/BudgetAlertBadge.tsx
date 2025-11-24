import { AlertTriangle } from 'lucide-react'
import { Badge } from './ui/Badge'
import { BudgetAlert } from '@/types'

interface BudgetAlertBadgeProps {
  alert: BudgetAlert
}

export const BudgetAlertBadge = ({ alert }: BudgetAlertBadgeProps) => {
  return (
    <Badge variant="destructive" className="gap-1">
      <AlertTriangle className="h-3 w-3" />
      Budget Alert: {alert.exceededByPercent.toFixed(1)}% over threshold
    </Badge>
  )
}

