import { memo } from 'react';

interface SmartGuide {
    type: 'horizontal' | 'vertical';
    position: number;
    color: string;
}

interface SmartGuidesProps {
    guides: SmartGuide[];
    canvasWidth: number;
    canvasHeight: number;
}

/**
 * SmartGuides - Visual alignment guides that appear when dragging nodes
 * Shows red lines when nodes align with other nodes or canvas elements
 */
export const SmartGuides = memo(({ guides, canvasWidth, canvasHeight }: SmartGuidesProps) => {
    return (
        <svg
            className="absolute top-0 left-0 pointer-events-none z-50"
            width={canvasWidth}
            height={canvasHeight}
            style={{ overflow: 'visible' }}
        >
            {guides.map((guide, index) => {
                if (guide.type === 'horizontal') {
                    return (
                        <line
                            key={`h-${index}`}
                            x1={0}
                            y1={guide.position}
                            x2={canvasWidth}
                            y2={guide.position}
                            stroke={guide.color}
                            strokeWidth={1}
                            strokeDasharray="5,5"
                            opacity={0.8}
                        />
                    );
                } else {
                    return (
                        <line
                            key={`v-${index}`}
                            x1={guide.position}
                            y1={0}
                            x2={guide.position}
                            y2={canvasHeight}
                            stroke={guide.color}
                            strokeWidth={1}
                            strokeDasharray="5,5"
                            opacity={0.8}
                        />
                    );
                }
            })}
        </svg>
    );
});

SmartGuides.displayName = 'SmartGuides';
