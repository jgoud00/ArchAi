import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

/**
 * Polygon Node - Represents polygonal shapes
 */
const PolygonNode = memo(({ data, selected }: NodeProps) => {
    const sides = (data.sides as number) || 6;
    const radius = (data.radius as number) || 60;
    const label = (data.label as string) || `${sides}-gon`;

    // Calculate polygon points
    const points = Array.from({ length: sides }, (_, i) => {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = radius + radius * Math.cos(angle);
        const y = radius + radius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const size = radius * 2;

    return (
        <div
            className="relative flex items-center justify-center"
            style={{
                width: size,
                height: size,
            }}
        >
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary" />

            <svg
                width={size}
                height={size}
                className="absolute inset-0"
            >
                <polygon
                    points={points}
                    className={`transition-colors ${selected
                            ? 'fill-primary/10 stroke-primary'
                            : 'fill-card/50 stroke-muted-foreground'
                        }`}
                    strokeWidth={selected ? 3 : 2}
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-medium text-foreground select-none">
                    {label}
                </span>
            </div>
        </div>
    );
});

PolygonNode.displayName = 'PolygonNode';
export default PolygonNode;
