import { useBlueprintStore } from '@/store/blueprintStore';
import { Button } from '@/components/ui/Button';
import {
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    AlignHorizontalSpaceAround,
    AlignVerticalSpaceAround
} from 'lucide-react';

/**
 * Alignment and distribution tools for selected nodes
 */
export const AlignmentTools = () => {
    const { nodes, selectedNodeIds, setNodes } = useBlueprintStore();

    if (selectedNodeIds.length < 2) return null;

    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));

    const alignLeft = () => {
        const minX = Math.min(...selectedNodes.map(n => n.position.x));
        const updated = nodes.map(node =>
            selectedNodeIds.includes(node.id)
                ? { ...node, position: { ...node.position, x: minX } }
                : node
        );
        setNodes(updated);
    };

    const alignCenter = () => {
        const positions = selectedNodes.map(n => n.position.x + ((n.style?.width as number) || 0) / 2);
        const avgX = positions.reduce((a, b) => a + b, 0) / positions.length;

        const updated = nodes.map(node => {
            if (selectedNodeIds.includes(node.id)) {
                const width = (node.style?.width as number) || 0;
                return { ...node, position: { ...node.position, x: avgX - width / 2 } };
            }
            return node;
        });
        setNodes(updated);
    };

    const alignRight = () => {
        const maxX = Math.max(...selectedNodes.map(n => n.position.x + ((n.style?.width as number) || 0)));
        const updated = nodes.map(node => {
            if (selectedNodeIds.includes(node.id)) {
                const width = (node.style?.width as number) || 0;
                return { ...node, position: { ...node.position, x: maxX - width } };
            }
            return node;
        });
        setNodes(updated);
    };

    const alignTop = () => {
        const minY = Math.min(...selectedNodes.map(n => n.position.y));
        const updated = nodes.map(node =>
            selectedNodeIds.includes(node.id)
                ? { ...node, position: { ...node.position, y: minY } }
                : node
        );
        setNodes(updated);
    };

    const alignMiddle = () => {
        const positions = selectedNodes.map(n => n.position.y + ((n.style?.height as number) || 0) / 2);
        const avgY = positions.reduce((a, b) => a + b, 0) / positions.length;

        const updated = nodes.map(node => {
            if (selectedNodeIds.includes(node.id)) {
                const height = (node.style?.height as number) || 0;
                return { ...node, position: { ...node.position, y: avgY - height / 2 } };
            }
            return node;
        });
        setNodes(updated);
    };

    const alignBottom = () => {
        const maxY = Math.max(...selectedNodes.map(n => n.position.y + ((n.style?.height as number) || 0)));
        const updated = nodes.map(node => {
            if (selectedNodeIds.includes(node.id)) {
                const height = (node.style?.height as number) || 0;
                return { ...node, position: { ...node.position, y: maxY - height } };
            }
            return node;
        });
        setNodes(updated);
    };

    const distributeHorizontally = () => {
        if (selectedNodes.length < 3) return;

        const sorted = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalWidth = last.position.x - first.position.x;
        const spacing = totalWidth / (sorted.length - 1);

        const updated = nodes.map(node => {
            const index = sorted.findIndex(n => n.id === node.id);
            if (index > 0 && index < sorted.length - 1) {
                return { ...node, position: { ...node.position, x: first.position.x + spacing * index } };
            }
            return node;
        });
        setNodes(updated);
    };

    const distributeVertically = () => {
        if (selectedNodes.length < 3) return;

        const sorted = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalHeight = last.position.y - first.position.y;
        const spacing = totalHeight / (sorted.length - 1);

        const updated = nodes.map(node => {
            const index = sorted.findIndex(n => n.id === node.id);
            if (index > 0 && index < sorted.length - 1) {
                return { ...node, position: { ...node.position, y: first.position.y + spacing * index } };
            }
            return node;
        });
        setNodes(updated);
    };

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 glass-dark p-2 rounded-lg flex gap-1 z-50">
            <div className="flex gap-1 pr-2 border-r border-border">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={alignLeft}
                    title="Align Left"
                    className="h-8 w-8"
                >
                    <AlignHorizontalJustifyStart className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={alignCenter}
                    title="Align Center"
                    className="h-8 w-8"
                >
                    <AlignHorizontalJustifyCenter className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={alignRight}
                    title="Align Right"
                    className="h-8 w-8"
                >
                    <AlignHorizontalJustifyEnd className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex gap-1 pr-2 border-r border-border">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={alignTop}
                    title="Align Top"
                    className="h-8 w-8"
                >
                    <AlignVerticalJustifyStart className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={alignMiddle}
                    title="Align Middle"
                    className="h-8 w-8"
                >
                    <AlignVerticalJustifyCenter className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={alignBottom}
                    title="Align Bottom"
                    className="h-8 w-8"
                >
                    <AlignVerticalJustifyEnd className="h-4 w-4" />
                </Button>
            </div>

            {selectedNodeIds.length >= 3 && (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={distributeHorizontally}
                        title="Distribute Horizontally"
                        className="h-8 w-8"
                    >
                        <AlignHorizontalSpaceAround className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={distributeVertically}
                        title="Distribute Vertically"
                        className="h-8 w-8"
                    >
                        <AlignVerticalSpaceAround className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};
