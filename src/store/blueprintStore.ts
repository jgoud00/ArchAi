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
