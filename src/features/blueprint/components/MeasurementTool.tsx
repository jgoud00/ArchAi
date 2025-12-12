import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { useState, useEffect } from 'react';
import { calculateDistance, formatMeasurement } from '@/utils/measurementHelpers';

/**
 * Measurement tool for creating dimension lines
 */
export const MeasurementTool = () => {
    const {
        selectedTool,
        addMeasurement,
        gridScale,
        gridSize,
    } = useBlueprintStore();

    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (selectedTool !== 'measure') {
            setStartPoint(null);
            setCurrentPoint(null);
            return;
        }

        const handleClick = (event: MouseEvent) => {
            const viewport = document.querySelector('.react-flow__viewport');
            if (!viewport) return;

            const rect = viewport.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (!startPoint) {
                setStartPoint({ x, y });
            } else {
                // Create measurement
                const distance = calculateDistance(startPoint.x, startPoint.y, x, y);
                const label = formatMeasurement(distance, gridScale, gridSize);

                addMeasurement({
                    id: `measure-${Date.now()}`,
                    startNode: `point-${startPoint.x}-${startPoint.y}`,
                    endNode: `point-${x}-${y}`,
                    label,
                    distance,
                });

                setStartPoint(null);
                setCurrentPoint(null);
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
    }, [selectedTool, startPoint, addMeasurement, gridScale, gridSize]);

    if (selectedTool !== 'measure') return null;

    return (
        <>
            {/* Preview line while measuring */}
            {startPoint && currentPoint && (
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                >
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
                    <circle
                        cx={startPoint.x}
                        cy={startPoint.y}
                        r="4"
                        fill="currentColor"
                        className="text-primary"
                    />
                    <text
                        x={(startPoint.x + currentPoint.x) / 2}
                        y={(startPoint.y + currentPoint.y) / 2 - 10}
                        fill="currentColor"
                        className="text-primary text-xs font-medium"
                        textAnchor="middle"
                    >
                        {formatMeasurement(
                            calculateDistance(startPoint.x, startPoint.y, currentPoint.x, currentPoint.y),
                            gridScale,
                            gridSize
                        )}
                    </text>
                </svg>
            )}

            {/* Instruction overlay */}
            {selectedTool === 'measure' && !startPoint && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 glass-dark px-4 py-2 rounded-lg text-xs text-foreground z-50">
                    Click first point to start measurement
                </div>
            )}

            {selectedTool === 'measure' && startPoint && !currentPoint && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 glass-dark px-4 py-2 rounded-lg text-xs text-foreground z-50">
                    Click second point to finish measurement
                </div>
            )}
        </>
    );
};

/**
 * Render existing measurements
 */
export const MeasurementOverlay = () => {
    const { measurements, removeMeasurement } = useBlueprintStore();

    if (measurements.length === 0) return null;

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {measurements.map((measurement) => {
                // Parse points from node IDs (simplified - would need proper node lookup)
                const startMatch = measurement.startNode.match(/point-(\d+)-(\d+)/);
                const endMatch = measurement.endNode.match(/point-(\d+)-(\d+)/);

                if (!startMatch || !endMatch) return null;

                const x1 = parseInt(startMatch[1]);
                const y1 = parseInt(startMatch[2]);
                const x2 = parseInt(endMatch[1]);
                const y2 = parseInt(endMatch[2]);

                return (
                    <g key={measurement.id} className="group">
                        <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-primary/70"
                        />
                        <circle cx={x1} cy={y1} r="3" fill="currentColor" className="text-primary" />
                        <circle cx={x2} cy={y2} r="3" fill="currentColor" className="text-primary" />

                        {/* Label background */}
                        <rect
                            x={(x1 + x2) / 2 - 30}
                            y={(y1 + y2) / 2 - 15}
                            width="60"
                            height="20"
                            fill="currentColor"
                            className="text-background/90"
                            rx="3"
                        />

                        {/* Label text */}
                        <text
                            x={(x1 + x2) / 2}
                            y={(y1 + y2) / 2 - 1}
                            fill="currentColor"
                            className="text-foreground text-xs font-medium pointer-events-auto cursor-pointer"
                            textAnchor="middle"
                            onClick={() => removeMeasurement(measurement.id)}
                        >
                            {measurement.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};
