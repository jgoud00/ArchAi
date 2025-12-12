import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Task } from '@/types'
import { addDays, differenceInDays, format, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/services/supabase'
import { useToast } from '@/hooks/useToast'
import { logger } from '@/utils/logger'

interface GanttChartProps {
    tasks: Task[]
    onTaskUpdate: (task: Task) => void
}

type ViewMode = 'day' | 'week' | 'month'

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskUpdate }) => {
    const { showToast } = useToast()
    const [viewMode] = useState<ViewMode>('week')
    const [startDate, setStartDate] = useState(new Date())
    const [columnWidth, setColumnWidth] = useState(50)
    const containerRef = useRef<HTMLDivElement>(null)
    const [draggingTask, setDraggingTask] = useState<{ id: string, type: 'move' | 'resize-left' | 'resize-right', startX: number, originalStart: Date, originalEnd: Date } | null>(null)

    // Calculate visible date range
    const visibleDates = useMemo(() => {
        const start = startOfWeek(startDate)
        const daysToShow = viewMode === 'day' ? 14 : viewMode === 'week' ? 30 : 90
        const end = addDays(start, daysToShow)
        return eachDayOfInterval({ start, end })
    }, [startDate, viewMode])

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

        // Validation
        if (newStart > newEnd) return

        // Optimistic update (local state would be better, but for now we just rely on parent update or local visual feedback if we had it)
        // For this implementation, we'll just update the task in the parent list via callback if we were doing real-time, 
        // but usually we wait for mouse up to commit.
        // To show "live" dragging, we would need local state for the task being dragged.
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
            width: `${width}px`,
        }
    }

    return (
        <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setStartDate(addDays(startDate, -7))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium min-w-[150px] text-center">
                        {format(startDate, 'MMMM yyyy')}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setStartDate(addDays(startDate, 7))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setColumnWidth(Math.max(30, columnWidth - 10))}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setColumnWidth(Math.min(100, columnWidth + 10))}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto relative" ref={containerRef}>
                <div className="min-w-max">
                    {/* Header Row */}
                    <div className="flex border-b sticky top-0 bg-card z-10">
                        <div className="w-48 p-2 border-r font-medium sticky left-0 bg-card z-20">Task Name</div>
                        <div className="flex">
                            {visibleDates.map(date => (
                                <div
                                    key={date.toISOString()}
                                    className={`border-r p-2 text-xs text-center flex-shrink-0 ${isSameDay(date, new Date()) ? 'bg-primary/10' : ''}`}
                                    style={{ width: `${columnWidth}px` }}
                                >
                                    <div className="font-medium">{format(date, 'd')}</div>
                                    <div className="text-muted-foreground">{format(date, 'EEE')}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Rows */}
                    <div className="relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex ml-48 pointer-events-none">
                            {visibleDates.map(date => (
                                <div
                                    key={`grid-${date.toISOString()}`}
                                    className="border-r h-full flex-shrink-0"
                                    style={{ width: `${columnWidth}px` }}
                                />
                            ))}
                        </div>

                        {tasks.map(task => (
                            <div key={task.id} className="flex border-b hover:bg-muted/50 relative h-12 items-center group">
                                <div className="w-48 p-2 border-r truncate sticky left-0 bg-card z-10 text-sm font-medium">
                                    {task.taskName}
                                </div>
                                <div className="flex-1 relative h-full ml-0">
                                    <div
                                        className={`absolute top-2 h-8 rounded-md shadow-sm cursor-move group-hover:brightness-95 transition-colors
                      ${task.status === 'completed' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'}
                    `}
                                        style={getTaskStyle(task)}
                                        onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                                    >
                                        {/* Resize Handles */}
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/20 rounded-l-md"
                                            onMouseDown={(e) => {
                                                e.stopPropagation()
                                                handleMouseDown(e, task, 'resize-left')
                                            }}
                                        />
                                        <div
                                            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/20 rounded-r-md"
                                            onMouseDown={(e) => {
                                                e.stopPropagation()
                                                handleMouseDown(e, task, 'resize-right')
                                            }}
                                        />

                                        <div className="px-2 text-xs text-white font-medium truncate leading-8">
                                            {task.taskName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
