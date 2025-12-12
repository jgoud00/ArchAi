import { Panel } from '@xyflow/react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { memo } from 'react';

/**
 * Grid system component - displays a visual grid overlay
 */
export const GridSystem = memo(() => {
    const { gridSize, gridVisible } = useBlueprintStore();

    if (!gridVisible) return null;

    return (
        <Panel position="top-left" className="pointer-events-none w-full h-full absolute inset-0">
            <svg className="w-full h-full" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                    <pattern
                        id="grid-pattern"
                        width={gridSize}
                        height={gridSize}
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            className="text-muted-foreground/20"
                        />
                    </pattern>
                    <pattern
                        id="grid-pattern-major"
                        width={gridSize * 5}
                        height={gridSize * 5}
                        patternUnits="userSpaceOnUse"
                    >
                        <rect width={gridSize * 5} height={gridSize * 5} fill="url(#grid-pattern)" />
                        <path
                            d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-muted-foreground/30"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern-major)" />
            </svg>
        </Panel>
    );
});

GridSystem.displayName = 'GridSystem';
