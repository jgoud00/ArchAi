import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

/**
 * Arc Node - Represents arc/curved segments
 */
const ArcNode = memo(({ data, selected }: NodeProps) => {
    const radius = (data.radius as number) || 80;
    const startAngle = (data.startAngle as number) || 0;
    const endAngle = (data.endAngle as number) || 180;
    const label = (data.label as string) || 'Arc';

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc path
    const startX = radius + radius * Math.cos(startRad);
    const startY = radius - radius * Math.sin(startRad);
    const endX = radius + radius * Math.cos(endRad);
    const endY = radius - radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}`;

    const size = radius * 2;

    return (
        <div
            className="relative"
            style={{
                width: `${size}px`,
                height: `${size}px`,
            }}
        >
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />

            <svg width={size} height={size} className="absolute inset-0">
                <path
                    d={arcPath}
                    className={`transition-colors ${selected
                            ? 'stroke-primary'
                            : 'stroke-muted-foreground'
                        }`}
                    strokeWidth={selected ? 3 : 2}
                    fill="none"
                />

                {/* Start point marker */}
                <circle
                    cx={startX}
                    cy={startY}
                    r="4"
                    className="fill-green-500"
                />

                {/* End point marker */}
                <circle
                    cx={endX}
                    cy={endY}
                    r="4"
                    className="fill-red-500"
                />
            </svg>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-background px-2 py-0.5 rounded text-[10px] font-medium">
                {label}
            </div>
        </div>
    );
});

ArcNode.displayName = 'ArcNode';
export default ArcNode;
