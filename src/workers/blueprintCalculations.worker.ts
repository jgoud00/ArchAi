/**
 * Blueprint Calculations Web Worker
 * Offloads heavy computational tasks to prevent UI blocking
 */

// Types
interface CalculationMessage {
    type: 'calculate-bounds' | 'calculate-intersections' | 'calculate-distances' | 'calculate-areas';
    data: any;
}

interface CalculationResult {
    type: string;
    result: any;
}

// Worker message handler
self.onmessage = (e: MessageEvent<CalculationMessage>) => {
    const { type, data } = e.data;

    let result: any;

    switch (type) {
        case 'calculate-bounds':
            result = calculateBounds(data.nodes);
            break;

        case 'calculate-intersections':
            result = calculateIntersections(data.nodes);
            break;

        case 'calculate-distances':
            result = calculateDistances(data.points);
            break;

        case 'calculate-areas':
            result = calculateAreas(data.nodes);
            break;

        default:
            result = null;
    }

    const response: CalculationResult = {
        type,
        result,
    };

    self.postMessage(response);
};

/**
 * Calculate bounding box for all nodes
 */
function calculateBounds(nodes: any[]) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
        const width = node.style?.width || 100;
        const height = node.style?.height || 100;

        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + width);
        maxY = Math.max(maxY, node.position.y + height);
    });

    return { minX, minY, maxX, maxY };
}

/**
 * Calculate all node intersections
 */
function calculateIntersections(nodes: any[]) {
    const intersections: Array<{ node1: string; node2: string }> = [];

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const node1 = nodes[i];
            const node2 = nodes[j];

            const w1 = node1.style?.width || 100;
            const h1 = node1.style?.height || 100;
            const w2 = node2.style?.width || 100;
            const h2 = node2.style?.height || 100;

            // Check AABB collision
            const overlap = !(
                node1.position.x + w1 < node2.position.x ||
                node2.position.x + w2 < node1.position.x ||
                node1.position.y + h1 < node2.position.y ||
                node2.position.y + h2 < node1.position.y
            );

            if (overlap) {
                intersections.push({
                    node1: node1.id,
                    node2: node2.id,
                });
            }
        }
    }

    return intersections;
}

/**
 * Calculate distances between points
 */
function calculateDistances(points: Array<{ x: number; y: number }>) {
    const distances: number[] = [];

    for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i + 1].x - points[i].x;
        const dy = points[i + 1].y - points[i].y;
        distances.push(Math.sqrt(dx * dx + dy * dy));
    }

    return distances;
}

/**
 * Calculate areas for all nodes
 */
function calculateAreas(nodes: any[]) {
    return nodes.map(node => {
        const width = node.style?.width || 100;
        const height = node.style?.height || 100;
        return {
            id: node.id,
            area: width * height,
        };
    });
}

export { };
