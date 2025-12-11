import { useBlueprintStore } from '@/store/blueprintStore';
import { snapToGrid as snapToGridUtil, snapToObject as snapToObjectUtil } from '@/utils/snapEngine';
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
                position = snapToObjectUtil(position.x, position.y, nodes, 20);
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
