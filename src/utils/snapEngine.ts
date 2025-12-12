import { Node } from '@xyflow/react';

/**
 * Advanced snapping utilities for CAD precision
 */

export interface SnapPoint {
    x: number;
    y: number;
    type: 'grid' | 'center' | 'edge' | 'midpoint' | 'intersection';
    nodeId?: string;
}

export interface SnapResult {
    x: number;
    y: number;
    snapped: boolean;
    snapPoint?: SnapPoint;
}

/**
 * Snap to grid intersections
 */
export function snapToGrid(
    x: number,
    y: number,
    gridSize: number,
    tolerance: number = 10
): SnapResult {
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;

    const distanceX = Math.abs(x - snappedX);
    const distanceY = Math.abs(y - snappedY);

    if (distanceX <= tolerance && distanceY <= tolerance) {
        return {
            x: snappedX,
            y: snappedY,
            snapped: true,
            snapPoint: { x: snappedX, y: snappedY, type: 'grid' },
        };
    }

    return { x, y, snapped: false };
}

/**
 * Snap to node centers
 */
export function snapToCenter(
    x: number,
    y: number,
    nodes: Node[],
    tolerance: number = 15
): SnapResult {
    for (const node of nodes) {
        const nodeWidth = (node.style?.width as number) || 100;
        const nodeHeight = (node.style?.height as number) || 100;
        const centerX = node.position.x + nodeWidth / 2;
        const centerY = node.position.y + nodeHeight / 2;

        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        if (distance <= tolerance) {
            return {
                x: centerX,
                y: centerY,
                snapped: true,
                snapPoint: {
                    x: centerX,
                    y: centerY,
                    type: 'center',
                    nodeId: node.id,
                },
            };
        }
    }

    return { x, y, snapped: false };
}

/**
 * Snap to node edges
 */
export function snapToEdge(
    x: number,
    y: number,
    nodes: Node[],
    tolerance: number = 10
): SnapResult {
    for (const node of nodes) {
        const nodeWidth = (node.style?.width as number) || 100;
        const nodeHeight = (node.style?.height as number) || 100;

        const edges = [
            { x: node.position.x, y: node.position.y, type: 'top-left' },
            { x: node.position.x + nodeWidth, y: node.position.y, type: 'top-right' },
            { x: node.position.x, y: node.position.y + nodeHeight, type: 'bottom-left' },
            { x: node.position.x + nodeWidth, y: node.position.y + nodeHeight, type: 'bottom-right' },
        ];

        for (const edge of edges) {
            const distance = Math.sqrt(Math.pow(x - edge.x, 2) + Math.pow(y - edge.y, 2));

            if (distance <= tolerance) {
                return {
                    x: edge.x,
                    y: edge.y,
                    snapped: true,
                    snapPoint: {
                        x: edge.x,
                        y: edge.y,
                        type: 'edge',
                        nodeId: node.id,
                    },
                };
            }
        }
    }

    return { x, y, snapped: false };
}

/**
 * Snap to midpoints
 */
export function snapToMidpoint(
    x: number,
    y: number,
    nodes: Node[],
    tolerance: number = 10
): SnapResult {
    for (const node of nodes) {
        const nodeWidth = (node.style?.width as number) || 100;
        const nodeHeight = (node.style?.height as number) || 100;

        const midpoints = [
            { x: node.position.x + nodeWidth / 2, y: node.position.y, type: 'top' },
            { x: node.position.x + nodeWidth / 2, y: node.position.y + nodeHeight, type: 'bottom' },
            { x: node.position.x, y: node.position.y + nodeHeight / 2, type: 'left' },
            { x: node.position.x + nodeWidth, y: node.position.y + nodeHeight / 2, type: 'right' },
        ];

        for (const midpoint of midpoints) {
            const distance = Math.sqrt(Math.pow(x - midpoint.x, 2) + Math.pow(y - midpoint.y, 2));

            if (distance <= tolerance) {
                return {
                    x: midpoint.x,
                    y: midpoint.y,
                    snapped: true,
                    snapPoint: {
                        x: midpoint.x,
                        y: midpoint.y,
                        type: 'midpoint',
                        nodeId: node.id,
                    },
                };
            }
        }
    }

    return { x, y, snapped: false };
}

/**
 * Combined smart snap - tries all snap modes
 */
export function smartSnap(
    x: number,
    y: number,
    nodes: Node[],
    gridSize: number,
    enabledModes: {
        grid?: boolean;
        center?: boolean;
        edge?: boolean;
        midpoint?: boolean;
    } = {}
): SnapResult {
    const { grid = true, center = true, edge = true, midpoint = true } = enabledModes;

    // Try center snap first (highest priority)
    if (center) {
        const centerSnap = snapToCenter(x, y, nodes, 15);
        if (centerSnap.snapped) return centerSnap;
    }

    // Try edge snap
    if (edge) {
        const edgeSnap = snapToEdge(x, y, nodes, 10);
        if (edgeSnap.snapped) return edgeSnap;
    }

    // Try midpoint snap
    if (midpoint) {
        const midpointSnap = snapToMidpoint(x, y, nodes, 10);
        if (midpointSnap.snapped) return midpointSnap;
    }

    // Try grid snap last (lowest priority)
    if (grid) {
        const gridSnap = snapToGrid(x, y, gridSize, 10);
        if (gridSnap.snapped) return gridSnap;
    }

    return { x, y, snapped: false };
}

/**
 * Find nearest snap point to given coordinates
 */
export function findNearestSnapPoint(
    x: number,
    y: number,
    nodes: Node[],
    tolerance: number = 20
): { x: number; y: number } | null {
    let nearest: { x: number; y: number; distance: number } | null = null;

    for (const node of nodes) {
        const nodeWidth = (node.style?.width as number) || 100;
        const nodeHeight = (node.style?.height as number) || 100;

        // Check all snap points
        const points = [
            { x: node.position.x, y: node.position.y },
            { x: node.position.x + nodeWidth, y: node.position.y },
            { x: node.position.x, y: node.position.y + nodeHeight },
            { x: node.position.x + nodeWidth, y: node.position.y + nodeHeight },
            { x: node.position.x + nodeWidth / 2, y: node.position.y },
            { x: node.position.x + nodeWidth / 2, y: node.position.y + nodeHeight },
            { x: node.position.x, y: node.position.y + nodeHeight / 2 },
            { x: node.position.x + nodeWidth, y: node.position.y + nodeHeight / 2 },
            { x: node.position.x + nodeWidth / 2, y: node.position.y + nodeHeight / 2 },
        ];

        for (const point of points) {
            const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (distance <= tolerance && (!nearest || distance < nearest.distance)) {
                nearest = { x: point.x, y: point.y, distance };
            }
        }
    }

    return nearest ? { x: nearest.x, y: nearest.y } : null;
}
