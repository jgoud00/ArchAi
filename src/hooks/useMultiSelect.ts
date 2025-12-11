import { useState, useCallback } from 'react';
import { useBlueprintStore } from '@/store/blueprintStore';

/**
 * Hook for multi-selection logic
 */
export const useMultiSelect = () => {
    const { selectedNodeIds, setSelectedNodes } = useBlueprintStore();
    const [shiftPressed, setShiftPressed] = useState(false);

    // Track shift key state
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Shift') {
            setShiftPressed(true);
        }
    }, []);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Shift') {
            setShiftPressed(false);
        }
    }, []);

    // Add/toggle node selection
    const toggleNodeSelection = useCallback((nodeId: string, isShift: boolean = false) => {
        if (isShift) {
            // Shift+Click: Add to selection or remove if already selected
            if (selectedNodeIds.includes(nodeId)) {
                setSelectedNodes(selectedNodeIds.filter(id => id !== nodeId));
            } else {
                setSelectedNodes([...selectedNodeIds, nodeId]);
            }
        } else {
            // Normal click: Replace selection
            setSelectedNodes([nodeId]);
        }
    }, [selectedNodeIds, setSelectedNodes]);

    // Select all nodes
    const selectAll = useCallback((allNodeIds: string[]) => {
        setSelectedNodes(allNodeIds);
    }, [setSelectedNodes]);

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelectedNodes([]);
    }, [setSelectedNodes]);

    return {
        selectedNodeIds,
        shiftPressed,
        toggleNodeSelection,
        selectAll,
        clearSelection,
        handleKeyDown,
        handleKeyUp,
    };
};
