import { memo, useMemo } from 'react';
import { Node } from '@xyflow/react';

interface VirtualCanvasProps {
    nodes: Node[];
    viewport: { x: number; y: number; width: number; height: number; zoom: number };
    children: (visibleNodes: Node[]) => React.ReactNode;
}

/**
 * VirtualCanvas - Only renders nodes visible in viewport
 * Massive performance improvement for large blueprints (1000+ nodes)
 */
export const VirtualCanvas = memo(({ nodes, viewport, children }: VirtualCanvasProps) => {
    // Calculate visible nodes based on viewport
    const visibleNodes = useMemo(() => {
        const { x, y, width, height, zoom } = viewport;

        // Add buffer to prevent pop-in
        const buffer = 100;
        const viewportLeft = x - buffer;
        const viewportTop = y - buffer;
        const viewportRight = x + width / zoom + buffer;
        const viewportBottom = y + height / zoom + buffer;

        return nodes.filter(node => {
            const nodeWidth = (node.style?.width as number) || 100;
            const nodeHeight = (node.style?.height as number) || 100;
            const nodeRight = node.position.x + nodeWidth;
            const nodeBottom = node.position.y + nodeHeight;

            // Check if node intersects viewport
            return !(
                nodeRight < viewportLeft ||
                node.position.x > viewportRight ||
                nodeBottom < viewportTop ||
                node.position.y > viewportBottom
            );
        });
    }, [nodes, viewport]);

    return <>{children(visibleNodes)}</>;
});

VirtualCanvas.displayName = 'VirtualCanvas';
