import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/utils/cn';

interface DoorNodeData {
    label?: string;
    width?: number; // in inches (30", 32", 36" standard)
    angle?: number; // swing angle
}

const DoorNode = ({ data, selected }: { data: DoorNodeData; selected: boolean }) => {
    const width = data.width || 36; // Default 36"

    return (
        <div className={cn(
            "relative group",
            selected && "ring-2 ring-primary ring-offset-2"
        )}>
            {/* Door swing arc (simplified representation) */}
            <svg
                width={width}
                height={width}
                className="overflow-visible"
            >
                {/* Door frame */}
                <rect
                    x={0}
                    y={width - 4}
                    width={width}
                    height={4}
                    fill="currentColor"
                    className={cn(
                        "text-foreground/70",
                        selected && "text-primary"
                    )}
                />

                {/* Door swing arc */}
                <path
                    d={`M 0 ${width} Q ${width / 2} ${width / 2} ${width} 0`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    className="text-muted-foreground"
                />

                {/* Door panel */}
                <line
                    x1={0}
                    y1={width}
                    x2={width}
                    y2={0}
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn(
                        "text-foreground",
                        selected && "text-primary"
                    )}
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

export default memo(DoorNode);
