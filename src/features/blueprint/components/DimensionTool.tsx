import { memo, useState } from 'react';
import { Ruler, Move } from 'lucide-react';
import { Panel } from '@xyflow/react';

interface Dimension {
    id: string;
    type: 'linear' | 'angular' | 'radial';
    start: { x: number; y: number };
    end: { x: number; y: number };
    label: string;
}

/**
 * Dimension Tool - Add measurements and annotations
 */
export const DimensionTool = memo(() => {
    const [dimensionMode, setDimensionMode] = useState<'linear' | 'angular' | null>(null);
    const [dimensions] = useState<Dimension[]>([]);

    return (
        <>
            <Panel position="top-right" className="glass-dark p-2 rounded-lg flex flex-col gap-2">
                <button
                    className={`p-2 rounded transition-colors ${dimensionMode === 'linear'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                        }`}
                    onClick={() => setDimensionMode(dimensionMode === 'linear' ? null : 'linear')}
                    title="Linear Dimension"
                >
                    <Ruler className="h-4 w-4" />
                </button>

                <button
                    className={`p-2 rounded transition-colors ${dimensionMode === 'angular'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                        }`}
                    onClick={() => setDimensionMode(dimensionMode === 'angular' ? null : 'angular')}
                    title="Angular Dimension"
                >
                    <Move className="h-4 w-4" />
                </button>
            </Panel>

            {/* Dimension overlays */}
            {dimensions.map(dim => (
                <div
                    key={dim.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: Math.min(dim.start.x, dim.end.x),
                        top: Math.min(dim.start.y, dim.end.y),
                        width: Math.abs(dim.end.x - dim.start.x),
                        height: Math.abs(dim.end.y - dim.start.y),
                    }}
                >
                    <svg
                        width="100%"
                        height="100%"
                        className="absolute inset-0"
                    >
                        <line
                            x1={dim.start.x > dim.end.x ? '100%' : '0'}
                            y1={dim.start.y > dim.end.y ? '100%' : '0'}
                            x2={dim.start.x > dim.end.x ? '0' : '100%'}
                            y2={dim.start.y > dim.end.y ? '0' : '100%'}
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            markerStart="url(#arrowStart)"
                            markerEnd="url(#arrowEnd)"
                        />

                        {/* Arrow markers */}
                        <defs>
                            <marker
                                id="arrowStart"
                                markerWidth="10"
                                markerHeight="10"
                                refX="5"
                                refY="5"
                                orient="auto"
                            >
                                <polygon
                                    points="10,5 0,10 0,0"
                                    fill="hsl(var(--primary))"
                                />
                            </marker>
                            <marker
                                id="arrowEnd"
                                markerWidth="10"
                                markerHeight="10"
                                refX="5"
                                refY="5"
                                orient="auto"
                            >
                                <polygon
                                    points="0,5 10,10 10,0"
                                    fill="hsl(var(--primary))"
                                />
                            </marker>
                        </defs>
                    </svg>

                    {/* Dimension label */}
                    <div
                        className="absolute bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {dim.label}
                    </div>
                </div>
            ))}

            {/* Instruction overlay */}
            {dimensionMode && (
                <Panel position="top-center" className="glass-dark px-4 py-2 rounded-lg text-sm">
                    Click to set dimension points
                </Panel>
            )}
        </>
    );
});

DimensionTool.displayName = 'DimensionTool';
