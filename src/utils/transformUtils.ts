import { Node } from '@xyflow/react';

/**
 * Transformation Utilities for CAD Operations
 * Provides geometric transformation helpers for rotation, scaling, and array patterns
 */

export interface Point {
    x: number;
    y: number;
}

export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Rotate a point around a center point by a given angle (in degrees)
 */
export function rotatePoint(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    angleDegrees: number
): Point {
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);

    // Translate point to origin
    const translatedX = x - centerX;
    const translatedY = y - centerY;

    // Rotate
    const rotatedX = translatedX * cos - translatedY * sin;
    const rotatedY = translatedX * sin + translatedY * cos;

    // Translate back
    return {
        x: rotatedX + centerX,
        y: rotatedY + centerY,
    };
}

/**
 * Scale a point from an origin point
 */
export function scalePoint(
    x: number,
    y: number,
    originX: number,
    originY: number,
    scaleX: number,
    scaleY: number
): Point {
    return {
        x: originX + (x - originX) * scaleX,
        y: originY + (y - originY) * scaleY,
    };
}

/**
 * Calculate positions for a linear (grid) array pattern
 */
export function calculateLinearArrayPositions(
    basePosition: Point,
    rows: number,
    columns: number,
    spacingX: number,
    spacingY: number
): Point[] {
    const positions: Point[] = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            // Skip the first position (0,0) as it's the original
            if (row === 0 && col === 0) continue;

            positions.push({
                x: basePosition.x + col * spacingX,
                y: basePosition.y + row * spacingY,
            });
        }
    }

    return positions;
}

/**
 * Calculate positions for a circular array pattern
 */
export function calculateCircularArrayPositions(
    centerX: number,
    centerY: number,
    count: number,
    radius: number,
    startAngleDegrees: number = 0,
    angleRangeDegrees: number = 360
): Point[] {
    const positions: Point[] = [];
    const angleStep = angleRangeDegrees / count;

    for (let i = 0; i < count; i++) {
        const angle = (startAngleDegrees + i * angleStep) * (Math.PI / 180);
        positions.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        });
    }

    return positions;
}

/**
 * Get the center point of a group of nodes
 */
export function getNodeGroupCenter(nodes: Node[]): Point {
    if (nodes.length === 0) return { x: 0, y: 0 };

    const centers = nodes.map(node => ({
        x: node.position.x + ((node.style?.width as number) || 100) / 2,
        y: node.position.y + ((node.style?.height as number) || 100) / 2,
    }));

    return {
        x: centers.reduce((sum, p) => sum + p.x, 0) / centers.length,
        y: centers.reduce((sum, p) => sum + p.y, 0) / centers.length,
    };
}

/**
 * Get the bounding box of a node
 */
export function getNodeBounds(node: Node): Bounds {
    return {
        x: node.position.x,
        y: node.position.y,
        width: (node.style?.width as number) || 100,
        height: (node.style?.height as number) || 100,
    };
}

/**
 * Check if two rectangular bounds overlap
 */
export function boundsOverlap(bounds1: Bounds, bounds2: Bounds): boolean {
    return !(
        bounds1.x + bounds1.width < bounds2.x ||
        bounds2.x + bounds2.width < bounds1.x ||
        bounds1.y + bounds1.height < bounds2.y ||
        bounds2.y + bounds2.height < bounds1.y
    );
}

/**
 * Get the overlap area between two bounds
 */
export function getOverlapArea(bounds1: Bounds, bounds2: Bounds): Bounds | null {
    if (!boundsOverlap(bounds1, bounds2)) return null;

    const x = Math.max(bounds1.x, bounds2.x);
    const y = Math.max(bounds1.y, bounds2.y);
    const maxX = Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width);
    const maxY = Math.min(bounds1.y + bounds1.height, bounds2.y + bounds2.height);

    return {
        x,
        y,
        width: maxX - x,
        height: maxY - y,
    };
}

/**
 * Calculate the distance between two nodes
 */
export function getNodeDistance(node1: Node, node2: Node): number {
    const center1 = {
        x: node1.position.x + ((node1.style?.width as number) || 100) / 2,
        y: node1.position.y + ((node1.style?.height as number) || 100) / 2,
    };
    const center2 = {
        x: node2.position.x + ((node2.style?.width as number) || 100) / 2,
        y: node2.position.y + ((node2.style?.height as number) || 100) / 2,
    };

    return Math.sqrt(
        Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
    );
}

/**
 * Calculate trimmed bounds for a node after removing overlap with another node
 * Returns the adjusted bounds or null if no overlap exists
 */
export function calculateTrimmedBounds(
    targetBounds: Bounds,
    trimmingBounds: Bounds
): Bounds | null {
    const overlap = getOverlapArea(targetBounds, trimmingBounds);
    if (!overlap) return null;

    // Determine which edge to trim based on overlap position relative to target
    const overlapCenterX = overlap.x + overlap.width / 2;
    const overlapCenterY = overlap.y + overlap.height / 2;

    // Calculate distances from overlap center to target edges
    const distToLeft = Math.abs(overlapCenterX - targetBounds.x);
    const distToRight = Math.abs(overlapCenterX - (targetBounds.x + targetBounds.width));
    const distToTop = Math.abs(overlapCenterY - targetBounds.y);
    const distToBottom = Math.abs(overlapCenterY - (targetBounds.y + targetBounds.height));

    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    const newBounds = { ...targetBounds };

    if (minDist === distToRight) {
        // Trim from right edge
        newBounds.width = overlap.x - targetBounds.x;
    } else if (minDist === distToLeft) {
        // Trim from left edge
        const newX = overlap.x + overlap.width;
        newBounds.x = newX;
        newBounds.width = (targetBounds.x + targetBounds.width) - newX;
    } else if (minDist === distToBottom) {
        // Trim from bottom edge
        newBounds.height = overlap.y - targetBounds.y;
    } else {
        // Trim from top edge
        const newY = overlap.y + overlap.height;
        newBounds.y = newY;
        newBounds.height = (targetBounds.y + targetBounds.height) - newY;
    }

    // Ensure minimum size
    if (newBounds.width < 20 || newBounds.height < 20) {
        return null; // Don't trim if it would make the node too small
    }

    return newBounds;
}

/**
 * Calculate extended bounds to meet a boundary
 * Extends the target node towards the boundary node
 */
export function calculateExtendedBounds(
    targetBounds: Bounds,
    boundaryBounds: Bounds
): Bounds {
    const newBounds = { ...targetBounds };

    // Calculate centers
    const targetCenterX = targetBounds.x + targetBounds.width / 2;
    const targetCenterY = targetBounds.y + targetBounds.height / 2;
    const boundaryCenterX = boundaryBounds.x + boundaryBounds.width / 2;
    const boundaryCenterY = boundaryBounds.y + boundaryBounds.height / 2;

    // Determine primary direction to extend
    const deltaX = Math.abs(boundaryCenterX - targetCenterX);
    const deltaY = Math.abs(boundaryCenterY - targetCenterY);

    if (deltaX > deltaY) {
        // Extend horizontally
        if (boundaryCenterX > targetCenterX) {
            // Extend to the right
            const targetRight = targetBounds.x + targetBounds.width;
            if (boundaryBounds.x > targetRight) {
                newBounds.width = boundaryBounds.x - targetBounds.x;
            }
        } else {
            // Extend to the left
            if (boundaryBounds.x + boundaryBounds.width < targetBounds.x) {
                const newX = boundaryBounds.x + boundaryBounds.width;
                newBounds.width = (targetBounds.x + targetBounds.width) - newX;
                newBounds.x = newX;
            }
        }
    } else {
        // Extend vertically
        if (boundaryCenterY > targetCenterY) {
            // Extend downward
            const targetBottom = targetBounds.y + targetBounds.height;
            if (boundaryBounds.y > targetBottom) {
                newBounds.height = boundaryBounds.y - targetBounds.y;
            }
        } else {
            // Extend upward
            if (boundaryBounds.y + boundaryBounds.height < targetBounds.y) {
                const newY = boundaryBounds.y + boundaryBounds.height;
                newBounds.height = (targetBounds.y + targetBounds.height) - newY;
                newBounds.y = newY;
            }
        }
    }

    return newBounds;
}
