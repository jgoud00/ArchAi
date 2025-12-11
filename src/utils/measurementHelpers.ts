import { Node } from '@xyflow/react';

/**
 * Calculate Euclidean distance between two points
 */
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Calculate area of a node in square pixels
 */
export const calculateArea = (node: Node): number => {
    const width = (node.style?.width as number) || 0;
    const height = (node.style?.height as number) || 0;
    return width * height;
};

/**
 * Calculate perimeter of a node in pixels
 */
export const calculatePerimeter = (node: Node): number => {
    const width = (node.style?.width as number) || 0;
    const height = (node.style?.height as number) || 0;
    return 2 * (width + height);
};

/**
 * Convert pixels to feet based on grid scale
 */
export const pixelsToFeet = (pixels: number, gridScale: number = 1, gridSize: number = 20): number => {
    // gridSize pixels = gridScale feet
    return (pixels / gridSize) * gridScale;
};

/**
 * Convert feet to pixels based on grid scale
 */
export const feetToPixels = (feet: number, gridScale: number = 1, gridSize: number = 20): number => {
    // gridScale feet = gridSize pixels
    return (feet / gridScale) * gridSize;
};

/**
 * Format measurement in pixels to real-world units
 */
export const formatMeasurement = (
    pixels: number,
    gridScale: number = 1,
    gridSize: number = 20,
    unit: 'ft' | 'm' = 'ft'
): string => {
    const feet = pixelsToFeet(pixels, gridScale, gridSize);

    if (unit === 'm') {
        const meters = feet * 0.3048; // Convert feet to meters
        return `${meters.toFixed(2)} m`;
    }

    return `${feet.toFixed(2)} ft`;
};

/**
 * Format area for display
 */
export const formatArea = (
    node: Node,
    gridScale: number = 1,
    gridSize: number = 20,
    unit: 'ft' | 'm' = 'ft'
): string => {
    const areaPx = calculateArea(node);
    const areaFt2 = Math.pow(pixelsToFeet(Math.sqrt(areaPx), gridScale, gridSize), 2);

    if (unit === 'm') {
        const areaM2 = areaFt2 * 0.092903; // Convert sq ft to sq m
        return `${areaM2.toFixed(2)} m²`;
    }

    return `${areaFt2.toFixed(2)} ft²`;
};

/**
 * Format perimeter for display
 */
export const formatPerimeter = (
    node: Node,
    gridScale: number = 1,
    gridSize: number = 20,
    unit: 'ft' | 'm' = 'ft'
): string => {
    const perimeterPx = calculatePerimeter(node);
    return formatMeasurement(perimeterPx, gridScale, gridSize, unit);
};
