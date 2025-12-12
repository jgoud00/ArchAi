import { create } from 'zustand';

interface AutoSaveState {
    lastSaved: Date | null;
    isDirty: boolean;
    isSaving: boolean;
    autoSaveInterval: number;

    markDirty: () => void;
    markClean: () => void;
    setLastSaved: (date: Date) => void;
    setIsSaving: (saving: boolean) => void;
    setAutoSaveInterval: (interval: number) => void;
}

export const useAutoSaveStore = create<AutoSaveState>((set) => ({
    lastSaved: null,
    isDirty: false,
    isSaving: false,
    autoSaveInterval: 30000,

    markDirty: () => set({ isDirty: true }),
    markClean: () => set({ isDirty: false }),
    setLastSaved: (date) => set({ lastSaved: date, isDirty: false }),
    setIsSaving: (saving) => set({ isSaving: saving }),
    setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),
}));
