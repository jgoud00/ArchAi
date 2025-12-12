import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath } from '@xyflow/react';

export const WallEdge = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    markerEnd,
    style = {},
}: EdgeProps) => {
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    // Calculate length in "meters" (assuming 50px = 1m)
    const lengthPixels = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
    const lengthMeters = (lengthPixels / 50).toFixed(2);

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ strokeWidth: 4, stroke: '#333', ...style }} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        background: '#ffcc00',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        pointerEvents: 'none',
                    }}
                    className="nodrag nopan"
                >
                    {lengthMeters}m
                </div>
            </EdgeLabelRenderer>
        </>
    );
};
