import { useEffect } from 'react';
import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';

/**
 * useKeyboardNav - Enhanced keyboard navigation for accessibility
 * Arrow keys for precise node movement, Tab for focus management
 */
export const useKeyboardNav = () => {
    const { selectedNodeIds, nodes, setNodes } = useBlueprintStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (selectedNodeIds.length === 0) return;

            let moveX = 0;
            let moveY = 0;
            const step = e.shiftKey ? 10 : e.ctrlKey || e.metaKey ? 1 : 5;

            switch (e.key) {
                case 'ArrowLeft':
                    moveX = -step;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    moveX = step;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    moveY = -step;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    moveY = step;
                    e.preventDefault();
                    break;
                default:
                    return;
            }

            // Move selected nodes
            const updatedNodes = nodes.map(node => {
                if (selectedNodeIds.includes(node.id)) {
                    return {
                        ...node,
                        position: {
                            x: node.position.x + moveX,
                            y: node.position.y + moveY,
                        },
                    };
                }
                return node;
            });

            setNodes(updatedNodes);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeIds, nodes, setNodes]);
};
