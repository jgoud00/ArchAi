import { create } from 'zustand';

export interface HistoryEntry {
    id: string;
    timestamp: Date;
    nodes: any[];
    edges: any[];
    description: string;
}

interface VersionHistoryState {
    history: HistoryEntry[];
    maxHistory: number;

    addVersion: (nodes: any[], edges: any[], description?: string) => void;
    getVersion: (id: string) => HistoryEntry | undefined;
    restoreVersion: (id: string) => { nodes: any[]; edges: any[] } | null;
    clearHistory: () => void;
}

export const useVersionHistoryStore = create<VersionHistoryState>((set, get) => ({
    history: [],
    maxHistory: 50,

    addVersion: (nodes, edges, description = 'Auto-saved version') => {
        const entry: HistoryEntry = {
            id: `version-${Date.now()}`,
            timestamp: new Date(),
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
            description,
        };

        const history = [entry, ...get().history].slice(0, get().maxHistory);
        set({ history });
    },

    getVersion: (id) => {
        return get().history.find(v => v.id === id);
    },

    restoreVersion: (id) => {
        const version = get().getVersion(id);
        if (!version) return null;

        return {
            nodes: JSON.parse(JSON.stringify(version.nodes)),
            edges: JSON.parse(JSON.stringify(version.edges)),
        };
    },

    clearHistory: () => {
        set({ history: [] });
    },
}));
