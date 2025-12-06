import { create } from 'zustand'
import { Node, Edge } from '@xyflow/react'

interface HistoryState {
    nodes: Node[]
    edges: Edge[]
}

interface TemporalState {
    past: HistoryState[]
    future: HistoryState[]
    push: (state: HistoryState) => void
    undo: (currentState: HistoryState) => HistoryState | null
    redo: (currentState: HistoryState) => HistoryState | null
    clear: () => void
}

export const useTemporalStore = create<TemporalState>((set, get) => ({
    past: [],
    future: [],
    push: (state) => {
        set((prev) => ({
            past: [...prev.past, state],
            future: [],
        }))
    },
    undo: (currentState) => {
        const { past, future } = get()
        if (past.length === 0) return null

        const previous = past[past.length - 1]
        const newPast = past.slice(0, past.length - 1)

        set({
            past: newPast,
            future: [currentState, ...future],
        })

        return previous
    },
    redo: (currentState) => {
        const { past, future } = get()
        if (future.length === 0) return null

        const next = future[0]
        const newFuture = future.slice(1)

        set({
            past: [...past, currentState],
            future: newFuture,
        })

        return next
    },
    clear: () => set({ past: [], future: [] }),
}))

