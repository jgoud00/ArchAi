import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

/**
 * Bezier Curve Node - Smooth curved paths
 */
const BezierNode = memo(({ data, selected }: NodeProps) => {
    const start = (data.start as { x: number; y: number }) || { x: 0, y: 80 };
    const controlPoint1 = (data.cp1 as { x: number; y: number }) || { x: 50, y: 0 };
    const controlPoint2 = (data.cp2 as { x: number; y: number }) || { x: 100, y: 0 };
    const end = (data.end as { x: number; y: number }) || { x: 150, y: 80 };
    const label = (data.label as string) || 'Bezier';

    // Calculate bounding box
    const allX = [start.x, controlPoint1.x, controlPoint2.x, end.x];
    const allY = [start.y, controlPoint1.y, controlPoint2.y, end.y];
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    const width = maxX - minX + 20;
    const height = maxY - minY + 20;
    const offsetX = 10 - minX;
    const offsetY = 10 - minY;

    // Bezier curve path
    const curvePath = `M ${start.x + offsetX} ${start.y + offsetY} C ${controlPoint1.x + offsetX} ${controlPoint1.y + offsetY}, ${controlPoint2.x + offsetX} ${controlPoint2.y + offsetY}, ${end.x + offsetX} ${end.y + offsetY}`;

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
                {/* Control lines (dashed) */}
                <line
                    x1={start.x + offsetX}
                    y1={start.y + offsetY}
                    x2={controlPoint1.x + offsetX}
                    y2={controlPoint1.y + offsetY}
                    className="stroke-muted-foreground/30"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                />
                <line
                    x1={controlPoint2.x + offsetX}
                    y1={controlPoint2.y + offsetY}
                    x2={end.x + offsetX}
                    y2={end.y + offsetY}
                    className="stroke-muted-foreground/30"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                />

                {/* Main bezier curve */}
                <path
                    d={curvePath}
                    className={`transition-colors ${selected
                            ? 'stroke-primary'
                            : 'stroke-muted-foreground'
                        }`}
                    strokeWidth={selected ? 3 : 2}
                    fill="none"
                />

                {/* Start point */}
                <circle
                    cx={start.x + offsetX}
                    cy={start.y + offsetY}
                    r="4"
                    className="fill-green-500"
                />

                {/* End point */}
                <circle
                    cx={end.x + offsetX}
                    cy={end.y + offsetY}
                    r="4"
                    className="fill-red-500"
                />

                {/* Control points */}
                <circle
                    cx={controlPoint1.x + offsetX}
                    cy={controlPoint1.y + offsetY}
                    r="3"
                    className="fill-blue-500"
                />
                <circle
                    cx={controlPoint2.x + offsetX}
                    cy={controlPoint2.y + offsetY}
                    r="3"
                    className="fill-blue-500"
                />
            </svg>

            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-background px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
                {label}
            </div>
        </div>
    );
});

BezierNode.displayName = 'BezierNode';
export default BezierNode;
