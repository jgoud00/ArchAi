import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

/**
 * Stairs Node - Represents staircases
 */
const StairsNode = memo(({ data, selected }: NodeProps) => {
    const direction = (data.direction as string) || 'up';
    const steps = (data.steps as number) || 12;
    const width = (data.width as number) || 120;
    const label = (data.label as string) || 'Stairs';

    return (
        <div
            className="relative"
            style={{ width: `${width}px` }}
        >
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />

            <div
                className={`border-2 rounded transition-all ${selected
                        ? 'border-primary bg-primary/10'
                        : 'border-muted-foreground/50 bg-card/50'
                    }`}
                style={{
                    height: `${steps * 8}px`,
                }}
            >
                <svg width="100%" height="100%" className="absolute inset-0">
                    {Array.from({ length: steps }).map((_, i) => (
                        <line
                            key={i}
                            x1="0"
                            y1={`${(i / steps) * 100}%`}
                            x2="100%"
                            y2={`${(i / steps) * 100}%`}
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-m uted-foreground"
                        />
                    ))}

                    {/* Direction arrow */}
                    <path
                        d={direction === 'up'
                            ? `M ${width / 2} ${steps * 8 - 20} L ${width / 2} 20 M ${width / 2} 20 L ${width / 2 - 10} 30 M ${width / 2} 20 L ${width / 2 + 10} 30`
                            : `M ${width / 2} 20 L ${width / 2} ${steps * 8 - 20} M ${width / 2} ${steps * 8 - 20} L ${width / 2 - 10} ${steps * 8 - 30} M ${width / 2} ${steps * 8 - 20} L ${width / 2 + 10} ${steps * 8 - 30}`
                        }
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>

                <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-[10px] font-medium text-foreground bg-background/80 px-2 py-1 rounded">
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );
});

StairsNode.displayName = 'StairsNode';
export default StairsNode;
