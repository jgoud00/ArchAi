import { Node } from '@xyflow/react';

/**
 * Snap coordinates to the nearest grid point
 */
export const snapToGrid = (x: number, y: number, gridSize: number): { x: number; y: number } => {
    return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
    };
};

/**
 * Find the nearest snap point among all nodes
 */
export const findNearestSnapPoint = (
    x: number,
    y: number,
    nodes: Node[],
    threshold: number = 20
): { x: number; y: number } | null => {
    let nearest: { x: number; y: number; distance: number } | null = null;


    for (const node of nodes) {
        // Check node center
        const centerX = node.position.x + ((node.style?.width as number) || 0) / 2;
        const centerY = node.position.y + ((node.style?.height as number) || 0) / 2;
        const centerDistance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        if (centerDistance < threshold && (!nearest || centerDistance < nearest.distance)) {
            nearest = { x: centerX, y: centerY, distance: centerDistance };
        }

        // Check corners
        const corners = [
            { x: node.position.x, y: node.position.y }, // Top-left
            { x: node.position.x + ((node.style?.width as number) || 0), y: node.position.y }, // Top-right
            { x: node.position.x, y: node.position.y + ((node.style?.height as number) || 0) }, // Bottom-left
            { x: node.position.x + ((node.style?.width as number) || 0), y: node.position.y + ((node.style?.height as number) || 0) }, // Bottom-right
        ];

        for (const corner of corners) {
            const distance = Math.sqrt(Math.pow(x - corner.x, 2) + Math.pow(y - corner.y, 2));
            if (distance < threshold && (!nearest || distance < nearest.distance)) {
                nearest = { x: corner.x, y: corner.y, distance };
            }
        }

        // Check edge midpoints
        const width = (node.style?.width as number) || 0;
        const height = (node.style?.height as number) || 0;
        const edges = [
            { x: node.position.x + width / 2, y: node.position.y }, // Top
            { x: node.position.x + width / 2, y: node.position.y + height }, // Bottom
            { x: node.position.x, y: node.position.y + height / 2 }, // Left
            { x: node.position.x + width, y: node.position.y + height / 2 }, // Right
        ];

        for (const edge of edges) {
            const distance = Math.sqrt(Math.pow(x - edge.x, 2) + Math.pow(y - edge.y, 2));
            if (distance < threshold && (!nearest || distance < nearest.distance)) {
                nearest = { x: edge.x, y: edge.y, distance };
            }
        }
    }

    if (nearest !== null) {
        return { x: nearest.x, y: nearest.y };
    }
    return null;
};

/**
 * Snap to nearby objects if within threshold
 */
export const snapToObject = (
    x: number,
    y: number,
    nodes: Node[],
    threshold: number = 20
): { x: number; y: number } => {
    const snapPoint = findNearestSnapPoint(x, y, nodes, threshold);
    return snapPoint || { x, y };
};

/**
 * Snap angle to common angles (0°, 45°, 90°, 135°, 180°, etc.)
 */
export const snapToAngle = (angle: number, snapAngles: number[] = [0, 45, 90, 135, 180, 225, 270, 315]): number => {
    // Normalize angle to 0-360 range
    const normalized = ((angle % 360) + 360) % 360;

    let nearestAngle = snapAngles[0];
    let minDifference = Math.abs(normalized - snapAngles[0]);

    snapAngles.forEach(snapAngle => {
        const difference = Math.abs(normalized - snapAngle);
        if (difference < minDifference) {
            minDifference = difference;
            nearestAngle = snapAngle;
        }
    });

    return nearestAngle;
};
