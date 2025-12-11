import { Panel } from '@xyflow/react';
import { useBlueprintStore } from '@/store/blueprintStore';
import { useState, useEffect } from 'react';
import { findNearestSnapPoint } from '@/utils/snapEngine';

/**
 * Visual snap indicator showing snap targets
 */
export const SnapIndicator = () => {
    const { nodes, objectSnapEnabled, snapEnabled } = useBlueprintStore();
    const [snapPoint, setSnapPoint] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (!objectSnapEnabled && !snapEnabled) {
            setSnapPoint(null);
            return;
        }

        const handleMouseMove = (event: MouseEvent) => {
            const viewport = document.querySelector('.react-flow__viewport');
            if (!viewport) return;

            const rect = viewport.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (objectSnapEnabled) {
                const nearest = findNearestSnapPoint(x, y, nodes, 20);
                setSnapPoint(nearest);
            } else {
                setSnapPoint(null);
            }
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
    }, [nodes, objectSnapEnabled, snapEnabled]);

    if (!snapPoint) return null;

    return (
        <Panel position="top-left" className="pointer-events-none">
            <svg className="absolute inset-0 w-full h-full overflow-visible">
                {/* Snap point indicator */}
                <circle
                    cx={snapPoint.x}
                    cy={snapPoint.y}
                    r="6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary animate-pulse"
                />
                <circle
                    cx={snapPoint.x}
                    cy={snapPoint.y}
                    r="2"
                    fill="currentColor"
                    className="text-primary"
                />
            </svg>
        </Panel>
    );
};
