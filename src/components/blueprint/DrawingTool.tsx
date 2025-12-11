import { useState, useEffect, useCallback } from 'react';
import { useBlueprintStore } from '@/store/blueprintStore';
import { useSnapToGrid } from '@/hooks/useSnapToGrid';
import { Node } from '@xyflow/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';

/**
 * Interactive drawing tool for creating shapes with dimension inputs
 */
export const DrawingTool = () => {
    const { selectedTool, setSelectedTool, addNode } = useBlueprintStore();
    const { snapPosition } = useSnapToGrid();

    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
    const [showDimensionInput, setShowDimensionInput] = useState(false);
    const [dimensions, setDimensions] = useState({ width: '100', height: '100', radius: '50' });

    const isDrawingTool = ['line', 'rectangle', 'circle'].includes(selectedTool);

    const resetDrawing = useCallback(() => {
        setStartPoint(null);
        setCurrentPoint(null);
        setShowDimensionInput(false);
    }, []);

    useEffect(() => {
        if (!isDrawingTool) {
            resetDrawing();
            return;
        }

        const handleClick = (event: MouseEvent) => {
            const viewport = document.querySelector('.react-flow__viewport');
            if (!viewport) return;

            const rect = viewport.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

            // Apply snapping
            const snapped = snapPosition(x, y);
            x = snapped.x;
            y = snapped.y;

            if (!startPoint) {
                setStartPoint({ x, y });
            } else {
                // Second click - show dimension input
                setCurrentPoint({ x, y });
                setShowDimensionInput(true);
            }
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!startPoint) return;

            const viewport = document.querySelector('.react-flow__viewport');
            if (!viewport) return;

            const rect = viewport.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            setCurrentPoint({ x, y });
        };

        const flowElement = document.querySelector('.react-flow');
        if (flowElement) {
            flowElement.addEventListener('click', handleClick as EventListener);
            flowElement.addEventListener('mousemove', handleMouseMove as EventListener);
        }

        return () => {
            if (flowElement) {
                flowElement.removeEventListener('click', handleClick as EventListener);
                flowElement.removeEventListener('mousemove', handleMouseMove as EventListener);
            }
        };
    }, [isDrawingTool, startPoint, selectedTool, snapPosition]);

    const createShape = () => {
        if (!startPoint || !currentPoint) return;

        const width = parseFloat(dimensions.width) || 100;
        const height = parseFloat(dimensions.height) || 100;
        const radius = parseFloat(dimensions.radius) || 50;

        let newNode: Node;

        switch (selectedTool) {
            case 'rectangle':
                newNode = {
                    id: `rect-${Date.now()}`,
                    type: 'shape',
                    position: { x: Math.min(startPoint.x, currentPoint.x), y: Math.min(startPoint.y, currentPoint.y) },
                    data: { label: `${width}×${height}`, shape: 'rectangle' },
                    style: { width, height },
                };
                break;
            case 'circle':
                newNode = {
                    id: `circle-${Date.now()}`,
                    type: 'shape',
                    position: { x: startPoint.x - radius, y: startPoint.y - radius },
                    data: { label: `⌀${radius * 2}`, shape: 'circle' },
                    style: { width: radius * 2, height: radius * 2, borderRadius: '50%' },
                };
                break;
            case 'line':
                // For line, we'll create a thin rectangle
                const dx = currentPoint.x - startPoint.x;
                const dy = currentPoint.y - startPoint.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                newNode = {
                    id: `line-${Date.now()}`,
                    type: 'shape',
                    position: { x: startPoint.x, y: startPoint.y },
                    data: { label: `${length.toFixed(0)}px`, shape: 'line' },
                    style: {
                        width: length,
                        height: 2,
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: '0 0'
                    },
                };
                break;
            default:
                return;
        }

        addNode(newNode);
        resetDrawing();
        setSelectedTool('select');
    };

    if (!isDrawingTool) return null;

    return (
        <>
            {/* Preview shape while drawing */}
            {startPoint && currentPoint && !showDimensionInput && (
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}
                >
                    {selectedTool === 'rectangle' && (
                        <rect
                            x={Math.min(startPoint.x, currentPoint.x)}
                            y={Math.min(startPoint.y, currentPoint.y)}
                            width={Math.abs(currentPoint.x - startPoint.x)}
                            height={Math.abs(currentPoint.y - startPoint.y)}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="text-primary"
                        />
                    )}
                    {selectedTool === 'circle' && (
                        <circle
                            cx={startPoint.x}
                            cy={startPoint.y}
                            r={Math.sqrt(Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2))}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="text-primary"
                        />
                    )}
                    {selectedTool === 'line' && (
                        <line
                            x1={startPoint.x}
                            y1={startPoint.y}
                            x2={currentPoint.x}
                            y2={currentPoint.y}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="text-primary"
                        />
                    )}
                </svg>
            )}

            {/* Instruction overlay */}
            {isDrawingTool && !startPoint && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 glass-dark px-4 py-2 rounded-lg text-xs text-foreground z-50">
                    Click first point to start drawing
                </div>
            )}

            {startPoint && !showDimensionInput && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 glass-dark px-4 py-2 rounded-lg text-xs text-foreground z-50">
                    Click second point or press Esc to cancel
                </div>
            )}

            {/* Dimension Input Dialog */}
            {showDimensionInput && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-dark p-6 rounded-lg shadow-2xl z-50 w-80">
                    <h3 className="text-lg font-semibold mb-4">Set Dimensions</h3>

                    <div className="space-y-4">
                        {selectedTool === 'rectangle' && (
                            <>
                                <div>
                                    <Label className="text-sm">Width (px)</Label>
                                    <Input
                                        type="number"
                                        value={dimensions.width}
                                        onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                                        className="mt-1"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Height (px)</Label>
                                    <Input
                                        type="number"
                                        value={dimensions.height}
                                        onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                            </>
                        )}

                        {selectedTool === 'circle' && (
                            <div>
                                <Label className="text-sm">Radius (px)</Label>
                                <Input
                                    type="number"
                                    value={dimensions.radius}
                                    onChange={(e) => setDimensions({ ...dimensions, radius: e.target.value })}
                                    className="mt-1"
                                    autoFocus
                                />
                            </div>
                        )}

                        {selectedTool === 'line' && (
                            <div className="text-sm text-muted-foreground">
                                Line length: {currentPoint && startPoint ? Math.sqrt(
                                    Math.pow(currentPoint.x - startPoint.x, 2) +
                                    Math.pow(currentPoint.y - startPoint.y, 2)
                                ).toFixed(0) : 0} px
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 mt-6">
                        <Button
                            onClick={createShape}
                            className="flex-1"
                        >
                            Create
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetDrawing();
                                setSelectedTool('select');
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};
