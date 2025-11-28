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

interface BlueprintState {
    nodes: Node[];
    edges: Edge[];
    layers: Layer[];
    activeLayerId: string;

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
