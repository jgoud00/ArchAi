import { useBlueprintStore } from '@/store/blueprintStore';
import { Button } from '@/components/ui/Button';
import { FlipHorizontal, FlipVertical, RotateCw, RotateCcw } from 'lucide-react';

/**
 * Transform controls for selected nodes (mirror, flip, rotate)
 */
export const TransformControls = () => {
    const { nodes, selectedNodeIds, setNodes } = useBlueprintStore();

    if (selectedNodeIds.length === 0) return null;

    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));

    // Calculate center point of selection
    const getCenterPoint = () => {
        const xs = selectedNodes.map(n => n.position.x + ((n.style?.width as number) || 0) / 2);
        const ys = selectedNodes.map(n => n.position.y + ((n.style?.height as number) || 0) / 2);
        return {
            x: xs.reduce((a, b) => a + b, 0) / xs.length,
            y: ys.reduce((a, b) => a + b, 0) / ys.length,
        };
    };

    const mirrorHorizontal = () => {
        const center = getCenterPoint();
        const updated = nodes.map(node => {
            if (selectedNodeIds.includes(node.id)) {
                const nodeCenter = node.position.x + ((node.style?.width as number) || 0) / 2;
                const offset = nodeCenter - center.x;
                const newX = center.x - offset - ((node.style?.width as number) || 0) / 2;
                return { ...node, position: { ...node.position, x: newX } };
            }
            return node;
        });
        setNodes(updated);
    };

    const mirrorVertical = () => {
        const center = getCenterPoint();
        const updated = nodes.map(node => {
            if (selectedNodeIds.includes(node.id)) {
                const nodeCenter = node.position.y + ((node.style?.height as number) || 0) / 2;
                const offset = nodeCenter - center.y;
                const newY = center.y - offset - ((node.style?.height as number) || 0) / 2;
                return { ...node, position: { ...node.position, y: newY } };
            }
            return node;
        });
        setNodes(updated);
    };

    const rotate90CW = () => {
        const center = getCenterPoint();
        const updated = nodes.map(node => {
            if (selectedNodeIds.includes(node.id)) {
                const width = (node.style?.width as number) || 0;
                const height = (node.style?.height as number) || 0;

                // Get node center
                const nodeCenterX = node.position.x + width / 2;
                const nodeCenterY = node.position.y + height / 2;

                // Rotate around selection center (90° CW)
                const dx = nodeCenterX - center.x;
                const dy = nodeCenterY - center.y;
                const newCenterX = center.x + dy;
                const newCenterY = center.y - dx;

                // New position (swap width/height for 90° rotation)
                const newX = newCenterX - height / 2;
                const newY = newCenterY - width / 2;

                return {
                    ...node,
                    position: { x: newX, y: newY },
                    style: { ...node.style, width: height, height: width }
                };
            }
            return node;
        });
        setNodes(updated);
    };

    const rotate90CCW = () => {
        const center = getCenterPoint();
        const updated = nodes.map(node => {
            if (selectedNodeIds.includes(node.id)) {
                const width = (node.style?.width as number) || 0;
                const height = (node.style?.height as number) || 0;

                // Get node center
                const nodeCenterX = node.position.x + width / 2;
                const nodeCenterY = node.position.y + height / 2;

                // Rotate around selection center (90° CCW)
                const dx = nodeCenterX - center.x;
                const dy = nodeCenterY - center.y;
                const newCenterX = center.x - dy;
                const newCenterY = center.y + dx;

                // New position (swap width/height for 90° rotation)
                const newX = newCenterX - height / 2;
                const newY = newCenterY - width / 2;

                return {
                    ...node,
                    position: { x: newX, y: newY },
                    style: { ...node.style, width: height, height: width }
                };
            }
            return node;
        });
        setNodes(updated);
    };

    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 glass-dark p-2 rounded-lg flex gap-1 z-50">
            <Button
                variant="ghost"
                size="icon"
                onClick={mirrorHorizontal}
                title="Mirror Horizontal"
                className="h-8 w-8"
            >
                <FlipHorizontal className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={mirrorVertical}
                title="Mirror Vertical"
                className="h-8 w-8"
            >
                <FlipVertical className="h-4 w-4" />
            </Button>
            <div className="w-px h-8 bg-border mx-1" />
            <Button
                variant="ghost"
                size="icon"
                onClick={rotate90CW}
                title="Rotate 90° CW"
                className="h-8 w-8"
            >
                <RotateCw className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={rotate90CCW}
                title="Rotate 90° CCW"
                className="h-8 w-8"
            >
                <RotateCcw className="h-4 w-4" />
            </Button>
        </div>
    );
};
