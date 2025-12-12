import { useEffect } from 'react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { Node } from '@xyflow/react';

// Clipboard for copy/paste
let clipboard: Node[] = [];

/**
 * Hook for comprehensive CAD keyboard shortcuts
 */
export const useCADShortcuts = (onOpenHelp?: () => void) => {
    const {
        setSelectedTool,
        toggleGridVisible,
        toggleSnap,
        selectedNodeIds,
        setSelectedNodes,
        nodes,
        setNodes,
    } = useBlueprintStore();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts if user is typing in an input
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            // Help panel
            if (event.key === 'F1' || event.key === '?') {
                event.preventDefault();
                onOpenHelp?.();
                return;
            }

            // Tool shortcuts
            switch (event.key.toLowerCase()) {
                case 'l':
                    event.preventDefault();
                    setSelectedTool('line');
                    break;
                case 'r':
                    if (!event.ctrlKey) {
                        event.preventDefault();
                        setSelectedTool('rectangle');
                    }
                    break;
                case 'c':
                    if (event.ctrlKey && selectedNodeIds.length > 0) {
                        // Copy
                        event.preventDefault();
                        clipboard = nodes.filter(node => selectedNodeIds.includes(node.id));
                    } else if (!event.ctrlKey) {
                        event.preventDefault();
                        setSelectedTool('circle');
                    }
                    break;
                case 'v':
                    if (event.ctrlKey && clipboard.length > 0) {
                        // Paste
                        event.preventDefault();
                        const pasted = clipboard.map(node => ({
                            ...node,
                            id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            position: {
                                x: node.position.x + 40,
                                y: node.position.y + 40,
                            },
                        }));
                        setNodes([...nodes, ...pasted]);
                        setSelectedNodes(pasted.map(n => n.id));
                    }
                    break;
                case 'w':
                    if (!event.ctrlKey) {
                        event.preventDefault();
                        setSelectedTool('wall');
                    }
                    break;
                case 'd':
                    if (event.ctrlKey && selectedNodeIds.length > 0) {
                        // Duplicate
                        event.preventDefault();
                        const nodesToDuplicate = nodes.filter(node =>
                            selectedNodeIds.includes(node.id)
                        );
                        const duplicated = nodesToDuplicate.map(node => ({
                            ...node,
                            id: `${node.id}-copy-${Date.now()}`,
                            position: {
                                x: node.position.x + 20,
                                y: node.position.y + 20,
                            },
                        }));
                        setNodes([...nodes, ...duplicated]);
                        setSelectedNodes(duplicated.map(n => n.id));
                    } else if (!event.ctrlKey) {
                        event.preventDefault();
                        setSelectedTool('door');
                    }
                    break;
                case 'm':
                    if (!event.ctrlKey) {
                        event.preventDefault();
                        setSelectedTool('measure');
                    }
                    break;
                case 's':
                    if (!event.ctrlKey) {
                        event.preventDefault();
                        toggleSnap();
                    }
                    break;
                case 'escape':
                    event.preventDefault();
                    setSelectedTool('select');
                    setSelectedNodes([]);
                    break;
                case 'delete':
                    event.preventDefault();
                    if (selectedNodeIds.length > 0) {
                        const updatedNodes = nodes.filter(
                            node => !selectedNodeIds.includes(node.id)
                        );
                        setNodes(updatedNodes);
                        setSelectedNodes([]);
                    }
                    break;
                case 'a':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        // Select all nodes
                        setSelectedNodes(nodes.map(n => n.id));
                    }
                    break;
                case 'g':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        // Group selected nodes
                        if (event.shiftKey && selectedNodeIds.length > 0) {
                            // Ungroup (Ctrl+Shift+G)
                            const updated = nodes.map(node => {
                                if (selectedNodeIds.includes(node.id) && (node.data as any).groupId) {
                                    const { groupId, ...restData } = node.data as any;
                                    return { ...node, data: restData };
                                }
                                return node;
                            });
                            setNodes(updated);
                        } else if (selectedNodeIds.length >= 2) {
                            // Group (Ctrl+G)
                            const groupId = `group-${Date.now()}`;
                            const updated = nodes.map(node => {
                                if (selectedNodeIds.includes(node.id)) {
                                    return {
                                        ...node,
                                        data: { ...node.data, groupId }
                                    };
                                }
                                return node;
                            });
                            setNodes(updated);
                        }
                    } else {
                        // Toggle grid (G without Ctrl)
                        event.preventDefault();
                        toggleGridVisible();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [setSelectedTool, toggleGridVisible, toggleSnap, selectedNodeIds, setSelectedNodes, nodes, setNodes, onOpenHelp]);
};
