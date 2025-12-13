import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Task } from '@/types'
import { addDays, differenceInDays, format, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar, CheckCircle2, Clock, Circle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/services/supabase'
import { useToast } from '@/hooks/useToast'
import { logger } from '@/utils/logger'

interface GanttChartProps {
    tasks: Task[]
    onTaskUpdate: (task: Task) => void
}

type ViewMode = 'day' | 'week' | 'month'

// Status colors with gradients
const statusColors = {
    completed: 'bg-gradient-to-r from-emerald-500 to-green-400',
    in_progress: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    pending: 'bg-gradient-to-r from-slate-400 to-gray-300',
}

// Calculate task progress based on current date
const calculateProgress = (startDate: Date, endDate: Date): number => {
    const now = new Date()
    if (now < startDate) return 0
    if (now > endDate) return 100
    const total = differenceInDays(endDate, startDate) + 1
    const elapsed = differenceInDays(now, startDate) + 1
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskUpdate }) => {
    const { showToast } = useToast()
    const [viewMode, setViewMode] = useState<ViewMode>('week')
    const [startDate, setStartDate] = useState(new Date())
    const [columnWidth, setColumnWidth] = useState(50)
    const containerRef = useRef<HTMLDivElement>(null)
    const [hoveredTask, setHoveredTask] = useState<string | null>(null)
    const [draggingTask, setDraggingTask] = useState<{ id: string, type: 'move' | 'resize-left' | 'resize-right', startX: number, originalStart: Date, originalEnd: Date } | null>(null)

    // Task statistics
    const taskStats = useMemo(() => {
        const completed = tasks.filter(t => t.status === 'completed').length
        const inProgress = tasks.filter(t => t.status === 'in_progress').length
        const pending = tasks.filter(t => t.status === 'pending').length
        return { total: tasks.length, completed, inProgress, pending }
    }, [tasks])

    // Calculate visible date range based on view mode
    const visibleDates = useMemo(() => {
        const start = startOfWeek(startDate)
        const daysToShow = viewMode === 'day' ? 14 : viewMode === 'week' ? 30 : 90
        const end = addDays(start, daysToShow)
        return eachDayOfInterval({ start, end })
    }, [startDate, viewMode])

    // Find today's position
    const todayPosition = useMemo(() => {
        const today = new Date()
        const chartStart = visibleDates[0]
        const offsetDays = differenceInDays(today, chartStart)
        if (offsetDays < 0 || offsetDays > visibleDates.length) return null
        return offsetDays * columnWidth + 192 // 192 = task name column width (w-48)
    }, [visibleDates, columnWidth])

    const handleMouseDown = (e: React.MouseEvent, task: Task, type: 'move' | 'resize-left' | 'resize-right') => {
        e.preventDefault()
        setDraggingTask({
            id: task.id,
            type,
            startX: e.clientX,
            originalStart: new Date(task.startDate),
            originalEnd: new Date(task.endDate)
        })
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingTask) return

        const diffX = e.clientX - draggingTask.startX
        const daysDiff = Math.round(diffX / columnWidth)

        if (daysDiff === 0) return

        const task = tasks.find(t => t.id === draggingTask.id)
        if (!task) return

        let newStart = new Date(draggingTask.originalStart)
        let newEnd = new Date(draggingTask.originalEnd)

        if (draggingTask.type === 'move') {
            newStart = addDays(newStart, daysDiff)
            newEnd = addDays(newEnd, daysDiff)
        } else if (draggingTask.type === 'resize-left') {
            newStart = addDays(newStart, daysDiff)
        } else if (draggingTask.type === 'resize-right') {
            newEnd = addDays(newEnd, daysDiff)
        }

        if (newStart > newEnd) return
    }

    const handleMouseUp = async (e: MouseEvent) => {
        if (!draggingTask) return

        const diffX = e.clientX - draggingTask.startX
        const daysDiff = Math.round(diffX / columnWidth)

        if (daysDiff !== 0) {
            const task = tasks.find(t => t.id === draggingTask.id)
            if (task) {
                let newStart = new Date(draggingTask.originalStart)
                let newEnd = new Date(draggingTask.originalEnd)

                if (draggingTask.type === 'move') {
                    newStart = addDays(newStart, daysDiff)
                    newEnd = addDays(newEnd, daysDiff)
                } else if (draggingTask.type === 'resize-left') {
                    newStart = addDays(newStart, daysDiff)
                } else if (draggingTask.type === 'resize-right') {
                    newEnd = addDays(newEnd, daysDiff)
                }

                if (newStart <= newEnd) {
                    try {
                        const { error } = await supabase
                            .from('tasks')
                            .update({
                                start_date: newStart.toISOString(),
                                end_date: newEnd.toISOString()
                            })
                            .eq('id', task.id)

                        if (error) throw error

                        onTaskUpdate({
                            ...task,
                            startDate: newStart,
                            endDate: newEnd
                        })
                        showToast('Task updated', 'success')
                    } catch (error) {
                        logger.error('Failed to update task', error, { taskId: task.id })
                        showToast('Failed to update task', 'error')
                    }
                }
            }
        }

        setDraggingTask(null)
    }

    useEffect(() => {
        if (draggingTask) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draggingTask, tasks, columnWidth])

    const getTaskStyle = (task: Task) => {
        const start = new Date(task.startDate)
        const end = new Date(task.endDate)
        const chartStart = visibleDates[0]

        const offsetDays = differenceInDays(start, chartStart)
        const durationDays = differenceInDays(end, start) + 1

        const left = offsetDays * columnWidth
        const width = durationDays * columnWidth

        return {
            left: `${left}px`,
            width: `${Math.max(width, columnWidth)}px`,
        }
    }

    const getTaskDuration = (task: Task) => {
        const days = differenceInDays(new Date(task.endDate), new Date(task.startDate)) + 1
        return days === 1 ? '1 day' : `${days} days`
    }

    // Jump to today
    const goToToday = () => {
        setStartDate(new Date())
    }

    return (
        <div className="border rounded-xl bg-card text-card-foreground shadow-lg overflow-hidden flex flex-col h-[650px]">
            {/* Enhanced Header */}
            <div className="p-4 border-b bg-gradient-to-r from-muted/50 to-muted/30">
                {/* Task Statistics */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="font-medium">{taskStats.completed}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="font-medium">{taskStats.inProgress}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-500/10 text-slate-600">
                                <Circle className="h-3.5 w-3.5" />
                                <span className="font-medium">{taskStats.pending}</span>
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {taskStats.total} total tasks
                        </span>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === mode
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setStartDate(addDays(startDate, -7))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={goToToday} className="gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Today
                        </Button>
                        <span className="font-semibold min-w-[150px] text-center">
                            {format(startDate, 'MMMM yyyy')}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setStartDate(addDays(startDate, 7))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Zoom:</span>
                        <Button variant="ghost" size="sm" onClick={() => setColumnWidth(Math.max(30, columnWidth - 10))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setColumnWidth(Math.min(100, columnWidth + 10))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto relative" ref={containerRef}>
                <div className="min-w-max">
                    {/* Header Row */}
                    <div className="flex border-b sticky top-0 bg-card z-10">
                        <div className="w-48 p-2 border-r font-medium sticky left-0 bg-card z-20 text-sm">
                            Task Name
                        </div>
                        <div className="flex">
                            {visibleDates.map(date => (
                                <div
                                    key={date.toISOString()}
                                    className={`border-r p-2 text-xs text-center flex-shrink-0 transition-colors ${isSameDay(date, new Date())
                                        ? 'bg-primary/10 font-semibold'
                                        : date.getDay() === 0 || date.getDay() === 6
                                            ? 'bg-muted/30'
                                            : ''
                                        }`}
                                    style={{ width: `${columnWidth}px` }}
                                >
                                    <div className={`${isSameDay(date, new Date()) ? 'text-primary' : ''}`}>
                                        {format(date, 'd')}
                                    </div>
                                    <div className="text-muted-foreground">{format(date, 'EEE')}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Rows */}
                    <div className="relative">
                        {/* Today Line */}
                        {todayPosition !== null && (
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
                                style={{ left: `${todayPosition}px` }}
                            >
                                <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500" />
                            </div>
                        )}

                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex ml-48 pointer-events-none">
                            {visibleDates.map(date => (
                                <div
                                    key={`grid-${date.toISOString()}`}
                                    className={`border-r h-full flex-shrink-0 ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-muted/20' : ''
                                        }`}
                                    style={{ width: `${columnWidth}px` }}
                                />
                            ))}
                        </div>

                        {tasks.map(task => {
                            const progress = calculateProgress(new Date(task.startDate), new Date(task.endDate))
                            const isHovered = hoveredTask === task.id

                            return (
                                <div
                                    key={task.id}
                                    className="flex border-b hover:bg-muted/30 relative h-14 items-center group transition-colors"
                                >
                                    <div className="w-48 p-2 border-r truncate sticky left-0 bg-card z-10 text-sm font-medium flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' :
                                            task.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-400'
                                            }`} />
                                        {task.taskName}
                                    </div>
                                    <div className="flex-1 relative h-full">
                                        <div
                                            className={`absolute top-3 h-8 rounded-lg shadow-md cursor-move transition-all ${statusColors[task.status as keyof typeof statusColors] || statusColors.pending
                                                } ${isHovered ? 'ring-2 ring-primary/50 scale-[1.02]' : ''}`}
                                            style={getTaskStyle(task)}
                                            onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                                            onMouseEnter={() => setHoveredTask(task.id)}
                                            onMouseLeave={() => setHoveredTask(null)}
                                        >
                                            {/* Progress Overlay */}
                                            {task.status === 'in_progress' && (
                                                <div
                                                    className="absolute inset-0 bg-black/20 rounded-lg origin-left"
                                                    style={{ width: `${100 - progress}%`, left: `${progress}%` }}
                                                />
                                            )}

                                            {/* Resize Handles */}
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-l-lg"
                                                onMouseDown={(e) => {
                                                    e.stopPropagation()
                                                    handleMouseDown(e, task, 'resize-left')
                                                }}
                                            />
                                            <div
                                                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-r-lg"
                                                onMouseDown={(e) => {
                                                    e.stopPropagation()
                                                    handleMouseDown(e, task, 'resize-right')
                                                }}
                                            />

                                            <div className="px-3 text-xs text-white font-medium truncate leading-8 drop-shadow-sm">
                                                {task.taskName}
                                            </div>

                                            {/* Tooltip */}
                                            {isHovered && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground rounded-lg shadow-xl border text-xs whitespace-nowrap z-50">
                                                    <div className="font-semibold mb-1">{task.taskName}</div>
                                                    <div className="text-muted-foreground space-y-0.5">
                                                        <div>📅 {format(new Date(task.startDate), 'MMM d')} → {format(new Date(task.endDate), 'MMM d, yyyy')}</div>
                                                        <div>⏱️ {getTaskDuration(task)}</div>
                                                        <div className="capitalize">📊 {task.status.replace('_', ' ')} {task.status === 'in_progress' && `(${progress}%)`}</div>
                                                    </div>
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
