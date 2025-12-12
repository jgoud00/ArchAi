import { create } from 'zustand';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    addToast: (message: string, type?: Toast['type'], duration?: number) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],

    addToast: (message, type = 'info', duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, message, type, duration };

        set({ toasts: [...get().toasts, toast] });

        if (duration > 0) {
            setTimeout(() => {
                get().removeToast(id);
            }, duration);
        }
    },

    removeToast: (id) => {
        set({ toasts: get().toasts.filter(t => t.id !== id) });
    },

    clearAll: () => {
        set({ toasts: [] });
    },
}));
