import { create } from 'zustand';

interface ClipboardState {
    copiedNodes: any[];
    copyNodes: (nodes: any[]) => void;
    pasteNodes: (offsetX?: number, offsetY?: number) => any[];
    clearClipboard: () => void;
}

/**
 * Clipboard Store for Copy/Paste functionality
 */
export const useClipboardStore = create<ClipboardState>((set, get) => ({
    copiedNodes: [],

    copyNodes: (nodes) => {
        set({ copiedNodes: JSON.parse(JSON.stringify(nodes)) });
    },

    pasteNodes: (offsetX = 20, offsetY = 20) => {
        const { copiedNodes } = get();
        if (copiedNodes.length === 0) return [];

        // Create new nodes with offset positions and new IDs
        const pastedNodes = copiedNodes.map(node => ({
            ...JSON.parse(JSON.stringify(node)),
            id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            position: {
                x: node.position.x + offsetX,
                y: node.position.y + offsetY,
            },
            selected: true,
        }));

        return pastedNodes;
    },

    clearClipboard: () => {
        set({ copiedNodes: [] });
    },
}));
