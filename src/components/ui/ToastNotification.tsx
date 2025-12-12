import { memo } from 'react';

/**
 * ToastNotification - Toast notification system for user feedback
 */
interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
}

export const ToastNotification = memo(({ message, type = 'info', onClose }: ToastProps) => {
    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    return (
        <div
            className={`fixed bottom-4 right-4 ${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-from-bottom z-[10000]`}
            role="alert"
            aria-live="polite"
        >
            <span className="text-lg font-bold">{icons[type]}</span>
            <span className="text-sm">{message}</span>
            <button
                onClick={onClose}
                className="ml-4 text-white/80 hover:text-white"
                aria-label="Close notification"
            >
                ✕
            </button>
        </div>
    );
});

ToastNotification.displayName = 'ToastNotification';
