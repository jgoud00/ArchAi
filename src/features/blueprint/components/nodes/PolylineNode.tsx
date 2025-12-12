import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

/**
 * Polyline Node - Multi-segment line
 */
const PolylineNode = memo(({ data, selected }: NodeProps) => {
    const points = (data.points as Array<{ x: number; y: number }>) || [
        { x: 0, y: 50 },
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 150, y: 0 },
    ];
    const label = (data.label as string) || 'Polyline';

    // Calculate bounding box
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    const width = maxX - minX + 20;
    const height = maxY - minY + 20;
    const offsetX = 10 - minX;
    const offsetY = 10 - minY;

    // Create SVG path
    const pathData = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x + offsetX} ${p.y + offsetY}`)
        .join(' ');

    return (
        <div
            className="relative"
            style={{
                width: `${width}px`,
                height: `${height}px`,
            }}
        >
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary" />
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary" />

            <svg width={width} height={height} className="absolute inset-0">
                <path
                    d={pathData}
                    className={`transition-colors ${selected
                            ? 'stroke-primary'
                            : 'stroke-muted-foreground'
                        }`}
                    strokeWidth={selected ? 3 : 2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Draw points */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x + offsetX}
                        cy={p.y + offsetY}
                        r="3"
                        className={i === 0 ? 'fill-green-500' : i === points.length - 1 ? 'fill-red-500' : 'fill-primary'}
                    />
                ))}
            </svg>

            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-background px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
                {label}
            </div>
        </div>
    );
});

PolylineNode.displayName = 'PolylineNode';
export default PolylineNode;
