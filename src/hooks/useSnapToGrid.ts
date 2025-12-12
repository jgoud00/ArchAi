import { useBlueprintStore } from '@/features/blueprint/store/blueprintStore';
import { snapToGrid as snapToGridUtil, smartSnap } from '@/utils/snapEngine';
import { useCallback } from 'react';

/**
 * Hook for grid and object snapping functionality
 */
export const useSnapToGrid = () => {
    const {
        gridSize,
        snapEnabled,
        objectSnapEnabled,
        nodes,
    } = useBlueprintStore();

    const snapPosition = useCallback(
        (x: number, y: number): { x: number; y: number } => {
            let position = { x, y };

            // Apply grid snapping if enabled
            if (snapEnabled) {
                position = snapToGridUtil(position.x, position.y, gridSize);
            }

            // Apply object snapping if enabled
            if (objectSnapEnabled) {
                const snapResult = smartSnap(position.x, position.y, nodes, gridSize, { center: true, edge: true });
                if (snapResult.snapped) {
                    position = { x: snapResult.x, y: snapResult.y };
                }
            }

            return position;
        },
        [snapEnabled, objectSnapEnabled, gridSize, nodes]
    );

    return {
        snapPosition,
        isSnapEnabled: snapEnabled,
        isObjectSnapEnabled: objectSnapEnabled,
        gridSize,
    };
};
