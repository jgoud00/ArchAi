import { useEffect, useCallback } from 'react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { useClipboardStore } from '@/store/clipboardStore';

/**
 * Enhanced keyboard shortcuts for CAD operations
 */
export const useEnhancedCADShortcuts = () => {
    const {
        nodes,
        selectedNodeIds,
        setNodes,
        addNode,
        setSelectedNodes
    } = useBlueprintStore();

    const { copyNodes, pasteNodes, copiedNodes } = useClipboardStore();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));

        // Copy (Ctrl/Cmd + C)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedNodes.length > 0) {
            e.preventDefault();
            copyNodes(selectedNodes);
        }

        // Cut (Ctrl/Cmd + X)
        if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selectedNodes.length > 0) {
            e.preventDefault();
            copyNodes(selectedNodes);
            setNodes(nodes.filter(n => !selectedNodeIds.includes(n.id)));
        }

        // Paste (Ctrl/Cmd + V)
        if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedNodes.length > 0) {
            e.preventDefault();
            const pastedNodes = pasteNodes();
            pastedNodes.forEach(node => addNode(node));
        }

        // Duplicate (Ctrl/Cmd + D)
        if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedNodes.length > 0) {
            e.preventDefault();
            const duplicated = selectedNodes.map(node => ({
                ...node,
                id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                position: {
                    x: node.position.x + 20,
                    y: node.position.y + 20,
                },
            }));
            duplicated.forEach(node => addNode(node));
        }

        // Select All (Ctrl/Cmd + A)
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            setSelectedNodes(nodes.map(n => n.id));
        }

        // Delete (Delete or Backspace)
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodes.length > 0) {
            e.preventDefault();
            setNodes(nodes.filter(n => !selectedNodeIds.includes(n.id)));
        }

        // Escape - Deselect all
        if (e.key === 'Escape') {
            setSelectedNodes([]);
        }
    }, [nodes, selectedNodeIds, copyNodes, pasteNodes, copiedNodes, setNodes, addNode, setSelectedNodes]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};
