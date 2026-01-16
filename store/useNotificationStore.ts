import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface Confirmation {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
}

interface NotificationState {
    toasts: Toast[];
    confirmation: Confirmation | null;
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
    confirm: (options: Confirmation) => void;
    clearConfirmation: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    toasts: [],
    confirmation: null,

    addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { id, type, message }]
        }));

        // Auto remove
        setTimeout(() => get().removeToast(id), 5000);
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
        }));
    },

    confirm: (options) => {
        set({ confirmation: options });
    },

    clearConfirmation: () => {
        set({ confirmation: null });
    }
}));
