import { Panel } from '@xyflow/react';
import { useBlueprintStore } from '@/store/blueprintStore';
import { pixelsToFeet } from '@/utils/measurementHelpers';
import { useState, useEffect } from 'react';

/**
 * Coordinate display component - shows cursor position
 */
export const CoordinateDisplay = () => {
    const { gridScale, gridSize, snapEnabled } = useBlueprintStore();
    const [displayCoords, setDisplayCoords] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Get the React Flow viewport element
            const viewport = document.querySelector('.react-flow__viewport');
            if (!viewport) return;

            const rect = viewport.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Calculate display coordinates (in feet)
            const xFt = pixelsToFeet(x, gridScale, gridSize);
            const yFt = pixelsToFeet(y, gridScale, gridSize);
            setDisplayCoords({ x: xFt, y: yFt });
        };

        const flowElement = document.querySelector('.react-flow');
        if (flowElement) {
            flowElement.addEventListener('mousemove', handleMouseMove as EventListener);
        }

        return () => {
            if (flowElement) {
                flowElement.removeEventListener('mousemove', handleMouseMove as EventListener);
            }
        };
    }, [gridScale, gridSize]);

    return (
        <Panel position="bottom-left" className="glass-dark px-3 py-2 rounded-lg text-xs font-mono">
            <div className="flex gap-4">
                <div>
                    <span className="text-muted-foreground">X:</span>{' '}
                    <span className="text-foreground font-semibold">{displayCoords.x.toFixed(2)} ft</span>
                </div>
                <div>
                    <span className="text-muted-foreground">Y:</span>{' '}
                    <span className="text-foreground font-semibold">{displayCoords.y.toFixed(2)} ft</span>
                </div>
                {snapEnabled && (
                    <div className="text-primary">
                        <span className="text-xs">⊞ SNAP</span>
                    </div>
                )}
            </div>
        </Panel>
    );
};
