import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/utils/cn';

interface WindowNodeData {
    label?: string;
    width?: number; // in inches
}

const WindowNode = ({ data, selected }: { data: WindowNodeData; selected: boolean }) => {
    const width = data.width || 48; // Default 48" (4 feet)
    const height = 24; // Standard window height representation

    return (
        <div className={cn(
            "relative group",
            selected && "ring-2 ring-primary ring-offset-2"
        )}>
            {/* Window representation */}
            <svg width={width} height={height}>
                {/* Outer frame */}
                <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className={cn(
                        "text-foreground/70",
                        selected && "text-primary"
                    )}
                />

                {/* Inner frame (double-hung window) */}
                <rect
                    x={4}
                    y={4}
                    width={width - 8}
                    height={height - 8}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-foreground/50"
                />

                {/* Center divider */}
                <line
                    x1={width / 2}
                    y1={0}
                    x2={width / 2}
                    y2={height}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-foreground/50"
                />

                {/* Glass indication (diagonal lines) */}
                <line
                    x1={4}
                    y1={4}
                    x2={width - 4}
                    y2={height - 4}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                    className="text-muted-foreground/30"
                />
                <line
                    x1={width - 4}
                    y1={4}
                    x2={4}
                    y2={height - 4}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                    className="text-muted-foreground/30"
                />
            </svg>

            {/* Label */}
            {data.label && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-background/90 px-2 py-0.5 rounded border border-border">
                    {data.label}
                </div>
            )}

            {/* Width indicator */}
            {selected && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                    {width}"
                </div>
            )}

            <Handle type="source" position={Position.Top} className="w-2 h-2 !bg-primary opacity-0" />
            <Handle type="target" position={Position.Bottom} className="w-2 h-2 !bg-primary opacity-0" />
        </div>
    );
};

export default memo(WindowNode);
