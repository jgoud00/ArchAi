import { useEffect } from 'react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';

/**
 * useMultiSelect - Enhanced multi-selection logic
 * Handles Shift+Click for multi-select, Box Selection, and Keyboard Shortcuts (Ctrl+A, Esc)
 */
export const useMultiSelect = () => {
    const { nodes, selectedNodeIds, setSelectedNodes } = useBlueprintStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd+A: Select All
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                // Only prevent default if we're not inside an input/textarea
                const target = e.target as HTMLElement;
                if (!['INPUT', 'TEXTAREA'].includes(target.tagName)) {
                    e.preventDefault();
                    const allNodeIds = nodes.map(n => n.id);
                    setSelectedNodes(allNodeIds);
                }
            }

            // Escape: Deselect All
            if (e.key === 'Escape') {
                setSelectedNodes([]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nodes, setSelectedNodes]);

    const handleNodeClick = (nodeId: string, shiftKey: boolean) => {
        if (shiftKey) {
            // Add to selection or toggle
            if (selectedNodeIds.includes(nodeId)) {
                setSelectedNodes(selectedNodeIds.filter(id => id !== nodeId));
            } else {
                setSelectedNodes([...selectedNodeIds, nodeId]);
            }
        } else {
            // Replace selection
            setSelectedNodes([nodeId]);
        }
    };

    const selectBox = (startX: number, startY: number, endX: number, endY: number) => {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);

        const nodesInBox = nodes.filter(node => {
            const width = (node.style?.width as number) || 100;
            const height = (node.style?.height as number) || 100;
            const nodeRight = node.position.x + width;
            const nodeBottom = node.position.y + height;

            return (
                node.position.x >= minX &&
                nodeRight <= maxX &&
                node.position.y >= minY &&
                nodeBottom <= maxY
            );
        });

        setSelectedNodes(nodesInBox.map(n => n.id));
    };

    const clearSelection = () => setSelectedNodes([]);
    const selectAll = () => setSelectedNodes(nodes.map(n => n.id));

    return {
        handleNodeClick,
        selectBox,
        selectedNodeIds,
        clearSelection,
        selectAll
    };
};
