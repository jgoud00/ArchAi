import { memo } from 'react';
import { Ruler } from 'lucide-react';

interface RulersProps {
    canvasWidth: number;
    canvasHeight: number;
    zoom: number;
    unit?: 'px' | 'ft' | 'm' | 'cm';
}

/**
 * Rulers - Horizontal and vertical rulers on canvas edges
 * Shows measurements at regular intervals based on zoom level
 */
export const Rulers = memo(({ canvasWidth, canvasHeight, zoom = 1, unit = 'px' }: RulersProps) => {
    const rulerHeight = 25;
    const tickInterval = Math.max(50, Math.floor(100 / zoom));

    const getUnitLabel = (pixels: number) => {
        switch (unit) {
            case 'ft':
                return `${(pixels / 12).toFixed(0)}'`;
            case 'm':
                return `${(pixels / 100).toFixed(1)}m`;
            case 'cm':
                return `${pixels}cm`;
            default:
                return `${pixels}px`;
        }
    };

    return (
        <>
            {/* Horizontal Ruler (Top) */}
            <div
                className="absolute top-0 left-0 bg-muted border-b border-border flex items-end overflow-hidden"
                style={{ width: canvasWidth, height: rulerHeight }}
            >
                {Array.from({ length: Math.ceil(canvasWidth / tickInterval) }).map((_, i) => {
                    const position = i * tickInterval;
                    return (
                        <div
                            key={`h-${i}`}
                            className="absolute flex flex-col items-center text-xs text-muted-foreground"
                            style={{ left: position }}
                        >
                            <div className="h-2 w-px bg-border" />
                            {i % 2 === 0 && (
                                <span className="mt-1">{getUnitLabel(position)}</span>
                            )}
                        </div>
                    );
                })}
                <div className="absolute bottom-1 right-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Ruler className="h-3 w-3" />
                </div>
            </div>

            {/* Vertical Ruler (Left) */}
            <div
                className="absolute top-0 left-0 bg-muted border-r border-border flex justify-end overflow-hidden"
                style={{ height: canvasHeight, width: rulerHeight }}
            >
                {Array.from({ length: Math.ceil(canvasHeight / tickInterval) }).map((_, i) => {
                    const position = i * tickInterval;
                    return (
                        <div
                            key={`v-${i}`}
                            className="absolute flex items-center text-xs text-muted-foreground"
                            style={{ top: position }}
                        >
                            <div className="w-2 h-px bg-border" />
                            {i % 2 === 0 && (
                                <span className="ml-1 rotate-90 origin-center whitespace-nowrap">
                                    {getUnitLabel(position)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Corner (Top-left) */}
            <div
                className="absolute top-0 left-0 bg-muted border-r border-b border-border flex items-center justify-center"
                style={{ width: rulerHeight, height: rulerHeight }}
            >
                <Ruler className="h-4 w-4 text-muted-foreground" />
            </div>
        </>
    );
});

Rulers.displayName = 'Rulers';
