import React from 'react'
import { GanttChart as GanttChartComponent } from '@/features/projects/components/GanttChart'

/**
 * Memoized GanttChart component for performance optimization.
 * Prevents unnecessary re-renders when parent components update.
 */
export const GanttChart = React.memo(GanttChartComponent)
GanttChart.displayName = 'GanttChart'
