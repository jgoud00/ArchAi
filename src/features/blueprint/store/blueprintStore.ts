import { create } from 'zustand';
import { temporal } from 'zundo';
import {
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Connection
} from '@xyflow/react';
import {
    getNodeBounds,
    calculateTrimmedBounds,
    calculateExtendedBounds
} from '@/utils/transformUtils';

export interface Layer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
}

export interface Measurement {
    id: string;
    startNode: string;
    endNode: string;
    label: string;
    distance: number;
}

export type CADTool = 'select' | 'line' | 'rectangle' | 'circle' | 'wall' | 'door' | 'window' | 'measure';

interface BlueprintState {
    nodes: Node[];
    edges: Edge[];
    layers: Layer[];
    activeLayerId: string;

    // CAD-specific state
    gridSize: number;
    gridScale: number;
    snapEnabled: boolean;
    objectSnapEnabled: boolean;
    selectedTool: CADTool;
    measurements: Measurement[];
    selectedNodeIds: string[];
    gridVisible: boolean;
    scale: string;

    // Actions
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: (connection: Connection) => void;
    addNode: (node: Node) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;

    // Layer Actions
    addLayer: (name: string) => void;
    toggleLayerVisibility: (id: string) => void;
    toggleLayerLock: (id: string) => void;
    setActiveLayer: (id: string) => void;
    deleteLayer: (id: string) => void;

    // CAD Actions
    setGridSize: (size: number) => void;
    setGridScale: (scale: number) => void;
    toggleSnap: () => void;
    toggleObjectSnap: () => void;
    toggleGridVisible: () => void;
    setSelectedTool: (tool: CADTool) => void;
    addMeasurement: (m: Measurement) => void;
    removeMeasurement: (id: string) => void;
    setSelectedNodes: (ids: string[]) => void;
    updateNodePosition: (id: string, x: number, y: number) => void;
    updateNodeSize: (id: string, width: number, height: number) => void;
    setScale: (scale: string) => void;

    // Transform Actions
    rotateNodes: (nodeIds: string[], angleDegrees: number, centerX?: number, centerY?: number) => void;
    scaleNodes: (nodeIds: string[], scaleX: number, scaleY: number, originX?: number, originY?: number) => void;
    arrayLinear: (nodeIds: string[], rows: number, columns: number, spacingX: number, spacingY: number) => void;
    arrayCircular: (nodeIds: string[], count: number, centerX: number, centerY: number, radius: number, angleRange?: number) => void;
    trimNodes: (nodeIds: string[]) => void;
    extendNodes: (nodeIds: string[]) => void;

    // Alignment Actions
    alignNodes: (nodeIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
    distributeNodes: (nodeIds: string[], direction: 'horizontal' | 'vertical') => void;

    // Group Actions
    groupNodes: (nodeIds: string[]) => void;
    ungroupNodes: (groupId: string) => void;
}

export const useBlueprintStore = create<BlueprintState>()(
    temporal(
        (set, get) => ({
            nodes: [],
            edges: [],
            layers: [
                { id: 'default', name: 'Default', visible: true, locked: false },
                { id: 'walls', name: 'Walls', visible: true, locked: false },
                { id: 'furniture', name: 'Furniture', visible: true, locked: false },
                { id: 'annotations', name: 'Annotations', visible: true, locked: false },
            ],
            activeLayerId: 'default',

            // CAD state initialization
            gridSize: 20,
            gridScale: 1,
            snapEnabled: true,
            objectSnapEnabled: false,
            selectedTool: 'select',
            measurements: [],
            selectedNodeIds: [],
            gridVisible: true,
            scale: '1:100',

            onNodesChange: (changes) => {
                set({
                    nodes: applyNodeChanges(changes, get().nodes),
                });
            },

            onEdgesChange: (changes) => {
                set({
                    edges: applyEdgeChanges(changes, get().edges),
                });
            },

            onConnect: (connection) => {
                set({
                    edges: addEdge(connection, get().edges),
                });
            },

            addNode: (node) => {
                const activeLayerId = get().activeLayerId;
                // Inject layer ID into node data
                const nodeWithLayer = {
                    ...node,
                    data: { ...node.data, layerId: activeLayerId },
                };
                set({ nodes: [...get().nodes, nodeWithLayer] });
            },

            setNodes: (nodes) => set({ nodes }),
            setEdges: (edges) => set({ edges }),

            addLayer: (name) => {
                const newLayer = {
                    id: name.toLowerCase().replace(/\s+/g, '-'),
                    name,
                    visible: true,
                    locked: false,
                };
                set({ layers: [...get().layers, newLayer] });
            },

            toggleLayerVisibility: (id) => {
                set({
                    layers: get().layers.map((l) =>
                        l.id === id ? { ...l, visible: !l.visible } : l
                    ),
                });
            },

            toggleLayerLock: (id) => {
                set({
                    layers: get().layers.map((l) =>
                        l.id === id ? { ...l, locked: !l.locked } : l
                    ),
                });
            },

            setActiveLayer: (id) => set({ activeLayerId: id }),

            deleteLayer: (id) => {
                if (id === 'default') return; // Prevent deleting default layer
                set({
                    layers: get().layers.filter((l) => l.id !== id),
                    activeLayerId: get().activeLayerId === id ? 'default' : get().activeLayerId,
                    // Remove nodes in this layer? Or move them to default? 
                    // For now, let's keep them but they might become "orphaned" visually if we filter by layer.
                    // Better approach: Move to default
                    nodes: get().nodes.map(n =>
                        n.data.layerId === id ? { ...n, data: { ...n.data, layerId: 'default' } } : n
                    )
                });
            },

            // CAD Actions
            setGridSize: (size) => set({ gridSize: size }),
            setGridScale: (scale) => set({ gridScale: scale }),
            toggleSnap: () => set({ snapEnabled: !get().snapEnabled }),
            toggleObjectSnap: () => set({ objectSnapEnabled: !get().objectSnapEnabled }),
            toggleGridVisible: () => set({ gridVisible: !get().gridVisible }),
            setSelectedTool: (tool) => set({ selectedTool: tool }),

            addMeasurement: (m) => set({ measurements: [...get().measurements, m] }),
            removeMeasurement: (id) => set({ measurements: get().measurements.filter(m => m.id !== id) }),

            setSelectedNodes: (ids) => set({ selectedNodeIds: ids }),

            updateNodePosition: (id, x, y) => {
                set({
                    nodes: get().nodes.map(node =>
                        node.id === id ? { ...node, position: { x, y } } : node
                    )
                });
            },

            updateNodeSize: (id, width, height) => {
                set({
                    nodes: get().nodes.map(node =>
                        node.id === id ? { ...node, style: { ...node.style, width, height } } : node
                    )
                });
            },

            setScale: (scale) => set({ scale }),

            // Transform Actions Implementation
            rotateNodes: (nodeIds, angleDegrees, centerX, centerY) => {
                const nodes = get().nodes;
                const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));

                // Import transform utils inline to avoid circular dependency
                const getCenter = () => {
                    if (centerX !== undefined && centerY !== undefined) {
                        return { x: centerX, y: centerY };
                    }
                    // Calculate center of selected nodes
                    const centers = selectedNodes.map(node => ({
                        x: node.position.x + ((node.style?.width as number) || 100) / 2,
                        y: node.position.y + ((node.style?.height as number) || 100) / 2,
                    }));
                    return {
                        x: centers.reduce((sum, p) => sum + p.x, 0) / centers.length,
                        y: centers.reduce((sum, p) => sum + p.y, 0) / centers.length,
                    };
                };

                const center = getCenter();
                const angleRadians = (angleDegrees * Math.PI) / 180;
                const cos = Math.cos(angleRadians);
                const sin = Math.sin(angleRadians);

                const rotatedNodes = nodes.map(node => {
                    if (!nodeIds.includes(node.id)) return node;

                    const width = (node.style?.width as number) || 100;
                    const height = (node.style?.height as number) || 100;

                    // Get node center
                    const nodeCenterX = node.position.x + width / 2;
                    const nodeCenterY = node.position.y + height / 2;

                    // Translate to origin
                    const translatedX = nodeCenterX - center.x;
                    const translatedY = nodeCenterY - center.y;

                    // Rotate
                    const rotatedX = translatedX * cos - translatedY * sin;
                    const rotatedY = translatedX * sin + translatedY * cos;

                    // Translate back and adjust for top-left position
                    const newX = center.x + rotatedX - width / 2;
                    const newY = center.y + rotatedY - height / 2;

                    return {
                        ...node,
                        position: { x: newX, y: newY },
                    };
                });

                set({ nodes: rotatedNodes });
            },

            scaleNodes: (nodeIds, scaleX, scaleY, originX, originY) => {
                const nodes = get().nodes;
                const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));

                // Calculate origin if not provided (center of selection)
                const getOrigin = () => {
                    if (originX !== undefined && originY !== undefined) {
                        return { x: originX, y: originY };
                    }
                    const centers = selectedNodes.map(node => ({
                        x: node.position.x + ((node.style?.width as number) || 100) / 2,
                        y: node.position.y + ((node.style?.height as number) || 100) / 2,
                    }));
                    return {
                        x: centers.reduce((sum, p) => sum + p.x, 0) / centers.length,
                        y: centers.reduce((sum, p) => sum + p.y, 0) / centers.length,
                    };
                };

                const origin = getOrigin();

                const scaledNodes = nodes.map(node => {
                    if (!nodeIds.includes(node.id)) return node;

                    const width = (node.style?.width as number) || 100;
                    const height = (node.style?.height as number) || 100;

                    // Scale position relative to origin
                    const newX = origin.x + (node.position.x - origin.x) * scaleX;
                    const newY = origin.y + (node.position.y - origin.y) * scaleY;

                    // Scale size
                    const newWidth = width * scaleX;
                    const newHeight = height * scaleY;

                    return {
                        ...node,
                        position: { x: newX, y: newY },
                        style: { ...node.style, width: newWidth, height: newHeight },
                    };
                });

                set({ nodes: scaledNodes });
            },

            arrayLinear: (nodeIds, rows, columns, spacingX, spacingY) => {
                const nodes = get().nodes;
                const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));
                const newNodes: Node[] = [];

                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < columns; col++) {
                        // Skip first position (original nodes)
                        if (row === 0 && col === 0) continue;

                        selectedNodes.forEach(node => {
                            const newNode = {
                                ...node,
                                id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                position: {
                                    x: node.position.x + col * spacingX,
                                    y: node.position.y + row * spacingY,
                                },
                            };
                            newNodes.push(newNode);
                        });
                    }
                }

                set({ nodes: [...nodes, ...newNodes] });
            },

            arrayCircular: (nodeIds, count, centerX, centerY, radius, angleRange = 360) => {
                const nodes = get().nodes;
                const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));
                const newNodes: Node[] = [];

                const angleStep = angleRange / count;

                for (let i = 0; i < count; i++) {
                    const angle = (i * angleStep) * (Math.PI / 180);
                    const offsetX = radius * Math.cos(angle);
                    const offsetY = radius * Math.sin(angle);

                    selectedNodes.forEach(node => {
                        // Calculate node dimensions
                        const nodeWidth = (node.style?.width as number) || 100;
                        const nodeHeight = (node.style?.height as number) || 100;

                        // New center position on circle
                        const newCenterX = centerX + offsetX;
                        const newCenterY = centerY + offsetY;

                        // Convert back to top-left position
                        const newX = newCenterX - nodeWidth / 2;
                        const newY = newCenterY - nodeHeight / 2;

                        const newNode = {
                            ...node,
                            id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
                            position: { x: newX, y: newY },
                        };
                        newNodes.push(newNode);
                    });
                }

                set({ nodes: [...nodes, ...newNodes] });
            },

            trimNodes: (nodeIds) => {
                if (nodeIds.length < 2) return;

                const nodes = get().nodes;
                const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));

                // Trim the first selected node against all others
                const targetNode = selectedNodes[0];
                const otherNodes = selectedNodes.slice(1);

                let targetBounds = getNodeBounds(targetNode);

                // Apply trim against each overlapping node
                for (const otherNode of otherNodes) {
                    const otherBounds = getNodeBounds(otherNode);
                    const trimmedBounds = calculateTrimmedBounds(targetBounds, otherBounds);

                    if (trimmedBounds) {
                        targetBounds = trimmedBounds;
                    }
                }

                // Update the target node with the new bounds
                const updatedNodes = nodes.map(node => {
                    if (node.id === targetNode.id) {
                        return {
                            ...node,
                            position: { x: targetBounds.x, y: targetBounds.y },
                            style: {
                                ...node.style,
                                width: targetBounds.width,
                                height: targetBounds.height
                            },
                        };
                    }
                    return node;
                });

                set({ nodes: updatedNodes });
            },

            extendNodes: (nodeIds) => {
                if (nodeIds.length < 2) return;

                const nodes = get().nodes;
                const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));

                // Extend the first selected node towards the second
                const targetNode = selectedNodes[0];
                const boundaryNode = selectedNodes[1];

                const targetBounds = getNodeBounds(targetNode);
                const boundaryBounds = getNodeBounds(boundaryNode);

                const extendedBounds = calculateExtendedBounds(targetBounds, boundaryBounds);

                // Update the target node with the new bounds
                const updatedNodes = nodes.map(node => {
                    if (node.id === targetNode.id) {
                        return {
                            ...node,
                            position: { x: extendedBounds.x, y: extendedBounds.y },
                            style: {
                                ...node.style,
                                width: extendedBounds.width,
                                height: extendedBounds.height
                            },
                        };
                    }
                    return node;
                });

                set({ nodes: updatedNodes });
            },

            // Alignment methods
            alignNodes: (nodeIds, alignment) => {
                if (nodeIds.length < 2) return;

                const nodes = get().nodes;
                const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));

                // Calculate alignment reference point
                let refValue = 0;

                switch (alignment) {
                    case 'left': {
                        refValue = Math.min(...selectedNodes.map(n => n.position.x));
                        break;
                    }
                    case 'center': {
                        const leftmost = Math.min(...selectedNodes.map(n => n.position.x));
                        const rightmost = Math.max(...selectedNodes.map(n => n.position.x + ((n.style?.width as number) || 100)));
                        refValue = (leftmost + rightmost) / 2;
                        break;
                    }
                    case 'right': {
                        refValue = Math.max(...selectedNodes.map(n => n.position.x + ((n.style?.width as number) || 100)));
                        break;
                    }
                    case 'top': {
                        refValue = Math.min(...selectedNodes.map(n => n.position.y));
                        break;
                    }
                    case 'middle': {
                        const topmost = Math.min(...selectedNodes.map(n => n.position.y));
                        const bottommost = Math.max(...selectedNodes.map(n => n.position.y + ((n.style?.height as number) || 100)));
                        refValue = (topmost + bottommost) / 2;
                        break;
                    }
                    case 'bottom': {
                        refValue = Math.max(...selectedNodes.map(n => n.position.y + ((n.style?.height as number) || 100)));
                        break;
                    }
                }

                // Apply alignment
                const alignedNodes = nodes.map(node => {
                    if (!nodeIds.includes(node.id)) return node;

                    const width = (node.style?.width as number) || 100;
                    const height = (node.style?.height as number) || 100;
                    let newX = node.position.x;
                    let newY = node.position.y;

                    switch (alignment) {
                        case 'left':
                            newX = refValue;
                            break;
                        case 'center':
                            newX = refValue - width / 2;
                            break;
                        case 'right':
                            newX = refValue - width;
                            break;
                        case 'top':
                            newY = refValue;
                            break;
                        case 'middle':
                            newY = refValue - height / 2;
                            break;
                        case 'bottom':
                            newY = refValue - height;
                            break;
                    }

                    return { ...node, position: { x: newX, y: newY } };
                });

                set({ nodes: alignedNodes });
            },

            distributeNodes: (nodeIds, direction) => {
                if (nodeIds.length < 3) return;

                const nodes = get().nodes;
                const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));

                // Sort nodes by position
                const sortedNodes = [...selectedNodes].sort((a, b) => {
                    if (direction === 'horizontal') {
                        return a.position.x - b.position.x;
                    } else {
                        return a.position.y - b.position.y;
                    }
                });

                const first = sortedNodes[0];
                const last = sortedNodes[sortedNodes.length - 1];

                // Calculate spacing
                let totalSpace: number;
                if (direction === 'horizontal') {
                    const firstRight = first.position.x + ((first.style?.width as number) || 100);
                    totalSpace = last.position.x - firstRight;
                } else {
                    const firstBottom = first.position.y + ((first.style?.height as number) || 100);
                    totalSpace = last.position.y - firstBottom;
                }

                const gap = totalSpace / (sortedNodes.length - 1);

                // Distribute nodes
                const currentPos = direction === 'horizontal'
                    ? first.position.x + ((first.style?.width as number) || 100)
                    : first.position.y + ((first.style?.height as number) || 100);

                const distributedNodes = nodes.map(node => {
                    const index = sortedNodes.findIndex(n => n.id === node.id);
                    if (index === -1 || index === 0 || index === sortedNodes.length - 1) return node;

                    if (direction === 'horizontal') {
                        const newX = currentPos + gap * index;
                        return { ...node, position: { x: newX, y: node.position.y } };
                    } else {
                        const newY = currentPos + gap * index;
                        return { ...node, position: { x: node.position.x, y: newY } };
                    }
                });

                set({ nodes: distributedNodes });
            },

            groupNodes: (nodeIds) => {
                if (nodeIds.length < 2) return;

                const nodes = get().nodes;

                // Create group ID
                const groupId = `group-${Date.now()}`;

                // Mark nodes as grouped
                const groupedNodes = nodes.map(node => {
                    if (!nodeIds.includes(node.id)) return node;
                    return {
                        ...node,
                        data: { ...node.data, groupId }
                    };
                });

                set({ nodes: groupedNodes });
            },

            ungroupNodes: (groupId) => {
                const nodes = get().nodes;
                const ungroupedNodes = nodes.map(node => {
                    if (node.data.groupId === groupId) {
                        const { groupId: _groupId, ...restData } = node.data; // Rename to _groupId
                        return { ...node, data: restData };
                    }
                    return node;
                });

                set({ nodes: ungroupedNodes });
            },
        }),
        {
            limit: 100, // Limit history depth
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
                layers: state.layers,
            }), // Only save these fields in history
        }
    )
);
